# Dwello — Hostel Complaint Management System

A full-stack web application for hostel residents to report issues and for administrators to track, manage, and resolve them. Built with the MERN stack.

## Features

### Student

- Submit complaints with title, description, images (up to 3), and availability slots
- Track complaint status through a clear lifecycle: **Open → In Progress → Resolved**
- View rejection reasons when a complaint is declined
- Receive real-time notifications on status changes
- Browse admin-published announcements

### Admin

- Dashboard with complaint overview and quick status updates
- **Analytics page** — status distribution, resolution time trends, response rate, daily/weekly charts
- **All Complaints view** — search, filter, sort across all complaints with student details
- **Student management** — browse all registered students with complaint statistics
- **Announcements** — create and manage hostel-wide announcements
- Reject complaints with a mandatory reason
- View uploaded images with authenticated access

### General

- JWT-based authentication with role-based access control (student / admin)
- Responsive UI across desktop, tablet, and mobile
- Collapsible sidebar navigation
- University-specific registration 

## Tech Stack

| Layer       | Technology                                  |
| ----------- | ------------------------------------------- |
| Frontend    | React 18, Vite, Tailwind CSS, Framer Motion |
| Backend     | Node.js, Express.js                         |
| Database    | MongoDB (Mongoose ODM)                      |
| Auth        | JWT, bcryptjs                               |
| File Upload | Multer                                      |
| Validation  | express-validator                           |

## Getting Started

### Prerequisites

- Node.js ≥ 18
- MongoDB (local or Atlas)

### Installation

```bash
# Clone
git clone https://github.com/VishalVaibhav22/dwello-hostel-complaint-system.git
cd dwello-hostel-complaint-system

# Install client dependencies
npm install

# Install server dependencies
cd server
npm install
```

### Environment Variables

Create `server/.env`:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/hostel-complaint
JWT_SECRET=your_jwt_secret_key
NODE_ENV=development
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=change_this_password
```

### Run

```bash
# Terminal 1 — Backend
cd server
npm start
# → http://localhost:5000

# Terminal 2 — Frontend
npm run dev
# → http://localhost:5173
```

On first launch, an admin account is automatically created from the `ADMIN_EMAIL` and `ADMIN_PASSWORD` environment variables.

## Project Structure

```
├── server/
│   ├── controllers/        # Business logic (auth, complaints, admin, notifications, announcements)
│   ├── middleware/          # JWT auth, admin role guard, multer upload config
│   ├── models/              # Mongoose schemas (User, Complaint, Notification, Announcement)
│   ├── routes/              # Express route definitions
│   ├── utils/               # Admin seeder
│   └── server.js            # Entry point
│
├── src/
│   ├── api/                 # Axios client and API functions
│   ├── components/          # Shared components (Logo)
│   ├── context/             # AuthContext (React Context)
│   ├── layouts/             # StudentLayout (sidebar + header)
│   ├── pages/               # All route-level pages
│   └── utils/               # Constants
│
├── docs/                    # API reference and architecture docs
└── public/                  # Static assets
```

## API Reference

See [docs/API_REFERENCE.md](docs/API_REFERENCE.md) for the full endpoint documentation.

## Architecture

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for system design details.

## License

MIT — see [LICENSE.md](LICENSE.md)
