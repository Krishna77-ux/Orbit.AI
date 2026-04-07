# Project: Interactive Career Path Discovery

## What This Is
A premium, interactive visualization layer for OrbitAll that allows users to explore potential career trajectories based on their analyzed resume. It transforms static roadmap data into a dynamic "Career Orbit" where users can discover new roles, identify skill gaps, and pivot their career focus.

## Core Value
Provides a "Big Picture" view of a user's career potential, moving beyond immediate tasks into long-term strategic planning. It differentiates OrbitAll as a visionary career engine rather than just an ATS checker.

## Context
- **Base:** Existing OrbitAll Fullstack (Node/Express/React/Gemini).
- **Target Audience:** Ambitious professionals and students looking for their "Next Big Move."
- **Visual Language:** Dark mode, glassmorphism, animated gradients, and celestial/orbital motifs.

## Requirements

### Validated
- ✓ Resume analysis and skill extraction (existing)
- ✓ Basic roadmap generation (existing)
- ✓ User authentication and multi-resume support (existing)

### Active
- [ ] **Career Tree Visualizer**: A horizontal radial flow visualization of career paths.
- [ ] **Interactive Nodes**: Clickable roles that show descriptions and required skills.
- [ ] **Skill Gap Analysis**: Comparison between current user skills and target role requirements.
- [ ] **Dynamic Pivot**: Ability to change the active roadmap based on a selected target role.
- [ ] **"Celestial Flow" UI**: High-end animations using Framer Motion and React Flow.

### Out of Scope
- [Exclusion 1] — Real-time social sharing (V2)
- [Exclusion 2] — Direct integration with job application portals (V2)

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| React Flow | Best-in-class for interactive node-based UIs in React. Performance and flexibility. | — Pending |
| Dedicated Page | Needs screen real estate to feel "epic" and immersive. | — Pending |
| Side-Panel Navigation | Keeps the visualization focus while providing deep details. | — Pending |

---
*Last updated: 2026-04-08 after initialization*
