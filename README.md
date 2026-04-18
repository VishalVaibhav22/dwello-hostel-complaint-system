# Dwello - Hostel Complaint Management System with AI-based Automatic Categorization

Dwello is a full-stack web application designed for hostel residents to report issues and for administrators to manage and resolve them efficiently. The system includes an AI feature that automatically categorizes complaints based on their description, helping administrators organize and handle issues more effectively.

---

## Features

### Student

- Submit complaints with title, description, images (up to 3), and availability slots
- Complaint category is automatically assigned using AI
- Track complaint status through stages: Open -> In Progress -> Resolved
- View rejection reasons if a complaint is declined
- Receive notifications when complaint status changes
- View announcements posted by admin

### Admin

- Dashboard showing complaint overview and quick updates
- All complaints page with search, filter, and sorting
- View complaint category assigned automatically
- Analytics dashboard with charts and statistics
- Manage registered students
- Create and manage hostel announcements
- Reject complaints with reason
- View uploaded complaint images securely

### General

- JWT-based authentication with role-based access control
- Responsive UI for desktop, tablet, and mobile
- Complaint images uploaded to ImageKit and stored as URLs in MongoDB
- Collapsible sidebar navigation

---

## AI Feature

### Automatic Complaint Categorization

The system includes an AI component that analyzes complaint text and assigns a category automatically. This reduces manual effort and helps administrators quickly identify the type of issue.

Categories used:

- Electrical
- Plumbing
- Housekeeping
- Internet
- Mess
- Furniture
- Other

Workflow:

1. Student submits complaint
2. System analyzes complaint text
3. Category is assigned automatically
4. Complaint stored in database
5. Admin views categorized complaint
6. Analytics dashboard updates

---

## Technology Stack

### Frontend

- React 18
- Vite
- Tailwind CSS
- Framer Motion

### Backend

- Node.js
- Express.js
- Multer (multipart parsing)

### Database

- MongoDB using Mongoose

### Media Storage

- ImageKit.io (complaint image hosting and delivery)

### Authentication

- JWT
- bcryptjs

### File Upload

- Multer + ImageKit (server-side upload)

### AI Component

- Python
- Flask
- scikit-learn
- joblib

---

## Project Architecture

```text
Client (React + Vite)
	|
	| HTTP requests (JWT authentication)
	v
Backend API (Node.js + Express)
	|
	| Read/Write operations
	v
Database (MongoDB)
	^
	|
	| Complaint text for prediction
	v
AI Service (Flask + ML Model)
```

### Architecture Notes

- Frontend handles user interface, forms, and role-based pages for students and admins.
- Backend manages authentication, complaint workflow, notifications, and business logic.
- MongoDB stores users, complaints, categories, announcements, and related data.
- AI service analyzes complaint text and predicts the complaint category.
- Backend saves the predicted category along with the complaint in the database.
- Complaint images are uploaded to ImageKit from backend and only image URLs are stored in MongoDB.
- If the AI service is unavailable, the backend assigns the Other category as a safe fallback.

---

## AI Model Overview

- Algorithm used: Support Vector Machine (SVM)
- Feature extraction: TF-IDF vectorization
- Model deployed as an API using Flask
- Model predicts complaint category in real time
- Integrated with Node.js backend

Model file:

- complaint_classifier.pkl

---

## Installation

Clone the repository:

```bash
git clone https://github.com/VishalVaibhav22/dwello-ai-hostel-complaint-system.git
cd dwello-ai-hostel-complaint-system
```

Install frontend dependencies:

```bash
npm install
```

Install backend dependencies:

```bash
cd server
npm install
```

Set backend environment variables in `server/.env`:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/hostel-complaint
JWT_SECRET=your_jwt_secret_key
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=change_this_password
AI_SERVICE_URL=http://localhost:8000/predict

# ImageKit
IMAGEKIT_PUBLIC_KEY=your_imagekit_public_key
IMAGEKIT_PRIVATE_KEY=your_imagekit_private_key
IMAGEKIT_URL_ENDPOINT=https://ik.imagekit.io/your_imagekit_id
```

Install AI dependencies:

```bash
pip install flask joblib scikit-learn
```

---

## Run the Application

Terminal 1 - Start AI service:

```bash
cd ai
python ai_service.py
```

Terminal 2 - Start backend:

```bash
cd server
npm start
```

Terminal 3 - Start frontend:

```bash
npm run dev
```

Application URLs:

- Frontend: http://localhost:5173
- Backend: http://localhost:5000
- AI service: http://localhost:8000

---

## Project Structure

```text
hostel-complaint-management/
├── ai/
│   ├── ai_service.py
│   ├── complaint_classifier.pkl
│   ├── hostel_complaints.csv
│   └── requirements.txt
├── server/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── utils/
│   └── server.js
├── src/
│   ├── api/
│   ├── components/
│   ├── context/
│   ├── layouts/
│   ├── pages/
│   ├── utils/
│   ├── App.jsx
│   └── main.jsx
├── docs/
├── public/
├── package.json
└── README.md
```

---

## Future Improvements

- Email notifications
- Forgot password functionality
- Complaint priority prediction
- Mobile application support

---

## License

MIT License
