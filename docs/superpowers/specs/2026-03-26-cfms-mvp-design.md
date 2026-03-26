# CFMS MVP Design Spec

## Context

College Fest Management System (CFMS) is a college project that needs to demonstrate database concepts (BCNF normalization, triggers, stored procedures, concurrency handling) through a working web application. The system manages college festival events — letting students discover and register for events, admins manage events/venues, and judges score teams.

This is an academic project, not a production system. The database layer is a first-class deliverable.

## Tech Stack

- **Frontend**: React 18 + Vite + Tailwind CSS
- **Backend**: Node.js + Express
- **Database**: MySQL (raw SQL via `mysql2` — no ORM)
- **Auth**: JWT (access + refresh tokens), bcrypt password hashing

## Project Structure

```
cfms/
├── client/                    # React SPA
│   ├── src/
│   │   ├── components/        # Navbar, EventCard, DataTable, ProtectedRoute
│   │   ├── pages/             # 13 pages (see below)
│   │   ├── context/           # AuthContext (JWT + role state)
│   │   ├── api/               # Axios instance + per-resource API helpers
│   │   └── App.jsx            # React Router setup
│   └── package.json
│
├── server/
│   ├── routes/                # auth, events, venues, registrations, teams, scores
│   ├── middleware/            # auth, roleGuard, rateLimiter, errorHandler
│   ├── models/                # DB query functions (parameterized SQL)
│   ├── config/                # DB connection pool, env config
│   └── package.json
│
├── database/
│   ├── schema.sql             # CREATE TABLEs (BCNF normalized)
│   ├── triggers.sql           # check_capacity trigger
│   ├── procedures.sql         # GenerateLeaderboard() stored procedure
│   ├── seed.sql               # Sample data for demo
│   └── er-diagram.png         # Generated ER diagram for submission
│
└── README.md
```

## Database Schema (6 tables)

### Participants
| Column | Type | Constraints |
|--------|------|-------------|
| ParticipantID | INT | PK, AUTO_INCREMENT |
| FName | VARCHAR(50) | NOT NULL |
| LName | VARCHAR(50) | NOT NULL |
| Email | VARCHAR(100) | UNIQUE, NOT NULL |
| PasswordHash | VARCHAR(255) | NOT NULL |
| Phone | VARCHAR(15) | |
| College | VARCHAR(100) | |
| Role | ENUM('student','admin','judge') | DEFAULT 'student' |
| CreatedAt | DATETIME | DEFAULT CURRENT_TIMESTAMP |

### Events
| Column | Type | Constraints |
|--------|------|-------------|
| EventID | INT | PK, AUTO_INCREMENT |
| VenueID | INT | FK -> Venues |
| EventName | VARCHAR(100) | NOT NULL |
| Category | VARCHAR(50) | |
| Description | TEXT | |
| EventDate | DATE | NOT NULL |
| StartTime | TIME | |
| EndTime | TIME | |
| Max_Capacity | INT | NOT NULL |
| Current_Capacity | INT | DEFAULT 0 |
| TeamSize | INT | DEFAULT 1 (1 = solo event) |
| Status | ENUM('upcoming','active','completed') | DEFAULT 'upcoming' |

### Venues
| Column | Type | Constraints |
|--------|------|-------------|
| VenueID | INT | PK, AUTO_INCREMENT |
| VenueName | VARCHAR(100) | NOT NULL |
| Street | VARCHAR(100) | |
| City | VARCHAR(50) | |
| State | VARCHAR(50) | |
| ZIP | VARCHAR(10) | |
| Capacity | INT | |

### Teams
| Column | Type | Constraints |
|--------|------|-------------|
| TeamID | INT | PK, AUTO_INCREMENT |
| EventID | INT | FK -> Events |
| TeamName | VARCHAR(100) | NOT NULL |
| JoinCode | VARCHAR(8) | UNIQUE, NOT NULL |
| LeaderID | INT | FK -> Participants |
| CreatedAt | DATETIME | DEFAULT CURRENT_TIMESTAMP |

### Registrations
| Column | Type | Constraints |
|--------|------|-------------|
| ParticipantID | INT | PK (composite), FK -> Participants |
| EventID | INT | PK (composite), FK -> Events |
| TeamID | INT | FK -> Teams, NULLABLE |
| RegDate | DATETIME | DEFAULT CURRENT_TIMESTAMP |
| Status | ENUM('confirmed','cancelled') | DEFAULT 'confirmed' |

### Judges_Scores
| Column | Type | Constraints |
|--------|------|-------------|
| ScoreID | INT | PK, AUTO_INCREMENT |
| JudgeID | INT | FK -> Participants |
| TeamID | INT | FK -> Teams |
| EventID | INT | FK -> Events |
| CriteriaName | VARCHAR(50) | NOT NULL |
| Score | DECIMAL(5,2) | NOT NULL |
| Weight | DECIMAL(3,2) | DEFAULT 1.00 |
| ScoredAt | DATETIME | DEFAULT CURRENT_TIMESTAMP |

