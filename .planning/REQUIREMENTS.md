# Requirements: Career Path Discovery

## 1. Functional Requirements

### FR-01: Graph Generation
- **Requirement:** System must generate a 3-level hierarchical career tree based on the user's current resume.
- **Levels:** Current Role (Root) -> Next Steps (Neighbors) -> Strategic Goals (Aspirations).
- **Format:** JSON structure compatible with React Flow edges and nodes.

### FR-02: Interactive Node Details
- **Requirement:** Clicking a node must open a side-panel showing:
  - Role description.
  - Required skills not currently in the user's profile.
  - "Difficulty" rating.

### FR-03: Roadmap Pivot
- **Requirement:** User can select a node as their "Primary Target."
- **Action:** Backend updates the user's career goal and triggers a re-generation of the roadmap.

### FR-04: Celestial Visuals
- **Requirement:** UI must use glowing gradients, pulse animations, and "Glass" cards to match the premium orbit aesthetic.

## 2. Technical Requirements

### TR-01: Backend Service
- New controller method `getCareerTree` in `resumeController.js`.
- Specialized Gemini prompt for tree structure.

### TR-02: Frontend Integration
- Integration of `reactflow` library.
- New route `/career-orbit` in `App.jsx`.

---
*Requirements defined: 2026-04-08*
