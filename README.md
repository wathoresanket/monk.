# Monk.

> *A sanctuary for your focus.*

**Monk.** is not just another Pomodoro timer. It is a **focus companion** designed to help you find your rhythm, respect your energy, and reflect on your work with intention.

Built as a **vibe coding project** using **Lovable** and **Antigravity**, it prioritizes a "zen-like" aesthetic, honest data, and a calm user experience over rigid productivity metrics.

![Monk App Screenshot](https://raw.githubusercontent.com/placeholder/monk-screenshot.png)

## Philosophy & Features

Most timers are about **forcing** you to work. Monk. is about **inviting** you to focus.

### Core Features

-   **Deep Focus & Flow**: A minimalist circular timer that breathes with you. No ticking, no anxiety.
-   **Opening Breath**: Every session begins with a 3-second inhale/exhale animation to center your mind before you start.
-   **Honest Reflections**: At the end of every session, you aren't just done. You reflect: *Was your mind Clear, Neutral, or Scattered?*
-   **Rhythm Analytics**: Visualize your focus patterns. See when you are most productive (Morning vs. Evening) and how your focus quality trends over time.
-   **Ambient Soundscapes**: Built-in high-fidelity sounds (Tibetan Bowls, Nature) to mask distractions.
-   **Distraction-Free**: A "Reduce Motion" mode and simple interface that gets out of your way.

### Why Monk.?

| Feature | Standard Pomodoro | Monk. |
| :--- | :--- | :--- |
| **Goal** | maximize output | maximize presence |
| **Start** | abrupt click | centering breath |
| **End** | "Done" | "How did it feel?" |
| **Data** | minutes tracked | focus quality & rhythm |
| **Vibe** | utilitarian | mindful |

## Tech Stack

Monk. is a native macOS application built with modern web technologies:

-   **Framework**: [Tauri v2](https://tauri.app/) (Rust + Webview)
-   **Frontend**: React + TypeScript + Vite
-   **Styling**: Tailwind CSS + Shadcn UI + Framer Motion
-   **Data**: IndexedDB (Local-first, privacy-focused)
-   **AI Partners**: **Lovable** (UI Generation) & **Antigravity** by Google (Logic & Refinement)

---

## Installation & Troubleshooting

### 1. Download & Install
1.  **Locate the Release**: The latest `.dmg` installer is located at:
    `src-tauri/target/release/bundle/dmg/Monk._0.1.0_aarch64.dmg`
2.  Drag **Monk.** to your **Applications** folder.

### 2. "App is damaged" Error?
Because this app is self-signed (not from the Mac App Store), macOS Gatekeeper might block it. If you see a message saying *"Monk. is damaged and can't be opened"*, follow these simple steps:

1.  Open your **Terminal** app.
2.  Paste the following command and hit Enter:
    ```bash
    xattr -cr /Applications/Monk..app
    ```
3.  **Right-click** the app icon and select **Open**.

That's it! The app is now whitelisted and will open normally.

---

## For Developers

Want to build it yourself?

1.  **Clone the repo**:
    ```bash
    git clone https://github.com/yourusername/monk.git
    ```
2.  **Install dependencies**:
    ```bash
    npm install
    ```
3.  **Run locally**:
    ```bash
    npm run tauri dev
    ```
4.  **Build for production**:
    ```bash
    npm run tauri build
    ```

---

*Made with intentionality by Sanket.*
