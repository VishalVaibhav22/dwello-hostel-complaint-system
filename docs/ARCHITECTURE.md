# System Architecture

## Overview

Dwello is a full-stack hostel complaint management system built with the **MERN stack** (MongoDB, Express.js, React, Node.js). The backend follows the **MVC pattern**, and the frontend uses a component-based architecture with React Router for navigation.

## Tech Stack

| Layer       | Technology                      |
| ----------- | ------------------------------- |
| Frontend    | React 18, Vite, Tailwind CSS    |
| Backend     | Express.js, Node.js             |
| Database    | MongoDB with Mongoose ODM       |
| Auth        | JWT (JSON Web Tokens), bcryptjs |
| File Upload | Multer (images stored on disk)  |
| Validation  | express-validator               |

## Directory Structure

```
├── server/
│   ├── controllers/       # Request handlers (business logic)
│   ├── middleware/         # Auth (JWT), admin role check, file upload
│   ├── models/             # Mongoose schemas (User, Complaint, Notification, Announcement)
│   ├── routes/             # Express route definitions
│   ├── utils/              # Admin seeder
│   └── server.js           # App entry point, DB connection, middleware setup
│
├── src/
│   ├── api/                # Axios instance and API call functions
│   ├── components/         # Shared UI components
│   ├── context/            # React Context (AuthContext)
│   ├── layouts/            # Page layouts (StudentLayout with sidebar)
│   ├── pages/              # Route-level page components
│   └── utils/              # Constants and shared utilities
│
├── docs/                   # API reference and architecture docs
└── public/                 # Static assets (logos, icons)
```

## Authentication Flow

1. User registers or logs in via `/auth/register` or `/auth/login`.
2. Server validates credentials and returns a JWT (7-day expiry).
3. Frontend stores the token in `localStorage` and attaches it to all API requests via an Axios interceptor.
4. Protected routes check the token via `auth` middleware; admin routes additionally verify the `admin` role via `adminAuth` middleware.

## Data Model

- **User**: Students and admins in a single collection. Students have university, hostel, room number, and optional roll number.
- **Complaint**: Linked to a user via `userId`. Tracks status history, images, availability slots, and rejection details.
- **Notification**: Created automatically on complaint status changes. Linked to the affected user.
- **Announcement**: Admin-created messages with per-user seen tracking.

## Key Design Decisions

- **Single collection per entity** — no per-hostel sharding; hostel is a filter field.
- **Authenticated image serving** — uploaded images are served through an Express route that verifies JWT ownership, not as public static files.
- **Role-based access** — a single `role` field on the User model (`student` | `admin`) drives all authorization logic.
- **Status transitions** — complaint status follows a strict flow: Open → In Progress → Resolved, with a separate rejection path.
