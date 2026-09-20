# INSTRUMENTS.md

## Project

AI-powered scientific collaboration platform — a student demonstration project.

The platform is conceptually similar to a GitHub for science: users can create research projects, collaborate, discover researchers/mentors, and use AI during research.

This is **not a production government or university platform**. Optimize for a convincing, maintainable demo that can run cheaply on free/low-cost infrastructure.

## Core Stack

### Frontend + Backend
- Next.js
- TypeScript
- React
- App Router
- Server Actions / Route Handlers where appropriate

Use Next.js as the full-stack application. Do **not** introduce a separate Spring Boot/backend server unless explicitly requested.

### Styling / UI
- Tailwind CSS
- shadcn/ui
- Lucide icons or the project's existing icon system
- Responsive design

Keep UI components reusable and avoid duplicated page-specific implementations.

### Database / Backend Services
- Supabase
  - PostgreSQL database
  - Authentication
  - Storage if file uploads are needed
  - Row Level Security where appropriate

### AI
Only these three AI product features are in scope:

1. **AI Match**
   - Recommend researchers/mentors for a project.
   - Explain the match using profile/project skills, research fields, interests and experience.
   - Return a transparent match explanation rather than pretending the score is scientifically objective.

2. **AI Research Assistant**
   - Summarize research text.
   - Explain sections.
   - Identify unclear structure or possible weaknesses.
   - Suggest research questions or improvements.
   - Help users work with the content of their project.

3. **AI Research Roadmap**
   - Generate a structured research plan from a project idea.
   - Suggested stages can include research question, literature review, methodology, data collection, analysis, results and conclusion.
   - Users must be able to edit the generated roadmap.

The AI provider can be Gemini API or OpenAI API. Keep the provider behind a small server-side abstraction so it can be changed later.

**Never expose AI API keys in client-side code.**

### External Science News
Use a public news/RSS/scientific-news API only for the science-news section.

The news integration is secondary to the core platform. If an external API is unavailable, the application should still work with seeded/mock news data in development.

### Version Control
- Git
- GitHub

Use conventional, descriptive commits and keep secrets out of Git.

### Deployment
- Vercel for the Next.js application
- Supabase for database/auth/storage
- Low-cost domain if desired

No dedicated physical server is required.

## Design Assets

The UI design will be supplied as **generated images/screenshots**.

A separate project file/folder will contain all design images. Treat those images as the visual source of truth for implementation.

Do not replace supplied design assets with random placeholders when the real project asset is available.

When implementing a supplied visual design:
- inspect the provided assets first;
- reproduce layout, spacing, typography, hierarchy and visual treatment;
- keep implementation responsive;
- preserve reusable components instead of hardcoding every screen independently.

If the assets later come from Figma, follow the project's Figma design-to-code workflow.

## Core Website Functionality

The site should contain at minimum:

- Landing/home page
- Registration/login
- User profile
- Researcher profile
- Project discovery
- Project creation
- Project details
- Project members
- Project editing
- Research results/notes
- Search and filtering
- Mentor/researcher discovery
- Notifications or basic activity feedback
- Science news
- AI Research Assistant
- AI Match
- AI Research Roadmap

Do not build unrelated social-network features unless they directly support the research workflow.

## Suggested Data Model

Core tables/entities:

- users / profiles
- projects
- project_members
- research_results
- research_roadmap_items
- match_requests or match_results
- mentor_profiles
- news_items
- notifications

Optional later:
- comments
- bookmarks
- project_files
- activity_log

Prefer a simple relational model over unnecessary abstractions.

## Development Principles

1. Build the smallest working version first.
2. Prefer simple server-side logic over complex infrastructure.
3. Keep database access centralized and typed.
4. Validate user input.
5. Protect private project data.
6. Do not put secrets in the browser.
7. Do not create fake production integrations with universities/government institutions.
8. Demo/mock data is acceptable where a real external integration is unnecessary.
9. AI output must be presented as assistance, not authoritative scientific validation.
10. Keep the application deployable to Vercel throughout development.
