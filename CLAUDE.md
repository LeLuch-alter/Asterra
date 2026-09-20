# CLAUDE.md

## Project Overview

This repository contains a student demonstration project for an AI-powered scientific collaboration platform.

The concept is:

> A GitHub-like platform for science where students, researchers and mentors can create research projects, collaborate, discover people and use AI to plan and improve research.

This is a **demonstration project**, not a production platform for governments or universities.

Optimize for:
- clear architecture;
- attractive UI;
- reliable demo flow;
- simple deployment;
- understandable code;
- low/no infrastructure cost.

Do not over-engineer the project.

---

# Product Scope

The website has two groups of functionality.

## Basic Website Functionality

The platform must support:

- landing/home page;
- registration/login/logout;
- user profiles;
- researcher profiles;
- project discovery;
- project creation;
- project editing;
- project details;
- project members;
- research results/notes;
- search;
- filters;
- mentor/researcher discovery;
- science news;
- basic notifications/activity feedback.

## AI Functionality

There are exactly **three main AI features**:

### 1. AI Match

Find potentially suitable collaborators or mentors for a research project.

The AI should consider:
- research field;
- skills;
- interests;
- experience;
- project requirements;
- previous relevant projects.

The UI should explain *why* a person is recommended.

Do not treat an AI-generated match percentage as an objective scientific measurement.

### 2. AI Research Assistant

An AI assistant available inside the research workflow.

It can:
- summarize research;
- explain sections;
- identify unclear writing/structure;
- suggest improvements;
- suggest research questions;
- review the structure of a research text.

AI output is assistance, not scientific validation.

### 3. AI Research Roadmap

Generate an editable research roadmap from a project idea.

Possible steps:
- research question;
- hypothesis;
- literature review;
- methodology;
- data collection;
- data analysis;
- results;
- discussion;
- conclusion.

Users must be able to edit the generated roadmap.

---

# Technology Stack

## Application

- Next.js
- React
- TypeScript
- Next.js App Router

Next.js is both the frontend and backend layer.

Do not add a separate Spring Boot server.

## UI

- Tailwind CSS
- shadcn/ui
- Lucide icons or the project's existing icon system

Build reusable components.

## Backend Services

### Supabase

Use Supabase for:
- PostgreSQL;
- authentication;
- storage if needed;
- database access;
- Row Level Security where appropriate.

## AI

Use an external LLM API.

Supported initial choices:
- Gemini API;
- OpenAI API.

Keep AI provider-specific code isolated behind a small service/module.

AI requests must run server-side.

Never expose API keys in client-side JavaScript.

## Science News

Use a public science-news API or RSS-based source.

The external news service is not critical to the core application.

Provide fallback mock/seeded data for development and demo reliability.

## Hosting

- Vercel for Next.js.
- Supabase for backend services.
- Optional low-cost domain.

No physical server is required.

## Version Control

- Git
- GitHub

---

# Design Instructions

The project UI will be based on **generated design images** supplied by the user.

All design images will be stored in a separate project file/folder.

Treat those images as the visual source of truth.

Before implementing a screen:
1. Inspect the relevant design image.
2. Identify layout structure.
3. Identify typography.
4. Identify colors.
5. Identify spacing.
6. Identify repeated components.
7. Implement reusable components.
8. Make the screen responsive.

Do not replace real supplied assets with arbitrary placeholders.

If a provided image is an actual UI asset rather than a design reference, use the asset where appropriate.

If a Figma design is later introduced, follow the project's Figma design-to-code workflow and use the supplied design system/assets instead of recreating them manually.

---

# Architecture

Use a simple full-stack architecture:

```text
Browser
   |
   v
Next.js
   |
   +---- React UI
   |
   +---- Server Actions / Route Handlers
   |
   +---- Supabase
   |       |
   |       +---- PostgreSQL
   |       +---- Auth
   |       +---- Storage
   |
   +---- AI API
   |
   +---- Science News API/RSS
```

Do not introduce microservices.

---

# Data Model

Recommended entities:

```text
profiles
projects
project_members
research_results
research_roadmap_items
mentor_profiles
match_results / match_requests
news_items
notifications
```

Optional:

```text
comments
bookmarks
project_files
activity_log
```

Keep the schema relational and simple.

---

# Project Model

A project should contain enough information for both normal functionality and AI features.

Suggested fields:

```text
id
owner_id
title
description
research_field
research_question
hypothesis
methodology
status
created_at
updated_at
```

Project members should have a project-specific role.

Research results should contain:

```text
id
project_id
author_id
title
content
created_at
updated_at
```

Roadmap items should contain:

```text
id
project_id
title
description
position
status
created_at
```

---

# AI Architecture

Keep AI logic isolated.

Suggested structure:

```text
src/
  lib/
    ai/
      provider.ts
      match.ts
      research-assistant.ts
      roadmap.ts
```

The provider abstraction should make it possible to change:

```text
Gemini
```

to:

```text
OpenAI
```

without rewriting application features.

AI responses should use structured JSON whenever possible.

