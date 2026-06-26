# StudySync — Group 11 Codebase

StudySync is a full-stack student study group app. It helps students create real profiles, select courses, share availability, find classmates, create/join study groups, schedule sessions, message groups, and leave reliability ratings after meetings.

This repo is intentionally built as a realistic class-project starter: clean architecture, database-backed models, REST APIs, and a React front end.

## Tech Stack

| Layer | Technology | Why it fits StudySync |
|---|---|---|
| Front End | React + TypeScript + Vite | Fast UI for student dashboards, forms, and group pages. TypeScript helps keep API data predictable. |
| Back End | Node.js + Express + TypeScript | Lightweight REST API for authentication, matching, groups, sessions, messages, and ratings. |
| Database | PostgreSQL + Prisma ORM | StudySync needs persistent relational data: users, courses, groups, memberships, schedules, messages, and ratings. |
| Dev Infra | Docker Compose | Runs PostgreSQL locally without installing it manually. |

## Main Features Included

- User registration and login with JWT authentication
- Course browsing and enrollment
- Availability editor
- Study partner matching based on shared courses and overlapping availability
- Study group creation and joining
- Group sessions
- Group messages / announcements
- Peer reliability ratings after sessions
- Prisma database schema and seed data

## Project Structure

```txt
studysync-codebase/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── seed.ts
│   └── src/
│       ├── middleware/
│       ├── routes/
│       ├── utils/
│       └── server.ts
├── frontend/
│   └── src/
│       ├── api/
│       ├── components/
│       ├── context/
│       ├── pages/
│       └── App.tsx
├── docs/
│   ├── architecture.md
│   ├── api.md
│   └── use-case-diagram.mmd
├── docker-compose.yml
└── package.json
```

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Create environment files

Copy the examples:

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

### 3. Start PostgreSQL

```bash
docker compose up -d
```

### 4. Generate Prisma client and run migrations

```bash
npm run db:generate
npm run db:migrate
```

### 5. Seed demo data

```bash
npm run seed
```

### 6. Run the app

```bash
npm run dev
```

Frontend: `http://localhost:5173`  
Backend: `http://localhost:4000`

## Demo Accounts After Seeding

| Name | Email | Password |
|---|---|---|
| Jessica He | jessica@studysync.dev | password123 |
| Maya Patel | maya@studysync.dev | password123 |
| Jordan Lee | jordan@studysync.dev | password123 |

## Suggested Presentation Talking Point

StudySync uses a three-tier architecture. The React client handles the student-facing UI, the Express API handles business logic like matching and group management, and PostgreSQL stores persistent academic/social data. This architecture fits the requirements because the app is not a one-time prompt tool; it needs durable accounts, schedule history, memberships, messages, and ratings.
