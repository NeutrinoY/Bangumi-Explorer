# Bangumi Explorer

> [**简体中文**](./README_CN.md) | English

> A bespoke, minimalist anime collection manager built for the obsessed collector.

![Project Preview](./web-ui/public/icon.png)

## 📖 The Story

I have a habit—some might call it an obsession—of collecting anime.

Over the years, my local **Emby** server has grown to house over **1,000 titles**, covering almost every mainstream classic you can name. But as the collection grew, so did the anxiety of "what am I missing?". There are countless niche gems and forgotten masterpieces buried in the depths of Bangumi.tv that I hadn't archived yet.

**The Pain Point:**
Previously, my workflow was raw and industrial. I used Python scripts to scrape data, dumping JSONs into **Excel** spreadsheets to cross-reference with my local files. It worked, but it was ugly. Staring at endless rows of dry text cells killed the joy of discovery. Excel's filtering was powerful but clunky, and it lacked the visual connection to the artwork.

**The Solution:**
I decided to build a dedicated tool to bridge the gap. **Bangumi Explorer** is my answer to the question: *"What should I collect next?"*

It replaces the cold spreadsheets with a fluid, visual interface designed for high-efficiency curation. It's not just about data; it's about the experience of browsing anime history.

---

## ✨ Philosophy & Features

The core goal of this project is **"Gap Analysis"**—identifying what I have versus what exists, in the most elegant way possible.

### 1. Visual Curation over Spreadsheets
Instead of text rows, data is presented as rich, visual cards.
- **Green Badge**: Represents "Collected" (Synced with my Emby library).
- **Gray/Red**: Represents "Ignored" or "Todo".
This visual language makes it instantly obvious which eras or genres in my collection have holes that need filling.

### 2. Multi-Dimensional Filtering (The "Lens")
I designed a filtering system that goes beyond simple search. It features **Smart Presets** based on my personal collecting logic:
- **💎 Modern Gems**: High-rated, non-mainstream works from the last decade.
- **⏳ Retro Classics**: Golden age anime (pre-2005) that define the medium.
- **🔥 Modern Hits**: The popular blockbusters.
- **🎬 Movie Hits**: Feature-length masterpieces.

These presets allow me to slice through thousands of entries instantly to find "High scoring, low vote count" hidden gems or "High popularity" essentials I somehow missed.

### 3. Dual-Mode Persistence (Supabase)
- **Guest Mode (Public)**: Visitors can explore the database and see my collection status (Read-Only).
- **Admin Mode (Private)**: A secure, password-protected mode where I can mark titles as `Collected`, `Wishlist`, or `Ignored`.
- **Cloud Native**: Data is stored in **Supabase**, ensuring my curation efforts are permanent and accessible from any device, anywhere. No more "local file lost" anxiety.

### 4. Frictionless Detail Access
A streamlined detail view provides key metrics (Score, Rank, Votes, EPS, Date) at a glance, with direct deep-links to the source Bangumi page. The flow from *Discovery* -> *Analysis* -> *Source Check* is now seamless.

---

## 🛠️ Tech Stack

This project is built with a focus on performance and visual smoothness.

- **Framework**: [Next.js 15](https://nextjs.org/) (App Router)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) (Minimalist, Dark Mode)
- **Database & Auth**: [Supabase](https://supabase.com/) (PostgreSQL + RLS)
- **Motion**: [Framer Motion](https://www.framer.com/motion/) (Fluid interactions)
- **Icons**: [Lucide React](https://lucide.dev/)

---

## 🚀 Future Roadmap

Currently, the status marking is manual—and I actually prefer it that way. It forces me to consciously review each title.

- **Automated Sync**: In the future, I might implement a script to auto-scan my Emby library and sync the status to Supabase via fuzzy matching. But for now, the manual "gardening" of the collection is part of the fun.
- **More Analytics**: Visualizing the distribution of my collection by year or genre.

---

> *"Data is just noise until you give it structure and soul."*