# Technology Stack

**Analysis Date:** 2026-04-08

## Languages

**Primary:**
- JavaScript (ES Modules) - Used in backend (`orbit-backend`) and frontend (`orbit-frontend-premium`)
- JSX - Used for React components in frontend

**Secondary:**
- JavaScript (CommonJS) - Used in root and for build scripts/configs

## Runtime

**Environment:**
- Node.js 18.x+ (specified in backend engines)
- Browser for frontend

**Package Manager:**
- npm 10.x (presumed)
- Lockfile: `package-lock.json` present at root and in some subdirectories

## Frameworks

**Core:**
- Express 4.x - Backend web server
- React 18.x - Frontend UI framework
- Mongoose 8.x - MongoDB ODM

**Testing:**
- None identified (default echo in package.json)

**Build/Dev:**
- Vite 5.x - Frontend build tool and dev server
- nodemon - Backend dev server

## Key Dependencies

**Critical:**
- @google/genai 1.45+ - Gemini AI integration (gemini-2.5-flash)
- mongoose 8.23+ - Database modeling and access
- stripe 20.3+ - Payment processing
- framer-motion 11.18+ - Frontend animations
- tailwindcss 3.4+ - Styling utility framework
- pdf-parse 1.1+ - PDF processing for resumes

**Infrastructure:**
- express - HTTP routing
- cors - Cross-Origin Resource Sharing
- dotenv - Environment variable management
- jsonwebtoken - Auth tokens
- bcryptjs - Password hashing

## Configuration

**Environment:**
- `.env` files used in backend and frontend
- Keys identified: `MONGO_URI`, `JWT_SECRET`, `STRIPE_SECRET_KEY`, `GEMINI_API_KEY`, `PORT`

**Build:**
- `vite.config.js` (frontend)
- `tailwind.config.js` (frontend)

## Platform Requirements

**Development:**
- Cross-platform compatible (Node.js environment)

**Production:**
- Backend: Render/Railway (references in server.js)
- Frontend: Vercel (references in server.js)

---

*Stack analysis: 2026-04-08*
*Update after major dependency changes*
