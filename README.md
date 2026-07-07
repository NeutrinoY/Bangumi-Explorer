<div align="center">
  <img src="docs/images/logo.png" width="120" alt="Bangumi Explorer Logo">
  <h1>Bangumi Explorer</h1>
  <p><strong>A minimalist, modern anime discovery and collection manager.</strong></p>

  <p>
    <a href="https://bangumi-explorer.neutrinoy.xyz"><img src="https://img.shields.io/badge/Website-bangumi--explorer.neutrinoy.xyz-blue?style=for-the-badge&logo=vercel" alt="Website"></a>
    <a href="https://github.com/NeutrinoY/Bangumi-Explorer/actions"><img src="https://img.shields.io/github/actions/workflow/status/NeutrinoY/Bangumi-Explorer/update-db.yml?style=for-the-badge&label=Data%20Sync" alt="Data Sync"></a>
  </p>

  <p>
    <b>English</b> | <a href="./README_CN.md">中文</a>
  </p>
</div>

<br/>

<div align="center">
  <img src="docs/images/preview-1.webp" width="100%" alt="Home Page - Masonry Layout" style="margin-bottom: 10px;">
  <br/>
  <img src="docs/images/preview-2.webp" width="100%" alt="Advanced Filtering System" style="margin-bottom: 10px;">
  <br/>
  <img src="docs/images/preview-3.webp" width="100%" alt="Immersive Detail View">
</div>

---

## 📖 Background: From Excel to Explorer

As a dedicated anime collector, my local **Emby** library houses over **1,000 titles**. As the collection grew, maintaining this massive library became a challenge—not just managing what I *had*, but identifying what I was *missing*.

My early workflow was primitive: Python scripts processing scraped Bangumi data, dumped into Excel after cleaning. While Excel's filtering is powerful, staring at thousands of rows of cold text offered no joy in browsing the art form. Furthermore, manually cross-referencing local inventory with online databases was a tedious, soul-crushing process.

**[Bangumi Explorer](https://bangumi-explorer.neutrinoy.xyz)** was born from this need. I wanted to make the process elegant, intuitive, and efficient. It is not just a database; it is a private **"Curator's Gallery"** for anime.

---

## ✨ Core Features

### 1. A Modern Bangumi Experience (For Guests)
Even without the collection features, this project serves as a **blazing fast, third-party frontend for Bangumi**.
*   **Instant Interaction**: Built on Next.js, leveraging localized indexing for near-zero latency search and filtering—far faster than traditional page loads.
*   **Visual-First**: Immersive dark mode and card-based design focus on posters and key metrics (Score, Rank, Year), eliminating redundant noise.
*   **Responsive**: Meticulously designed layout that delivers a silky-smooth experience on everything from 4K desktop monitors to mobile screens.

### 2. Visual Gap Analysis
This project transforms dry data comparison into a visual language. Through color-coded badges, I can instantly scan a specific year or genre and spot the "holes" in my collection map, allowing for rapid gap analysis.
*   **Status Badges**:
    *   🟢 **Collected**: Synced with Emby/Local library.
    *   🔵 **Wishlist**: Potential targets for future acquisition.
    *   🔴 **Ignored**: Confirmed as not interested.
    *   ⚪ **Todo**: Unassessed entries.

### 3. Multi-Dimensional Lens
To satisfy diverse curation needs, I implemented an advanced filtering system beyond simple search, featuring **6 Logic Presets** and **Fine-grained Controls**:

*   **⚡ Smart Presets**:
    *   **🔥 Modern Hits / 🎬 Movie Hits**: Quickly locate high-popularity blockbusters.
    *   **💎 Modern Gems / 🎬 Movie Gems**: Filter for "High Score, Low Vote Count" titles—unearthing hidden masterpieces.
    *   **⏳ Retro Classics / ⚡ Retro Cult**: One-click focus on Golden Age (pre-2005) standards and cult classics.
*   **📏 Scope Control**:
    *   **Max 52 Eps**: Filter out long-running franchises to focus on concise narratives.
    *   **> 1 Ep**: Filter out single-episode OVAs/Movies to focus on series.
*   **📅 Seasonal Index**: When a specific year (e.g., 2025) is locked, a **Seasonal Selector** (Winter/Spring/Summer/Fall) automatically appears for precise quarterly tracking.

### 4. Backend Architecture
*   **Supabase Backend**: Uses Supabase (PostgreSQL) to store collection status, enforced by RLS (Row Level Security) policies.
*   **Dual Access**:
    *   **Guest Mode**: Publicly readable, sharing my personal taste and collection list.
    *   **Admin Mode**: Password-protected write access to ensure data integrity.

---

## 🔄 Data Pipeline & ETL (Automated)

The data foundation of this project is derived from the open-source project [Jinrxin/bangumi-data](https://github.com/Jinrxin/bangumi-data). Special thanks to the author for the crawler work that provides the comprehensive Bangumi dataset.

**Fully Automated via GitHub Actions:**
The system is now completely self-sustaining:
1.  **Daily Sync**: Automatically checks the upstream repository for updates every day (UTC 0:00).
2.  **Internal ETL**: Runs the TypeScript ETL (`etl/merge.ts`, schema-validated with zod) to Extract, Transform, and Load the raw data.
3.  **Auto Deploy**: Commits the fresh artifacts (`index.json` + per-subject detail files) to the repo, triggering a Vercel rebuild automatically.

Data remains "fresh" without any manual intervention.

---

## 📝 Changelog

### 2026-07 · Deep Refactor

A ground-up rebuild of the internals while keeping the product experience intact:

*   **Instant first paint**: The homepage is now statically rendered at build time — no more loading spinner before anything appears. The 10MB database file was split into a ~2MB browse index plus on-demand per-subject detail files.
*   **Feature-first architecture**: `explorer` / `collection` / `auth` features each own their pure domain logic, side-effect hooks, and components. All defaults and constants have a single source of truth.
*   **Type-safe data pipeline**: The ETL is TypeScript and shares its output types with the frontend; upstream data is validated with zod at build time.
*   **Touch-first polish**: 44px touch targets, dvh viewport units, safe-area insets, numeric keyboards, and back-button-closes-modal on mobile.
*   **Honest error feedback**: Failed cloud syncs now roll back *and* notify, instead of failing silently.

### 2026-06 · Architecture Refresh

After the first version took shape on **January 9, 2026**, the browsing experience and collection workflow had already become stable. This update does not redesign the interface or change the spirit of the project. Instead, it focuses on the internals: making the codebase clearer, more reliable, and easier to maintain over time.

*   **Clearer domain boundaries**: Filtering, sorting, URL state, and collection state have been separated from the page layer, keeping the interface fluid while making the core logic easier to reason about.
*   **A more modern engineering baseline**: The quality and formatting workflow is now leaner, with focused tests around the logic that matters most for browsing and curation.
*   **A sturdier data flow**: The internal ETL path has been reshaped so Bangumi data transformation is easier to validate and less opaque during automated syncs.
*   **Pragmatic backend hardening**: Supabase remains the lightweight backend for collection state, with a few important details tightened around admin detection and failed cloud sync recovery.

---

## 🛠️ Tech Stack

Built on the latest generation of the Web ecosystem, pursuing extreme performance and developer experience.

*   **Frontend**: Next.js
*   **Styling**: Tailwind CSS, Framer Motion
*   **Backend / Auth**: Supabase
*   **Icons**: Lucide React

---

> *"Data is just noise until you give it structure and soul."*
