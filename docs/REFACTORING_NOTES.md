# REFACTORING_NOTES · 2026-07 深度重构

结构性决策记录。体验基线见 BASELINE.md，用户可见变化见 UX_CHANGELOG.md。

## 架构决策

### 1. feature-first 目录（放弃 layer-first）
`src/features/{explorer,collection,auth}` + `src/shared/{ui,data}`。改一个功能只碰一个目录。functional core / imperative shell 内化到每个 feature：`domain/` 纯函数 → `use-*.ts` 副作用 → `components/` 展示。

### 2. 温和 RSC（放弃纯 SPA 与全面服务端化）
`page.tsx` 是唯一 Server Component：构建时读 index.json，静态渲染第一页卡片。交互全部在 `ExplorerApp` client 岛屿内。筛选逻辑保持纯客户端——零延迟是产品卖点，不上服务器。

### 3. 数据拆分：index + details 分片（放弃 10MB 单文件）
- `public/data/index.json`（~2.1MB）：浏览/筛选/搜索/排序所需全部字段。
- `public/data/details/{id}.json`（~6400 个小文件）：简介、评分分布、社区统计、tags、外链。
- 详情按需 fetch，Map 缓存 Promise（并发去重；失败驱逐防污染）。
- 放弃哈希分桶：一 id 一文件的 CDN 缓存粒度最优、实现最简。
- staff 字段（studio/director/writer）留在 index：搜索要覆盖它们。

### 4. ETL 用 TS 重写，与前端共享类型
`etl/` 用 tsx 运行；`SubjectIndex`/`SubjectDetail` 类型定义在 `src/shared/data/subject.ts`，是 ETL 与前端的唯一契约。zod 只出现在 ETL（上游输入校验），不进客户端 bundle。守卫：>1% 文件校验失败即 abort（上游格式变更信号）；按 id 去重（上游有重复条目）。

### 5. 状态：单 reducer + URL 投影（放弃 8 个零散 useState + 12 参数 useUrlSync）
`explorerReducer` 承载全部状态转移，跨字段规则（改筛选→回第一页、年份非单年→清季节、类型不可清空）显式写在 reducer 里而非组件 effect。URL 是防抖 300ms 的持久化投影，用 `history.replaceState` 而非 router.replace（避免触发 RSC 管线）。初始状态从 URL lazy-init，只读一次。

### 6. 不引入的依赖及理由
- SWR/TanStack Query：静态不可变 JSON + Map 缓存足够。
- nuqs：URL 编解码是领域纯函数（项目质量最高的部分），保留框架无关。
- zustand/jotai：单页面单 reducer 足够。
- 虚拟滚动：分页锁 60 卡/页，无渲染瓶颈。

## 遗留约束

- `isEpsFilterApplicable`：eps 筛选仅在纯 Movie 视图禁用（所有者拍板）。预设不触碰 eps（"Max 52 Eps" 可与预设叠加）。
- 详情弹窗 pushState 一层历史实现返回键关闭；关闭时若非 popstate 触发则 history.back() 平账。嵌套弹窗需注意（当前无嵌套场景）。
- Login 弹窗 email 固定来自 `NEXT_PUBLIC_ADMIN_EMAIL`，UI 只收密码（沿袭旧设计）。
- 本地 `public/data/` 由旧 db.json 快照转换生成；CI 首跑后被上游真实数据覆盖。
- `legacy-backup/` 已删除；旧实现看 git 历史（commit 78e9a8b 及之前）。

## 未来建议（不在本次范围）

1. 详情页独立可分享 URL（`/subject/326` 或 `?detail=326`）——product-change，需确认承载方式。
2. index.json 若继续增长可考虑 gzip 预压缩或按年代分片。
3. 虚拟滚动——若未来取消分页。
4. 筛选面板移动端底部抽屉形态——需产品确认。
5. Supabase 类型生成（supabase gen types）替代手写 CollectionRow。
