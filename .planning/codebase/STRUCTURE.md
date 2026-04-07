# Project Structure

**Analysis Date:** 2026-04-08

## Root Directory

```text
.
├── orbit-backend/           # Backend API application
├── orbit-frontend-premium/  # Frontend React application
├── get-shit-done/           # GSD system repository
├── .planning/               # GSD planning and codebase map
├── package.json             # Root dependencies and scripts
└── ...                      # Misc documentation and config files
```

## Backend Structure (`orbit-backend/`)

```text
src/
├── config/                  # Configuration (database, etc.)
│   └── db.js                # MongoDB connection logic
├── controllers/             # Business logic handlers
│   ├── authController.js    # User auth logic
│   ├── paymentController.js # Stripe and credits logic
│   └── resumeController.js  # AI analysis and roadmap logic
├── middleware/              # Express middlewares
│   └── authMiddleware.js    # JWT protection
├── models/                  # Mongoose schemas
│   ├── Resume.js            # Resume analysis model
│   └── User.js              # User profile and sub info
├── routes/                  # API endpoint definitions
│   ├── authRoutes.js        # Auth endpoints
│   ├── paymentRoutes.js     # Payment endpoints
│   └── resumeRoutes.js      # Resume and tutor endpoints
└── server.js                # Application entry point & CORS
```

## Frontend Structure (`orbit-frontend-premium/`)

```text
src/
├── components/              # Reusable UI components
│   ├── Layout.jsx           # Main wrapper
│   ├── Navbar.jsx           # Navigation
│   └── ...                  # Feature-specific components
├── context/                 # React Context providers
├── pages/                   # Page-level components (routes)
│   ├── Dashboard.jsx        # User home
│   ├── Home.jsx             # Landing page
│   ├── Login.jsx            # Auth
│   ├── Roadmap.jsx          # AI Roadmap display
│   └── ResumeAnalyzer.jsx   # Upload and analysis UI
├── styles/                  # CSS modules and Tailwind base
├── utils/                   # Helper functions (API calls, formatters)
├── App.jsx                  # Route definitions (React Router)
└── main.jsx                 # Entry point
```

## Naming Conventions

- **Files:** PascalCase for React components (`Navbar.jsx`), camelCase for logic and routes (`resumeController.js`).
- **Directories:** kebab-case for top-level folders, lowercase for sub-folders.
- **API Paths:** Kebab-case (`/api/resume/my-resumes`).

## Key Locations

- **Main Entry Point:** `orbit-backend/src/server.js`
- **Frontend Entry Point:** `orbit-frontend-premium/src/main.jsx`
- **Resume Processing Logic:** `orbit-backend/src/controllers/resumeController.js`
- **Auth Guard:** `orbit-backend/src/middleware/authMiddleware.js`

---

*Structure analysis: 2026-04-08*
