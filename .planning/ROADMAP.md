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
- **Action:** Backend updates the user's career goal and triggers a re-generation of the `ROADMAP.md` (or equivalent database state).

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

# ROADMAP: Career Path Discovery

## Phase 1: Core Engine & Data (The "Brain")
1. [x] Implement `getCareerTree` controller logic in backend.
2. [x] Create Gemini "Career Tree" prompt with JSON schema enforcement.
3. [x] Define new API route `/api/resume/career-tree`.
4. [x] Verify backend can return valid graph data for a test resume.

## Phase 2: Celestial UI (The "Space")
1. [x] Install and configure `reactflow` in frontend.
2. [x] Create `CareerOrbit.jsx` page and basic graph container.
3. [x] Implement custom "Celestial Node" components with Tailwind + Framer Motion.
4. [x] Connect UI to backend API.

## Phase 3: Interaction & Pivot (The "Orbit")
1. [x] Implement "Node Details" side-panel.
2. [x] Add "Skill Gap" calculation (Frontend or Backend).
3. [x] Implement "Target This Role" pivot logic (Backend state update).
4. [x] Final polish: Background animations and transitions.

---
*Roadmap created: 2026-04-08*
*Target Completion: [Milestone End]*
