# Asterra

### AI-powered scientific collaboration platform

**Asterra** is a student-built platform designed to make scientific research more collaborative, structured, and accessible.

The idea behind Asterra is simple: **“GitHub for science.”**

Researchers and students can create research projects, document their ideas and experiments, collaborate with other researchers, discover mentors, share research results, and explore scientific projects created by the community.

Asterra also uses AI to assist researchers throughout the research process — from planning a research roadmap to finding potential collaborators and reviewing research notes.

> **AI assists the research process, but does not replace scientific judgment or validate research results.**

---

## 🎯 What problem does Asterra solve?

Scientific research can involve many disconnected tools:

* documents for research notes;
* spreadsheets for experiments;
* separate platforms for communication;
* social networks for finding collaborators;
* websites for discovering scientific papers;
* task managers for planning research.

Asterra brings these activities together into a single research-oriented platform.

Instead of simply storing a finished paper, Asterra treats research as a **living process** that evolves over time.

---

## 🔬 Research as a Living Graph

One of Asterra's main concepts is representing research as a connected graph.

A project can contain:

**Research Question → Hypothesis → Methodology → Experiments → Results**

The graph can also include:

* researchers;
* mentors;
* scientific sources;
* related research;
* project forks;
* different research directions;
* experiment history.

This allows users to see not only the final result, but also **how the research developed**.

---

## 🤖 AI-Assisted Research

Asterra integrates AI into several parts of the research workflow.

### AI Research Roadmap

AI can help transform a research idea into a structured roadmap containing possible research stages and directions.

Researchers can then edit and adapt the generated roadmap instead of treating it as a final answer.

### AI Match

AI analyzes research interests and project information to help discover potentially relevant collaborators and mentors.

### Research Assistant

The AI assistant can help researchers:

* summarize research notes;
* review written material;
* identify possible gaps;
* organize information;
* suggest improvements.

AI functionality is implemented server-side and supports multiple providers.

---

## 👥 Collaboration

Asterra is designed around collaboration between researchers.

Users can:

* create researcher profiles;
* discover other researchers;
* connect with people who share similar interests;
* invite collaborators to projects;
* request to join research projects;
* communicate through direct messages;
* receive real-time notifications.

Project membership is based on consent: project owners control invitations and join requests.

---

## 🧪 Research Projects

Each project can contain its own research workspace.

Users can:

* create and edit projects;
* define research questions;
* create hypotheses;
* build research roadmaps;
* document experiments;
* add research results;
* attach scientific sources;
* track the evolution of ideas;
* view project history;
* fork projects into new research directions.

This makes the project more than a simple document — it becomes a structured representation of the research process.

---

## 📰 Scientific Discovery

Asterra also provides a science-news feed organized by research fields:

* Computer Science
* Biology
* Physics
* Chemistry
* Astronomy
* Environmental Science
* Medicine

Users can discover scientific news and explore research projects through the platform.

Projects and researchers can also be discovered through search and filtering.

---

## 🌐 Social Features

Asterra combines research tools with social collaboration features.

Users can:

* follow their research interests through project discovery;
* send connection requests;
* find potential collaborators;
* exchange direct messages;
* bookmark interesting projects;
* receive real-time notifications.

The goal is to create a network where students, researchers, and mentors can find each other around shared scientific interests.

---

## 🌍 Multilingual Interface

The interface is available in:

* 🇬🇧 English
* 🇷🇺 Russian
* 🇰🇿 Kazakh

The platform interface is translated, while research content and AI-generated research assistance remain in English to maintain consistency for scientific communication.

---

## 🏗️ Technology Stack

Asterra is built using modern web technologies:

| Technology                | Purpose                                        |
| ------------------------- | ---------------------------------------------- |
| **Next.js 16**            | Full-stack React framework                     |
| **React 19**              | User interface                                 |
| **TypeScript**            | Type-safe development                          |
| **Tailwind CSS 4**        | Styling                                        |
| **shadcn/ui**             | UI components                                  |
| **Supabase**              | Authentication, database, storage and realtime |
| **Gemini / OpenAI / xAI** | AI functionality                               |
| **Vercel**                | Deployment                                     |

The application uses the **Next.js App Router** architecture.

---

## 🗺️ Project Architecture

Asterra is divided into several major systems:

```text
Asterra
│
├── Authentication
│   └── Supabase Auth
│
├── Research Projects
│   ├── Questions
│   ├── Hypotheses
│   ├── Methodology
│   ├── Experiments
│   ├── Results
│   └── Sources
│
├── Research Graph
│   ├── Timeline
│   ├── Version History
│   └── Project Forks
│
├── Collaboration
│   ├── Researchers
│   ├── Connections
│   ├── Mentors
│   ├── Invitations
│   └── Join Requests
│
├── Communication
│   ├── Direct Messages
│   └── Notifications
│
├── Discovery
│   ├── Projects
│   ├── Researchers
│   ├── Search
│   └── Bookmarks
│
├── Science News
│   └── RSS / News API
│
└── AI
    ├── Research Roadmap
    ├── AI Match
    └── Research Assistant
```

---

## 🚀 Example Research Workflow

A typical Asterra workflow looks like this:

```text
Create a research idea
        ↓
Create a project
        ↓
Define the research question
        ↓
Generate an AI-assisted roadmap
        ↓
Edit and refine the roadmap
        ↓
Find collaborators / mentors
        ↓
Design experiments
        ↓
Document results
        ↓
Use AI to review research notes
        ↓
Track research evolution
        ↓
Share and discover the project
```

---

## 🎓 Project Purpose

Asterra is currently a **student demonstration project** exploring how modern web technologies and AI can be applied to scientific collaboration.

The project focuses on combining:

**Scientific research + collaboration + knowledge management + AI**

into one platform.

It is not intended to replace scientific institutions, peer review, academic supervision, or professional research infrastructure.

Instead, Asterra demonstrates how a digital platform could help students and researchers **organize research, find collaborators, document experiments, and explore new research directions.**

---

## 📚 Documentation

Additional technical documentation is available in the repository:

* `ARCHITECTURE.md` — system architecture
* `ROADMAP.md` — development roadmap
* `INSTRUMENTS.md` — project tools and components
* `CLAUDE.md` — AI-assisted development instructions

---

## 📌 Current Status

**Asterra is a student demonstration project.**

The platform currently demonstrates:

* authentication and researcher profiles;
* research project management;
* collaborative research workflows;
* research graphs;
* experiments and sources;
* project version history;
* project forking;
* researcher discovery;
* connections and messaging;
* real-time notifications;
* science news;
* multilingual interface;
* AI-assisted research tools.

The project is actively designed as an exploration of what an **AI-native scientific collaboration platform** could look like.
