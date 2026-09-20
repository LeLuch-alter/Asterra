# ROADMAP.md

## Goal

Build a polished student demonstration of an AI-powered scientific collaboration platform.

The final demo should communicate:

> A collaborative platform for scientific projects where researchers can create projects, work together, find suitable collaborators/mentors, and use AI to plan and improve research.

The project is intentionally limited in scope. Do not turn it into a production-scale platform.

---

# Phase 0 — Project Setup

### Tasks
- Create Next.js + TypeScript project.
- Configure App Router.
- Configure Tailwind CSS.
- Install/configure shadcn/ui.
- Install icon library.
- Configure environment variables.
- Connect project to GitHub.
- Create Supabase project.
- Connect Supabase to the application.
- Configure Vercel deployment.

### Definition of Done
- App runs locally.
- App deploys successfully to Vercel.
- Supabase connection works.
- Environment variables are documented.

---

# Phase 1 — Design System and Assets

### Tasks
- Inspect the supplied design-image folder.
- Identify all screens represented by the images.
- Identify repeated UI patterns.
- Define typography, spacing, colors, borders, radii and shadows.
- Create reusable UI components.
- Implement responsive layout.

### Important
The supplied design images are the visual reference. Do not invent a completely different visual language.

### Definition of Done
- Main layout matches the supplied designs.
- Repeated components are reusable.
- Desktop and mobile layouts are usable.

---

# Phase 2 — Authentication and Profiles

### Tasks
- Supabase authentication.
- Registration.
- Login.
- Logout.
- Protected routes.
- Profile creation/editing.
- Avatar.
- Biography.
- University/organization.
- Research fields.
- Skills/interests.
- Experience.

### Definition of Done
A user can register, log in, create a profile and edit it.

---

# Phase 3 — Research Projects

### Tasks
- Create project.
- Edit project.
- Delete/archive project.
- Project title.
- Description.
- Research field.
- Research question.
- Hypothesis.
- Project status.
- Owner.
- Members.
- Roles inside project.

### Project page sections
- Overview
- Research question
- Hypothesis
- Methodology
- Team
- Research results
- Roadmap
- AI tools

### Definition of Done
A user can create a project and invite/add other demo users as project members.

---

# Phase 4 — Collaborative Research Content

### Tasks
- Add research result/note.
- Edit research result.
- Delete research result.
- Author attribution.
- Timestamp.
- Basic project activity.

Keep collaboration simple. Do not implement real-time document editing unless it becomes necessary.

### Definition of Done
Multiple project members can contribute research results/notes.

---

# Phase 5 — Discovery

### Tasks
- Project search.
- Researcher search.
- Filter by research field.
- Filter by skills.
- Basic project cards.
- Researcher cards.
- Researcher profile pages.
- Mentor discovery.

### Definition of Done
A user can discover projects and researchers without knowing their exact names.

---

# Phase 6 — AI Match

## Goal

Recommend suitable researchers or mentors for a project.

### Input
- Project description.
- Research field.
- Required skills.
- Project goals.
- User profile information.
- Skills.
- Research interests.
- Experience.
- Previous project fields.

### Flow

User opens:

`Project → Find collaborators → AI Match`

The server:
1. Retrieves relevant profiles.
2. Sends structured profile/project information to the AI model.
3. Receives candidate matches.
4. Validates/parses the response.
5. Displays candidates with explanations.

### UI
Example:

- Match candidate
- Relevant skills
- Research field overlap
- Experience overlap
- Short explanation
- Request to connect

Do not present the match as an objective scientific measurement.

---

# Phase 7 — AI Research Assistant

## Goal

Help users understand and improve their research content.

### Functions
- Summarize project/research text.
- Explain a section.
- Identify unclear parts.
- Suggest improvements.
- Suggest research questions.
- Review structure.

### UI
Add an AI Assistant panel to the project.

Example actions:
- Summarize
- Explain
- Review
- Suggest questions
- Improve section

### Safety / UX
Clearly label generated content as AI assistance.

The AI must not claim that a study is scientifically valid merely because it produced a response.

---

# Phase 8 — AI Research Roadmap

## Goal

Turn a project idea into an editable research plan.

### Input
Example:

`AI-based detection of water pollution`

### AI output
- Research question
- Hypothesis
- Literature review
- Methodology
- Data collection
- Data analysis
- Results
- Discussion
- Conclusion

### UI
Display the roadmap as editable steps/checklist/timeline.

Users can:
- edit step
- add step
- delete step
- reorder step
- mark complete

### Definition of Done
A user can generate a roadmap from a project description and then manually edit it.

---

# Phase 9 — Science News

### Tasks
- News API/RSS integration.
- Science categories.
- News cards.
- Article details/external link.
- Loading/error state.
- Fallback demo data.

Suggested categories:
- Computer Science
- Biology
- Physics
- Chemistry
- Astronomy
- Environmental Science

### Definition of Done
The news page remains usable even if the external news service temporarily fails.

---

# Phase 10 — Polish

### Tasks
- Empty states.
- Loading states.
- Error states.
- Form validation.
- Responsive layouts.
- Accessibility basics.
- Navigation.
- Notifications.
- Search UX.
- AI loading states.
- AI error states.
- Consistent typography and spacing.

---

# Phase 11 — Demo Preparation

Prepare one complete demonstration scenario.

Example:

1. Student creates account.
2. Student creates a research project.
3. Student enters research idea.
4. AI generates a research roadmap.
5. Student adds a collaborator.
6. AI Match recommends another researcher.
7. Team adds a research result.
8. AI Research Assistant summarizes/reviews it.
9. Project appears in project discovery.
10. User opens science news.

The demo should work from beginning to end without requiring real universities, governments or paid infrastructure.

---

# Out of Scope

Do NOT implement unless explicitly requested:

- Microservices.
- Kubernetes.
- Dedicated backend server.
- Complex DevOps infrastructure.
- Real government integrations.
- Real university SSO.
- Real government tenders.
- Real financial transactions.
- Full Git implementation.
- Google Docs-style real-time editing.
- Scientific peer-review infrastructure.
- Production-grade recommendation infrastructure.

The goal is a convincing, technically coherent student project.
