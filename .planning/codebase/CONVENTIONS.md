# Coding Conventions

**Analysis Date:** 2026-04-08

## General Patterns

- **Module System:** ES Modules (`import`/`export`) is used throughout the backend and frontend.
- **Async Code:** `async`/`await` is the standard for handling promises, with `try`/`catch` blocks for error handling.
- **State Management:** Backend uses MongoDB/Mongoose. Frontend uses React state and likely Context API for global state.

## Backend Conventions

- **RESTful API:** Standard HTTP methods (GET, POST, etc.) used for resources.
- **JSON responses:** All API endpoints return JSON objects with consistent keys (`message`, `error`, `data`).
- **Middleware Chain:** Pattern: `protect -> controller`.
- **Error Handling:** Standardized error response format: `{ message: "...", error: "..." }`.
- **Database Access:** Every collection has a corresponding Mongoose model in `src/models/`.

## Frontend Conventions

- **Functional Components:** React components are defined as functional components using arrow functions or the `function` keyword.
- **Styling:** Tailwind CSS utility classes are used directly in JSX.
- **Animations:** Framer Motion is used for entry and transition animations.
- **Routing:** React Router DOM is used for declarative routing in `App.jsx`.

## Code Style

- **Indentation:** 2 spaces (consistent in JS/JSX files).
- **Quotes:** Double quotes preferred in JSX, mixed in JS.
- **Semicolons:** Used consistently.
- **Naming:**
  - Variables/Functions: camelCase.
  - Components: PascalCase.
  - ENV Variables: UPPER_SNAKE_CASE.

## Logging

- **Console Logging:** Extensive use of `console.log`, `console.warn`, and `console.error` for request tracking and debugging.
- **Timestamping:** Logs in `server.js` include ISO timestamps.

---

*Conventions analysis: 2026-04-08*
