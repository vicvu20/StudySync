# StudySync Architecture

## Architecture Style

StudySync uses a three-tier web application architecture:

1. **Client / Presentation Layer** — React front end
2. **Application / API Layer** — Node.js and Express back end
3. **Data Layer** — PostgreSQL database accessed through Prisma ORM

This architecture fits the app because StudySync needs real user accounts, course enrollment, availability matching, persistent study groups, scheduled sessions, messages, and feedback history. Those requirements need durable storage and reusable business logic, not a one-time generated response.

## Front End

**Recommended technology:** React + TypeScript + Vite

The front end provides the student dashboard, login/register forms, course enrollment screen, availability editor, group list, group detail pages, and rating/message forms. React is a good fit because StudySync has reusable UI elements like group cards, forms, session lists, and profile panels.

## Back End

**Recommended technology:** Node.js + Express + TypeScript

The back end exposes REST API endpoints for authentication, users, courses, availability, groups, sessions, messages, and ratings. It also contains matching logic so the app can compare shared courses and overlapping availability consistently.

## Database

**Recommended technology:** PostgreSQL + Prisma ORM

PostgreSQL is a relational database, which fits StudySync because many objects are connected:

- A user can be enrolled in many courses.
- A course can have many users and study groups.
- A study group can have many members, sessions, messages, and ratings.
- A student can have many availability windows.

Prisma makes the schema readable and gives the back end type-safe database queries.

## Data Flow

```txt
Student Browser
   ↓
React Front End
   ↓ REST/JSON
Express API
   ↓ Prisma ORM
PostgreSQL Database
```

## Security Notes

- Passwords are hashed with bcrypt.
- Authentication uses JWT bearer tokens.
- Protected routes require a valid token.
- The front end stores only the token and basic user info.
- Password hashes are never returned to the client.
