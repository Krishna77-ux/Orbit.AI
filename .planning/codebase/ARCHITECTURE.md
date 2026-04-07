# System Architecture

**Analysis Date:** 2026-04-08

## Overview

The system follows a classic **Client-Server** architecture with separate frontend and backend applications.

- **Frontend:** Single Page Application (SPA) built with React and Vite. Uses Tailwind CSS for utility-first styling and Framer Motion for animations.
- **Backend:** RESTful API built with Node.js and Express. Uses Mongoose for data persistence and integrates with external AI (Gemini) and Payment (Stripe) services.

## Architectural Patterns

### Backend (Model-View-Controller Lite)
- **Routes:** Define endpoints and attach middleware/controllers (`src/routes/`).
- **Controllers:** Handle business logic and orchestration between models and external services (`src/controllers/`).
- **Models:** Define data schemas and validation using Mongoose (`src/models/`).
- **Middleware:** Handle cross-cutting concerns like authentication (`protect`), file uploads (`multer`), and CORS (`src/middleware/`).

### Frontend (Component-Based)
- **Pages:** Top-level components representing routes (`src/pages/`).
- **Components:** Reusable UI elements (`src/components/`).
- **Context:** Global state management (e.g., Auth, Resume state) (`src/context/`).
- **Utils:** Helper functions and shared logic (`src/utils/`).

## Data Flow

1. **User Upload:** 
   - User uploads a PDF via the Frontend (`ResumeAnalyzer.jsx`).
   - Frontend sends a POST request with the file buffer to `/api/resume/upload`.
2. **Backend Processing:**
   - `authMiddleware` verifies the JWT.
   - `paymentController` checks if the user has remaining upload credits.
   - `multer` handles the file upload.
   - `pdf-parse` extracts text from the PDF.
   - `resumeController` sends the text to **Gemini AI** for analysis.
3. **Storage & Response:**
   - Analysis results (ATS score, skills, suggestions) are saved to **MongoDB** via `Resume` model.
   - Backend returns the JSON results to the Frontend.
4. **UI Update:**
   - Frontend updates the state and displays the score, roadmap, and career advice.

## Key Abstractions

- **Internal AI Logic:** Centralized in `resumeController.js` but could be further abstracted into a service layer.
- **Roadmap Generation:** A deterministic function `generatePersonalizedRoadmap` in the controller that maps skills to predefined steps.
- **Protection Layer:** Unified `protect` middleware for enforcing auth and subscription checks.

---

*Architecture analysis: 2026-04-08*
