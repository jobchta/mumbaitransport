# Mumbai Transport

A modern, responsive web application for Mumbai's public transportation system.

## 🚀 Features

- **Journey Planning**: Plan routes across Mumbai's transport network
- **Metro Tickets & Fares**: Check current fares and buy tickets for all metro lines
- **Ride Comparison**: Compare different transport options (Metro, Bus, etc.)
- **Multi-language Support**: Available in 10+ Indian languages
- **PWA Ready**: Install as a mobile app
- **Dark/Light Theme**: Toggle between themes

## 🌐 Live Site

Visit: [https://mumbaitransport.in](https://mumbaitransport.in)

## 📱 How to Use

1. **Plan Journey**: Use the "Plan Your Journey" button to find routes
2. **Buy Tickets**: Navigate to Tickets tab to purchase metro tickets
3. **Compare Rides**: Use Compare tab to see different transport options
4. **Multi-language**: Click the language selector to change language
5. **Install**: Click install prompt to add to home screen

## 🏗️ Structure

```
├── index.html                 # Main application file
├── src/
│   ├── manifest.json         # PWA manifest
│   ├── sw.js                 # Service worker
│   ├── js/
│   │   ├── static-app.js     # Main application logic
│   │   └── language-manager.js # Language management
│   ├── styles/
│   │   └── style.css         # Application styles
│   └── assets/
│       └── icons/           # PWA icons
├── CNAME                    # Custom domain
└── _config.yml              # GitHub Pages config
```

## 🚀 Deployment

This is a static site that works on:
- GitHub Pages (current deployment)
- Netlify
- Vercel
- Any static hosting service

## 💻 Development

Simply open `index.html` in a browser or serve the files through any web server.

## 📝 License

Open source project for Mumbai public transport.