### Relationships
- Events M:1 Venues
- Registrations M:1 Participants, M:1 Events
- Teams M:1 Events
- Teams.LeaderID -> Participants
- Judges_Scores M:1 Teams, M:1 Events, M:1 Participants (as judge)
- Participants M:N Teams (via Registrations.TeamID)

## Academic Showcase (Database Concepts)

### BCNF Normalization
- **1NF**: Name split into FName/LName, address into Street/City/State/ZIP
- **2NF**: Registrations uses composite PK (ParticipantID, EventID) with no partial dependencies
- **3NF**: Venue details extracted to separate table (no VenueName -> VenueCapacity transitive dependency)
- **BCNF**: Every determinant is a candidate key

### Trigger: `check_capacity`
```sql
BEFORE INSERT ON Registrations
-- Reads Current_Capacity and Max_Capacity from Events
-- If current >= max: SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Event at capacity'
-- Else: UPDATE Events SET Current_Capacity = current + 1
```

### Stored Procedure: `GenerateLeaderboard(eventId)`
```sql
-- 1. Aggregate judge scores from Judges_Scores with criteria-specific weights
-- 2. JOIN with Teams and Events
-- 3. Calculate weighted averages
-- 4. Return ranked results ordered by weighted score DESC
```

### Concurrency Control
```sql
START TRANSACTION;
SELECT Current_Capacity, Max_Capacity FROM Events WHERE EventID = ? FOR UPDATE;
-- Row locked — validate capacity — insert registration
COMMIT;
```
Transaction isolation level: REPEATABLE READ.

## REST API

### Auth (public)
- `POST /api/v1/auth/register` — create account
- `POST /api/v1/auth/login` — returns JWT access token (24h) + refresh token

### Events (public read, admin write)
- `GET /api/v1/events?category=&date=&venue=&page=&limit=` — paginated list with filters
- `GET /api/v1/events/:id` — event details + capacity info
- `POST /api/v1/events` — [admin] create event
- `PUT /api/v1/events/:id` — [admin] update event
- `DELETE /api/v1/events/:id` — [admin] delete event

### Venues (admin)
- `GET /api/v1/venues` — list all
- `POST /api/v1/venues` — create
- `PUT /api/v1/venues/:id` — update
- `DELETE /api/v1/venues/:id` — delete

### Registrations (student)
- `POST /api/v1/registrations` — register for event (uses transaction + FOR UPDATE)
- `GET /api/v1/registrations/me` — my registrations
- `DELETE /api/v1/registrations/:eventId` — cancel registration

### Teams (student)
- `POST /api/v1/teams` — create team for event (generates 8-char join code)
- `POST /api/v1/teams/join` — join team via code
- `GET /api/v1/teams/:id` — team details + members

### Scores (judge)
- `POST /api/v1/scores` — submit score for team on criteria
- `GET /api/v1/leaderboard/:eventId` — calls GenerateLeaderboard(), returns ranked results

### Admin extras
- `GET /api/v1/admin/users` — list participants
- `PUT /api/v1/admin/users/:id/role` — assign role (e.g., promote to judge)

### Middleware
- `authMiddleware` — validates JWT signature, attaches user to request
- `roleGuard(roles)` — checks user role against allowed roles
- `rateLimiter` — 100 requests per 15 minutes per IP
- `errorHandler` — catches exceptions, returns consistent error JSON

## Frontend Pages (13)

### Public (4)
1. **Landing Page** — hero section, featured upcoming events, CTA to register/login
2. **Login / Register** — tabbed form, role selection on register, Yup validation
3. **Event Listing** — filterable grid of EventCards (category, date, venue filters)
4. **Event Detail** — full event info, capacity progress bar, register/create-team buttons

### Student Dashboard (4)
5. **My Registrations** — table of registered events with status
6. **My Teams** — teams I lead or belong to, with member lists
7. **Create Team** — select event, name team, receive join code to share
8. **Join Team** — enter join code, see team info, confirm join

### Admin Dashboard (3)
9. **Manage Events** — DataTable with CRUD, create/edit via modal forms
10. **Manage Venues** — DataTable with CRUD
11. **Manage Users** — user list, role assignment dropdown

### Judge Dashboard (2)
12. **Score Entry** — select event -> see teams -> score each criteria with weights
13. **Leaderboard** — ranked results table from stored procedure, refresh button

### Shared Components
- **Navbar** — role-aware navigation links, logout
- **EventCard** — event thumbnail with name, date, category, capacity indicator
- **DataTable** — sortable, filterable table used across admin/judge pages
- **ProtectedRoute** — redirects to login if unauthenticated, checks role

## What's Excluded from MVP
- Payment processing (registrations are free)
- Certificate PDF generation
- WebSocket real-time updates (leaderboard uses manual refresh)
- Analytics dashboard (heatmaps, trends)
- Sponsors entity and management
- Email invitations for team formation
- Redis caching

## ER Diagram Deliverable
Generate an ER diagram image (`database/er-diagram.png`) using Mermaid CLI or dbdiagram.io during the build phase. This is a required submission artifact.
