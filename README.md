# 🚌 Mumbai Transport Navigator PWA

A **Progressive Web App (PWA)** designed specifically for mobile users to quickly navigate Mumbai's public transport system. Built with Google Maps API integration and optimized for a mobile-first experience.

This project has been refactored into a modular structure for better maintainability and developer experience.

## ✨ Features

- **📱 Mobile-First Design**: Responsive layout, PWA capabilities, offline support, and fast loading.
- **🚀 Quick Actions**: One-tap route planning for common destinations like "Home → Work" and "To Airport".
- **🗺️ Google Maps Integration**: Real-time routing, transit mode, interactive maps, and location services.
- **📍 PWA Capabilities**: Installable on the home screen, app shortcuts, offline caching, push notifications, and background sync.

## 📁 Project Structure

The application is organized into a modular structure:

```
mumbaitransport/
├── public/
│   ├── index.html              # Main application entry point
│   ├── src/
│   │   ├── assets/             # Icons and other assets
│   │   ├── components/         # HTML components
│   │   ├── js/                 # JavaScript files
│   │   ├── styles/             # CSS stylesheets
│   │   ├── manifest.json       # PWA manifest
│   │   └── sw.js               # Service worker
├── archive/                    # Old and unused files
├── .gitignore
├── README.md                   # This file
└── wrangler.toml
```

## 🔧 Setup and Usage

### 1. Get a Google Maps API Key

1.  Go to the [Google Cloud Console](https://console.cloud.google.com/).
2.  Create a new project or select an existing one.
3.  Enable the **Maps JavaScript API** and the **Places API**.
4.  Create an API Key.
5.  Open `public/index.html` and replace `YOUR_API_KEY` with your actual API key.

### 2. Run the Application

1.  Navigate to the `public` directory:
    ```bash
    cd public
    ```
2.  Start a local web server. For example, using Python's built-in server:
    ```bash
    python3 -m http.server 8000
    ```
3.  Open your web browser and go to `http://localhost:8000`.

### 3. Development

-   The application is built with a modular approach. The main HTML file is `public/index.html`, which dynamically loads HTML components from the `public/src/components/` directory.
-   The component loading logic is in `public/src/js/component-loader.js`.
-   To modify a part of the UI, edit the corresponding component file in `public/src/components/`.
-   To add a new component, create a new HTML file in the `components` directory and update `component-loader.js` to load it.

## 📄 License

This project is open source and available under the MIT License.

---

**Built with ❤️ for Mumbai's commuters**
