# Placewise · Student Career & Placement Tracker

A frontend-only prototype of a career management platform for students: applications pipeline, interviews, DSA practice, skills, goals, daily tasks, resumes and a placement readiness score.

**This version has no backend or database.** All data lives in the browser (LocalStorage) and starts with realistic demo data.

## Stack

React 18 · Vite 5 · Tailwind CSS 3 · React Router 6 · Recharts · Lucide React

## Run it

```bash
npm install
npm run dev
```

Open the URL Vite prints (usually http://localhost:5173). Build for production with `npm run build`.

## What's inside

| Page | Highlights |
| --- | --- |
| Dashboard | Readiness score, stats, pipeline / DSA / topic charts, interviews, tasks, goals, deadlines, activity feed |
| Applications | Drag-and-drop Kanban board, table view, search, status filter, add/edit/delete |
| Interviews | Featured next interview, upcoming / past tabs, meeting links, feedback |
| DSA Tracker | Topic progress, difficulty charts, problem log with platform + links |
| Skills | Proficiency rings, categories, levels from Beginner to Expert |
| Career Goals | Priority, deadline, progress slider, status |
| Daily Tasks | Seven preparation categories, quick add, completion tracking |
| Resumes | Upload (stored locally if under 1.5 MB), preview, download, primary resume, AI analyzer placeholder |
| Profile | Academic details, links, skills, JSON export, reset demo data |

Dark/light mode, toasts, modals, empty and loading states are built in. Use **Profile → Reset demo data** to restore the sample data before a demo.

## Project structure

```
src/
  components/   Layout (sidebar, topbar, toasts) and shared UI (Modal, ProgressRing, Badge…)
  context/      AppContext: state, CRUD helpers, theme, toasts
  data/         seed.js: demo data (dates are relative to today)
  lib/          metrics.js (readiness score, chart data, constants), utils.js, useForm.js
  pages/        One file per route
  services/     repository.js (storage layer), resumeAnalyzer.js (future AI stub)
```

## Moving to a real backend later

```
React frontend  →  Node.js + Express API  →  MongoDB Atlas
```

1. Pages only talk to `AppContext`, and `AppContext` only talks to `services/repository.js`.
2. Replace the bodies in `repository.js` with `fetch` calls (`GET/POST/PUT/DELETE /api/applications`, etc.) and make them async.
3. Each collection in `seed.js` maps to a MongoDB collection: `applications`, `interviews`, `dsaProblems`, `skills`, `goals`, `tasks`, `resumes`, plus one `profile` document per user. Records already carry `id` and `createdAt`.
4. Add authentication, then scope every request by user id.
5. Implement `services/resumeAnalyzer.js` against an `/api/resumes/:id/analyze` endpoint. The Resumes page already reserves space for the result.

## Readiness score

Weighted from DSA progress (30%), applications sent (20%), average skill level (20%), task completion (15%) and resume/profile completeness (15%). See `computeMetrics` in `src/lib/metrics.js`.
