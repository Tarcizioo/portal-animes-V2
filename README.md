# Portal Animes V2

Portal Animes V2 is a modern, feature-rich web application for discovering and tracking anime. Built with **React** and **Firebase**, it provides a seamless user experience with real-time data from the **Jikan API**.

**🌐 Live Demo:** [https://tarcizioo.github.io/portal-animes-V2/](https://tarcizioo.github.io/portal-animes-V2/)

## Screenshots

<!-- Add your screenshots here. Example: -->
<!-- ![Home Page](./screenshots/home.png) -->
*(Adicione seus prints aqui)*

---

## Features

### Authentication & User Profile
-   **Google Sign-In:** Secure and easy login.
-   **User Profile:** Customized profile page with stats, bio, and banners.
-   **Favorites System:** Select and display your Top 3 favorite animes on your profile.

### Customization & Themes
-   **Multiple Themes:** Choose from various visual themes (Light, Dark, Blood, Rose, etc.) to suit your style.
-   **Profile Customization:** Personalize your profile with custom banners and bio information.
-   **Adaptive UI:** The entire application interface adapts smoothly to the selected theme.

### Anime Library
-   **Personalized Tracking:** Add animes to your library (Planning, Watching, Completed, etc.).
-   **Progress Tracking:** Update episode progress and scores.
-   **Cloud Sync:** All data is stored in **Firestore**, accessible from any device.

### Social & Community
-   **Native Comments System:** Real-time comments on anime details pages.
-   **Interaction:** Delete your own comments and see others' opinions instantly.

### Discovery
-   **Dynamic Catalog:** Advanced filters (Genre, Season, Status) and search.
-   **In-Depth Details:** Trailers, Recommendations, Characters, and Staff info.
-   **Responsive Design:** Fully optimized for Mobile, Tablet, and Desktop with a premium Dark Mode UI.

---

## Tech Stack

-   **Frontend:** React (v18), Vite
-   **Styling:** Tailwind CSS, PostCSS
-   **State/Data Fetching:** TanStack Query (React Query)
-   **Routing:** React Router DOM
-   **Backend/BaaS:** Firebase (Authentication, Firestore)
-   **Icons:** Lucide React
-   **API:** Jikan API (V4)

---

## Getting Started

### Prerequisites
-   Node.js (v18+)
-   NPM or Yarn

### Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/Tarcizioo/portal-animes-V2.git
    cd portal-animes-V2
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Configure Environment Variables:**
    Create a `.env` file in the root directory. You can use the example below (replace the values with your own Firebase credentials):
    
    ```env
    VITE_FIREBASE_API_KEY=your_api_key
    VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
    VITE_FIREBASE_PROJECT_ID=your_project_id
    VITE_FIREBASE_STORAGE_BUCKET=your_bucket.appspot.com
    VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
    VITE_FIREBASE_APP_ID=your_app_id
    ```

4.  **Run the development server:**
    ```bash
    npm run dev
    ```

5.  **Build for Production:**
    ```bash
    npm run build
    ```

---

## License

This project is open-source and available under the [MIT License](LICENSE).

---

Made with ❤️ by [Tarcizio](https://github.com/Tarcizioo)
