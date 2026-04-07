# External Integrations

**Analysis Date:** 2026-04-08

## Artificial Intelligence

**Service:** Google Gemini AI
- **SDK:** `@google/genai`
- **Model:** `gemini-2.5-flash`
- **Usage:** Resume analysis, ATS scoring, skill extraction, roadmap generation, and tutor chat.
- **Location:** `orbit-backend/src/controllers/resumeController.js`
- **Config:** `GEMINI_API_KEY` required.

## Payments

**Service:** Stripe
- **SDK:** `stripe`
- **Usage:** Subscription management, payment processing, and upload count tracking.
- **Location:** `orbit-backend/src/controllers/paymentController.js`, `orbit-backend/src/routes/paymentRoutes.js`
- **Config:** `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` (presumed).

## Database

**Service:** MongoDB
- **ODM:** `mongoose`
- **Usage:** Storing user data, resumes, analysis results, and subscription states.
- **Location:** `orbit-backend/src/config/db.js`, `orbit-backend/src/models/`
- **Config:** `MONGO_URI` required.

## Authentication

**Mechanism:** JWT (JSON Web Tokens)
- **Library:** `jsonwebtoken`, `bcryptjs`
- **Usage:** User registration, login, and protected route middleware.
- **Location:** `orbit-backend/src/middleware/authMiddleware.js`, `orbit-backend/src/routes/authRoutes.js`
- **Config:** `JWT_SECRET` required.

## File Handling

**Mechanism:** Multer
- **Library:** `multer`
- **Usage:** Handling PDF uploads in-memory (buffer) before processing.
- **Location:** `orbit-backend/src/routes/resumeRoutes.js`
- **Constraint:** 10MB limit, PDF only.

## Frontend Hosting / CD

**Service:** Vercel & Render
- **Usage:** Frontend deployed on Vercel, Backend on Render/Railway.
- **Location:** CORS configuration in `orbit-backend/src/server.js`.

---

*Integration analysis: 2026-04-08*
