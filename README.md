# Dwello - Hostel Complaint Management System with AI-based Complaint Categorization and Priority Prediction

Dwello is a full-stack web application designed for hostel residents to report issues and for administrators to manage and resolve them efficiently. The system includes AI features that automatically categorize complaints and determine their priority based on the complaint description, helping administrators organize and respond to issues more effectively.

---

## Features

### Student

- Submit complaints with title, description, images (up to 3), and availability slots
- Complaint category is automatically assigned using AI
- Complaint priority is automatically determined based on urgency
- Track complaint status through stages: Open -> In Progress -> Resolved
- View rejection reasons if a complaint is declined
- Receive notifications when complaint status changes
- View announcements posted by admin

### Admin

- Dashboard showing complaint overview and quick updates
- All complaints page with search, filter, and sorting
- View complaint category assigned automatically
- View complaint priority level (Low, Medium, High, Critical)
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

## AI Features

### 1. Automatic Complaint Categorization

The system uses a machine learning model to analyze complaint text and assign a category automatically. This reduces manual effort and helps administrators quickly identify the type of issue.

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

---

### 2. Complaint Priority Prediction

The system uses a Large Language Model (Google Gemini API) to determine the urgency level of each complaint based on its description.

Priority levels:

- Low
- Medium
- High
- Critical

Example:

"WiFi not working before exam tomorrow" -> High  
"Electric spark from switch" -> Critical

If the Gemini priority service is unavailable, the system safely assigns a default priority of Medium.

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

### AI Components

Complaint Categorization:

- Python
- Flask
- scikit-learn
- joblib
- Support Vector Machine (SVM)

Priority Prediction:

- Google Gemini API
- Node.js integration

---

## Project Architecture

```text
Client (React + Vite)
	|
	| HTTP requests (JWT authentication)
	v
Backend API (Node.js + Express)
	|
   ┌────┴──────────────┐
   v                   v
Database (MongoDB)   ImageKit (Images)
	^
	|
	| Complaint text for prediction
	v
Categorization Service (Flask)

	|
	| Urgency analysis
	v
Gemini API (Priority Prediction)
```

### Architecture Notes

- Frontend: role-based UI for students and admins.
- Backend: auth, complaint workflow, and notifications.
- MongoDB: users, complaints, announcements, and metadata.
- Categorization service: predicts complaint category.
- Gemini: predicts complaint priority.
- ImageKit: stores complaint images as hosted URLs.
- Fallbacks: category `Other`, priority `Medium`.

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
git clone https://github.com/VishalVaibhav22/dwello-hostel-complaint-system.git
cd dwello-hostel-complaint-system
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

# Gemini API
GEMINI_API_KEY=your_gemini_api_key
GEMINI_DEFAULT_PRIORITY=Medium
GEMINI_MAX_INPUT_LENGTH=3000
```

Install AI dependencies:

```bash
pip install flask joblib scikit-learn
```

---

## Run the Application

Terminal 1 - Start categorization service:

```bash
cd ai
python categorization_service.py
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
- Categorization service: http://localhost:8000

---

## Project Structure

```text
hostel-complaint-management/
├── ai/
│   ├── categorization_service.py
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

## Automation Testing (Selenium + TestNG)

The project includes a dedicated Java automation suite in `DwelloAutomation/` for end-to-end validation of student and admin workflows.

### What this automation covers

- End-to-end UI validation for login, complaint lifecycle, admin actions, and system flows
- AI-related validation for complaint category and priority rendering
- Page Object-style reusable base helpers for setup, waits, and common actions
- Failure diagnostics with screenshots for quick defect triage
- Test grouping and execution orchestration using TestNG suites
- Maven-based dependency management and repeatable team execution

### Stack used

- Java 21
- Selenium WebDriver 4
- TestNG 7
- Maven Surefire
- WebDriverManager
- Ant (XSLT report transformation)

### Run automation tests

```bash
cd DwelloAutomation
mvn clean test
```

Run a single test method:

```bash
cd DwelloAutomation
mvn -Dtest=tests.StudentTest#TC_30_verifyAICategoryAndPriorityAssignment test
```

Generate transformed TestNG report (Ant + XSL):

```bash
cd DwelloAutomation
ant
```
---

## Future Improvements

- Email notifications
- Forgot password functionality
- Complaint trend analytics
- Mobile application support

---

## License

[MIT License](LICENSE.md)
