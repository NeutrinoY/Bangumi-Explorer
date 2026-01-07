# Bangumi Explorer

> 一个极简、现代化的番剧数据探索与收藏管理工具。
> 

![Project Preview](./public/icon.png)
*(这里建议后续放一张展示“瀑布流卡片”或“详情页”的高清截图)*

---

## 📖 背景故事：从 Excel 到 Explorer

作为一个重度的番剧收藏爱好者，我的本地 **Emby** 媒体库已经收录了**千余部作品**。随着收藏量的增长，维护这个庞大的库逐渐变成了一个难题——我不仅需要管理“已有的”，更需要知道我“还未收录什么”。

早期的解决方案非常原始：编写 Python 脚本处理抓取好的 Bangumi 数据，清洗后导入 Excel。虽然 Excel 筛选功能强大，但面对成千上万行冰冷的文字，完全体会不到浏览艺术作品的乐趣。而且，手动比对本地库存与线上数据是一个极其枯燥的过程。

**Bangumi Explorer** 因此诞生。我想把这个过程变得优雅、直观且高效。它不只是一个数据库，更是一个私人的“番剧策展馆”。

---

## ✨ 核心功能与特性

### 1. 现代化 Bangumi 浏览体验 (For Guests)
即使不作为收藏工具，本项目也是一个**极致流畅的 Bangumi 第三方前端**。
*   **极速交互**：基于 Next.js 构建，配合本地化索引，提供近乎“零延迟”的搜索与筛选体验，远快于传统网页加载。
*   **视觉优先**：采用深色模式与沉浸式卡片设计，专注于海报与关键信息（评分、排名、播出年份）的展示，摒弃冗余干扰。
*   **移动端适配**：精心设计的响应式布局，无论在 4K 桌面显示器还是手机上，都能获得一致的丝滑体验。

### 2. 可视化差异分析 (Gap Analysis)
本项目将枯燥的数据比对转化为了直观的视觉语言。通过颜色标记，我能一眼扫视出某个年份或流派中，我的收藏版图还存在哪些“缺口”，从而快速查漏补缺。
*   **状态标记**：
    *   🟢 **已收藏 (Collected)**：与 Emby/本地库同步，代表已入库。
    *   🔵 **想看 (Wishlist)**：潜在的收藏目标，加入愿望单。
    *   🔴 **搁置 (Ignored)**：确认不感兴趣的作品。
    *   ⚪ **待办 (Todo)**：尚未评估的条目。

### 3. 多维筛选透镜
为了满足多元化的筛选需求，我内置了一套超越简单搜索的高级筛选系统，涵盖了 **6 种逻辑预设** 与 **精细化控制**：

*   **⚡ 智能预设 (Smart Presets)**：
    *   **🔥 Modern Hits / 🎬 Movie Hits**：快速定位高人气的热门必看作。
    *   **💎 Modern Gems / 🎬 Movie Gems**：筛选“高分但低票数”的冷门神作。
    *   **⏳ Retro Classics / ⚡ Retro Cult**：一键聚焦 2005 年以前的黄金时代标杆与冷门作品。
*   **📏 篇幅控制**：
    *   **Max 52 Eps**：排除长篇民工漫，专注于中短篇精品。
    *   **> 1 Ep**：排除单集剧场版/OVA，专注于剧集。
*   **📅 新番索引**：当锁定特定年份时（如 2025），自动激活**季节筛选器**（Winter/Spring/Summer/Fall），方便按季度追番。

### 4. 后端架构
*   **Supabase 后端**：利用 Supabase (PostgreSQL) 存储我的收藏状态，支持 RLS (Row Level Security) 策略。
*   **双重权限**：
    *   **游客模式**：全网公开可读，分享个人收藏清单。
    *   **管理员模式**：基于密码的私有写入权限，确保数据安全。

---

## 🔄 数据流与自动化 (ETL)

本项目的数据底座源自开源项目 [Jinrxin/bangumi-data](https://github.com/Jinrxin/bangumi-data)。在此特别感谢原作者的爬虫工作，为本项目提供了详尽的 Bangumi 基础数据。

**自动化规划：**
目前系统使用静态 JSON 数据。未来计划引入 **GitHub Actions** 自动化流程：

1.  监听上游仓库的数据更新。
2.  触发本项目内的 `merge.cjs` 脚本进行 ETL (Extract, Transform, Load) 处理。
3.  自动构建并部署最新的 `db.json` 到前端。
这将实现数据的“自动保鲜”，无需手动维护基础数据库。

---

## 🛠️ 技术栈

本项目基于最新一代 Web 技术栈构建，追求极致的性能与开发体验。

*   **Frontend**: [Next.js 16](https://nextjs.org/) (App Router), [React](https://react.dev/), [TypeScript](https://www.typescriptlang.org/)
*   **Styling**: [Tailwind CSS](https://tailwindcss.com/), [Framer Motion](https://www.framer.com/motion/)
*   **Backend / Auth**: [Supabase](https://supabase.com/)
*   **Icons**: [Lucide React](https://lucide.dev/)

---

> *"数据只是噪音，直到你赋予它结构与灵魂。"*
