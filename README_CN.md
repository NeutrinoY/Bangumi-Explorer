<div align="center">
  <img src="docs/images/logo.png" width="120" alt="Bangumi Explorer Logo">
  <h1>Bangumi Explorer</h1>
  <p><strong>极简、现代化的番剧数据探索与收藏管理工具。</strong></p>

  <p>
    <a href="https://bangumi-explorer.neutrinoy.xyz"><img src="https://img.shields.io/badge/Website-bangumi--explorer.neutrinoy.xyz-blue?style=for-the-badge&logo=vercel" alt="Website"></a>
    <a href="https://github.com/NeutrinoY/Bangumi-Explorer/actions"><img src="https://img.shields.io/github/actions/workflow/status/NeutrinoY/Bangumi-Explorer/update-db.yml?style=for-the-badge&label=Data%20Sync" alt="Data Sync"></a>
  </p>
  <p>
    <a href="./README.md">English</a> | <b>中文</b>
  </p>

</div>

<br/>

<div align="center">
  <img src="docs/images/preview-1.webp" width="100%" alt="首页瀑布流" style="margin-bottom: 10px;">
  <br/>
  <img src="docs/images/preview-2.webp" width="100%" alt="高级筛选系统" style="margin-bottom: 10px;">
  <br/>
  <img src="docs/images/preview-3.webp" width="100%" alt="沉浸式详情页">
</div>

---

## 📖 背景故事：从 Excel 到 Explorer

作为一个重度的番剧收藏爱好者，我的本地 **Emby** 媒体库已经收录了**千余部作品**。随着收藏量的增长，维护这个庞大的库逐渐变成了一个难题——我不仅需要管理“已有的”，更需要知道我“还未收录什么”。

早期的解决方案非常原始：编写 Python 脚本处理抓取好的 Bangumi 数据，清洗后导入 Excel。虽然 Excel 筛选功能强大，但面对成千上万行冰冷的文字，完全体会不到浏览艺术作品的乐趣。而且，手动比对本地库存与线上数据是一个极其枯燥的过程。

**[Bangumi Explorer](https://bangumi-explorer.neutrinoy.xyz)** 因此诞生。我想把这个过程变得优雅、直观且高效。它不只是一个数据库，更是一个私人的“番剧策展馆”。

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

**完全自动化的 GitHub Actions 工作流：**
目前系统已实现全自动运行：

1.  **每日同步**：每天 (UTC 0:00) 自动检查上游仓库的数据更新。
2.  **内部 ETL**：触发本项目内的 `merge.cjs` 脚本进行数据清洗与格式化 (Extract, Transform, Load)。
3.  **自动部署**：将最新的 `db.json` 提交至仓库，并自动触发 Vercel 重新构建。

这确保了数据的“自动保鲜”，全程无需人工干预。

---

## 🛠️ 技术栈

本项目基于最新一代 Web 技术栈构建，追求极致的性能与开发体验。

*   **Frontend**: Next.js
*   **Styling**: Tailwind CSS, Framer Motion
*   **Backend / Auth**: Supabase
*   **Icons**: Lucide React

---

> *"数据只是噪音，直到你赋予它结构与灵魂。"*
