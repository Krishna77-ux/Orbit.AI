# Architecture & Technical Concerns

**Analysis Date:** 2026-04-08

## High Priority

### 1. Lack of Automated Testing
- **Impact:** High risk of regression during refactoring.
- **Concern:** No unit or integration tests for critical logic (AI analysis, payment gateway, auth).
- **Recommendation:** Implement Vitest for the backend logic and `generatePersonalizedRoadmap`.

### 2. Environment Configuration
- **Impact:** Medium.
- **Concern:** Many environment variables (`GEMINI_API_KEY`, etc.) are checked at runtime but not validated at startup.
- **Recommendation:** Add a central config validator that crashes the server if required keys are missing.

## Technical Debt

### 1. Mixed Module Systems
- **Concern:** Root directory uses CommonJS (`package.json "type": "commonjs"`) while sub-folders use ESM. This can lead to confusion and build issues if root files import sub-folder files.
- **Recommendation:** Standardize the root to ESM or keep root logic minimal.

### 2. Controller Bloat
- **Concern:** `resumeController.js` is quite large (>500 lines) and contains everything from AI logic to UAT mapping.
- **Recommendation:** Split into smaller services (e.g., `aiService.js`, `roadmapService.js`).

### 3. Basic AI Fallback
- **Concern:** If Gemini fails, the fallback is a hardcoded set of skills and suggestions.
- **Recommendation:** Implement a more robust fallback or retry mechanism.

## Security Concerns

### 1. CORS Configuration
- **Concern:** The CORS allowed origins in `server.js` include multiple local and production URLs.
- **Recommendation:** Use environment variables to control allowed origins for production.

### 2. File Upload Limits
- **Concern:** Multer is configured for 10MB, which is safe, but there's no virus scanning for uploaded PDFs.
- **Recommendation:** Consider a cloud storage provider with built-in scanning for production.

## Performance

### 1. Database Connection
- **Concern:** Server starts without waiting for DB connection. While this improves startup time, initial requests might fail.
- **Recommendation:** Use a "ready" flag or a health check that waits for DB availability.

---

*Concerns analysis: 2026-04-08*
