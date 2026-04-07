# Research: Celestial Flow Implementation

## Visual Library: React Flow (Svelte Flow counterpart)
- **Why:** Handles pan/zoom, custom nodes, and automatic edges with minimal boilerplate. Allows for "Handle" customization which is essential for the horizontal radial branches.
- **Styling:** Can be integrated seamlessly with Tailwind CSS.
- **Animation:** Works perfectly with `framer-motion` for node entry/exit.

## AI Strategy: Tree Generation
- **Current Prompt:** Returns a linear list of steps.
- **New Prompt Requirement:** Generate a JSON tree structure.
  ```json
  {
    "nodes": [
      { "id": "current", "label": "Junior Dev", "type": "root" },
      { "id": "path1", "label": "Full Stack", "parentId": "current", "priority": "high" },
      { "id": "path2", "label": "DevOps", "parentId": "current", "priority": "medium" }
    ]
  }
  ```
- **Gemini Model:** `gemini-2.5-flash` is ideal for this structured JSON output.

## Backend Changes
- **Route:** `/api/resume/career-tree`
- **Logic:** Take latest resume -> Send to Gemini with "Tree Prompt" -> Return normalized Graph data for React Flow.
- **Pivot Logic:** New endpoint `/api/resume/pivot` to update the user's "Primary Career Goal" in MongoDB, which then triggers a re-generation of the main roadmap.

## Frontend Architecture
- **New Page:** `src/pages/CareerOrbit.jsx`
- **State:** Use a custom hook `useCareerGraph` to fetch and format nodes/edges.
- **UI:** Sidebar for "Node Details" + Main View for the Graph.

---
*Research date: 2026-04-08*