Validate model output before using it in the UI.

Do not blindly trust model-generated data.

---

# AI Match Flow

```text
Project
   |
   v
Retrieve candidate profiles
   |
   v
Prepare structured candidate/project data
   |
   v
AI provider
   |
   v
Structured match explanation
   |
   v
Validate response
   |
   v
UI
```

The AI should explain matching factors.

Example:

```text
Strong overlap in:
- Python
- Machine Learning
- Environmental research

Relevant experience:
- 2 related projects
```

Avoid claiming that the match is objectively correct.

---

# AI Research Assistant Flow

```text
User research content
        |
        v
Next.js server
        |
        v
AI provider
        |
        v
Structured response
        |
        v
Research Assistant UI
```

Possible operations:

```text
summarize
explain
review
suggest_questions
improve
```

The assistant must work with the selected project/research context.

---

# AI Research Roadmap Flow

```text
Project idea
     |
     v
AI roadmap generation
     |
     v
Structured roadmap
     |
     v
Validate
     |
     v
Save to Supabase
     |
     v
Editable roadmap UI
```

The generated roadmap is only a starting point.

The user owns and edits the final roadmap.

---

# Security Rules

Never:
- commit API keys;
- expose Supabase service-role keys to the browser;
- expose AI API keys to the browser;
- trust arbitrary client-provided authorization;
- allow users to edit projects they do not own or belong to;
- expose private project content to unauthorized users.

Use environment variables.

Typical variables:

```text
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
AI_API_KEY
```

Use server-only environment variables for secrets.

---

# Code Organization

Prefer a structure similar to:

```text
src/
  app/
    page.tsx
    login/
    register/
    dashboard/
    projects/
    researchers/
    news/

  components/
    ui/
    layout/
    project/
    researcher/
    ai/

  lib/
    supabase/
    ai/
    news/
    validation/
    utils/

  types/
```

The exact structure can evolve if Next.js conventions make another organization clearer.

---

# UI Rules

- Reuse components.
- Avoid duplicated cards/forms/buttons.
- Keep spacing consistent.
- Use semantic HTML.
- Provide loading states.
- Provide empty states.
- Provide error states.
- Make forms validate input.
- Keep mobile layouts usable.
- Avoid huge amounts of client-side state when server state is sufficient.

---

# Database Rules

- Use migrations for schema changes.
- Do not manually modify production schema without documenting it.
- Add appropriate indexes for frequently searched fields.
- Use foreign keys.
- Use Row Level Security where user/project privacy requires it.
- Never store secrets in database records unnecessarily.

---

# Development Strategy

Build vertically.

Do not build every database table first and only then create the UI.

Instead:

1. Build one feature.
2. Connect its UI.
3. Connect its database.
4. Test it.
5. Then move to the next feature.

Priority:

```text
Authentication
     ↓
Profiles
     ↓
Projects
     ↓
Project collaboration
     ↓
Discovery
     ↓
AI Research Roadmap
     ↓
AI Match
     ↓
AI Research Assistant
     ↓
Science News
     ↓
Polish
```

---

# Demo Scenario

The final presentation should be possible with one coherent scenario:

1. User registers.
2. User creates a researcher profile.
3. User creates a scientific project.
4. AI generates a research roadmap.
5. User edits the roadmap.
6. User searches for collaborators.
7. AI Match recommends researchers.
8. User adds a collaborator.
9. Team adds a research result.
10. AI Research Assistant summarizes/reviews the result.
11. User opens science news.
12. Project can be discovered through the project search.

This flow is more important than implementing a large number of secondary features.

---

# Out of Scope

Do not implement:

- microservices;
- Kubernetes;
- dedicated VPS;
- complex DevOps;
- real government integrations;
- real university SSO;
- real government tender systems;
- real payment processing;
- full Git implementation;
- Google Docs-style real-time editing;
- production scientific peer review;
- production-grade recommendation infrastructure.

The platform may use realistic demo data.

---

# Claude Code Rules

When working on this repository:

1. Read this file first.
2. Read `INSTRUMENTS.md`.
3. Read `ROADMAP.md`.
4. Inspect the existing code before modifying it.
5. Inspect the supplied design images before implementing a new screen.
6. Do not replace the selected stack without a strong technical reason.
7. Do not introduce unnecessary dependencies.
8. Keep the application deployable to Vercel.
9. Keep Supabase as the primary database/backend service.
10. Keep AI logic server-side.
11. Implement features incrementally.
12. Test the affected functionality after changes.
13. Do not create fake integrations and present them as real integrations.
14. Prefer simple code that a student team can understand and maintain.
15. Update documentation when architecture or setup changes.

## Definition of a Successful Implementation

A successful implementation is not the largest implementation.

It is a project that:

- looks polished;
- follows the supplied visual design;
- has a clear architecture;
- works end-to-end;
- demonstrates the three AI features;
- uses Supabase correctly;
- deploys to Vercel;
- is understandable to a student development team;
- can be demonstrated reliably without expensive infrastructure.
