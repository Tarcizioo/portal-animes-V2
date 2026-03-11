# Portal Animes V2

Portal Animes V2 is a modern, full-featured anime discovery and tracking web application built with **React 19** and **Firebase**. It provides a rich, social experience — from personalized library tracking to public profiles, detailed statistics, and community interaction — all powered by real-time data from the **Jikan API**.

**🌐 Live Demo:** [https://portal-animes-v2.vercel.app/](https://portal-animes-v2.vercel.app/)

---

## ✨ Features

### 🔐 Authentication & Account
- **Google Sign-In** — Secure, one-click authentication via Firebase.
- **Account Management** — Delete your account permanently from the Settings panel (with confirmation safeguard).

---

### 👤 User Profile & Customization
- **Profile Page** — Personalized page showing your bio, stats, favorite animes, and achievements.
- **Profile Editing** — Update your display name, bio, and social links at any time.
- **Profile Banner & Avatar** — Upload and crop a custom profile photo directly in-browser using `react-image-crop`.
- **Favorite Animes Widget** — Showcase up to 3 hand-picked favorites prominently on your profile, reorderable via drag-and-drop.
- **Favorite Studios** — Highlight your favorite animation studios.
- **Profile Sharing** — Generate a shareable link or card (rendered with `html2canvas`) to share your profile with anyone.
- **Public Profile** — Every user has a public profile page (`/u/:uid`) visible to anyone — no login required.
- **Public Library** — Anyone can browse another user's full anime library at `/u/:uid/library`.
- **User Search** — Find other users by name directly from your profile page.

---

### 📚 Anime Library
- **Personalized Tracking** — Add animes to your library with statuses: **Watching**, **Completed**, **Paused**, **Dropped**, and **Plan to Watch**.
- **Episode Progress & Scores** — Track exactly which episode you're on and assign personal scores (1–10).
- **Favorites** — Mark any anime in your library as a favorite.
- **Cloud Sync** — Your entire library is stored in **Firestore** and syncs across all your devices in real time.
- **Drag-and-Drop Reordering** — Reorder your favorites list with intuitive drag-and-drop powered by `@dnd-kit`.
- **Virtualized List** — The library renders efficiently even with hundreds of entries, using `react-virtuoso`.

#### 📦 Library Backup & Import
- **Export to JSON** — Download your complete library as a JSON backup file.
- **Export to CSV** — Export your library to a CSV file, compatible with Excel and Google Sheets.
- **Import from JSON** — Restore a previous backup by importing a Portal Animes JSON file.
- **Import from MyAnimeList (MAL)** — Import your entire MAL history from a MAL XML export file, with automatic image and metadata fetching via the Jikan API.

---

### 📊 Statistics
- **Dedicated Stats Page** — An in-depth analytics dashboard for your library.
- **Overview Cards** — Quick glance at total animes, total watch time (days & hours), average score, and favorite count.
- **Status Distribution** — Donut chart breaking down your library by status.
- **Score Distribution** — Stacked bar chart showing how you've scored your animes, filterable by year, season, and format.
- **Format Distribution** — Pie chart showing the breakdown of anime types (TV, Movie, OVA, etc.).
- **Genre Analysis Table** — Detailed sortable table of your top genres with percentage, average score, and time watched. Filterable by year, season, and format. Features hover tooltips with per-genre status breakdown.
- **Top Rated List** — Your personal top 6 highest-scored animes.

---

### 🏆 Achievements & Badges
- **Badge System** — Unlock achievements automatically as you grow your library (e.g., first anime added, 10 completed, 1000 episodes watched, etc.).
- **Toast Notifications** — Get an in-app pop-up the moment you unlock a new badge.
- **Progress Tracking** — See how close you are to unlocking all badges.

---

### 🤝 Social & Community
- **Comments System** — Post real-time comments on any anime's detail page. Comments are stored in Firestore and update instantly.
- **Comment Likes** — Like other users' comments. Comment owners receive a notification when their comment is liked.
- **Delete Own Comments** — Remove your own comments at any time.
- **Taste Compatibility** — View a compatibility score between your library and another user's, based on shared animes, genre overlap, and scoring patterns.
- **👥 Notifications System** — Receive in-app notifications for:
  - Profile visits (someone viewed your public profile)
  - Comment likes (someone liked your comment)
  - Notifications are deduplicated (anti-spam) and marked as read.

---

### 🔍 Discovery & Catalog
- **Dynamic Catalog** — Browse the full anime database with advanced filters: Genre, Season, Year, Status, Type, Rating, and more.
- **Search** — Fast, debounced search for any anime by title.
- **Sorting** — Sort catalog results by popularity, score, newest, and more.
- **Grid & List Views** — Toggle between a card grid and a compact list layout.
- **Carousels** — The Home page features swipeable sections (Trending, Top Rated, Seasonal) powered by **Swiper.js**.

---

### 📅 Release Calendar
- **Weekly Schedule** — Browse currently airing anime organized by day of the week. Auto-selects today's schedule on load.
- **Sorting** — Sort the schedule by popularity, score, or alphabetically.
- **Grid & List Views** — Toggle between card grid and list layout.

---

### 🎌 Anime Detail Pages
- **Full Overview** — Synopsis, score, status, episode count, genres, studios, themes, and recommendations.
- **Embedded Trailer** — Watch the official trailer directly on the page.
- **Characters Tab** — Browse all voiced characters with links to their full detail pages.
- **Staff Tab** — View the full list of production staff members.
- **Recommendations** — Discover similar animes recommended by the community.
- **Character Detail Page** — Full character profile, including voice actors across multiple languages and anime appearances.
- **Person / Voice Actor Detail Page** — Complete voice actor profile with their full role history and biography.
- **Studio Detail Page** — Browse an animation studio's complete anime catalog.

---

### 🧑‍🎤 Characters & People
- **Top Characters** (`/characters`) — Browse the most popular anime characters, with quick links to their individual detail pages.
- **Top Voice Actors** (`/people`) — Explore top voice actors and industry professionals, each with a link to their full profile.
- **Discover via Anime** — From any anime's detail page, open the Characters tab to see the full cast, then navigate directly to a `CharacterDetails` page to view the character's biography, voice actors (per language), and anime appearances.

---

### 🎨 Themes & Appearance
- **8 Built-in Themes** — Light, Sunshine, Matcha, Rose, Dark, Blue (Majorelle), Blood, and Dracula.
- **Persistent Theme** — Your selected theme is saved and applied automatically on every visit.
- **Adaptive UI** — The entire interface seamlessly adapts to the active theme.

---

### ⚙️ Settings
- **Appearance Tab** — Switch themes visually.
- **Library Tab** — Export and import your library (JSON, CSV, MAL XML).
- **Account Tab** — Manage your account, including permanent account deletion.

---

### 🚀 Performance & UX
- **Page Transitions** — Smooth animated transitions between pages using **Framer Motion**.
- **Skeleton Loading** — Placeholder skeletons displayed while content is fetching, instead of blank screens.
- **Lazy Loading** — All pages are code-split and loaded on demand, keeping the initial bundle small.
- **Cached Queries** — API responses are cached and persisted across sessions with **TanStack Query** + storage persistor, minimizing redundant network requests.
- **Progressive Web App (PWA)** — Installable on mobile devices via `vite-plugin-pwa`.
- **Error Boundaries** — Route-level error boundaries prevent a single page crash from taking down the entire app.
- **SEO-Friendly Titles** — Dynamic `<title>` tags update on every page for better shareability.

---

## 🛠️ Tech Stack

| Category | Technology |
|---|---|
| **Framework** | React 19, Vite 7 |
| **Styling** | Tailwind CSS 3, PostCSS |
| **Animations** | Framer Motion |
| **State & Data Fetching** | TanStack Query v5 (with persistence) |
| **Routing** | React Router DOM v7 |
| **Backend / BaaS** | Firebase 12 (Auth, Firestore) |
| **Charts** | Recharts |
| **Drag & Drop** | @dnd-kit (core, sortable, utilities) |
| **Carousels** | Swiper.js |
| **Virtualization** | React Virtuoso |
| **Image Crop** | react-image-crop |
| **Image Export** | html2canvas |
| **Icons** | Lucide React |
| **API** | Jikan API v4 (MyAnimeList) |
| **Analytics** | Vercel Speed Insights |
| **PWA** | vite-plugin-pwa |

---

## 🔒 Security

The `firestore.rules` file enforces fine-grained security rules:
- Users can only write to their own data.
- Public profiles and libraries are readable by anyone.
- Comments are readable by anyone, but only writeable and deletable by their authors.

---

## 📄 License

This project is open-source and available under the [MIT License](LICENSE).

---

Made with ❤️ by [Tarcizio](https://github.com/Tarcizioo)
