# Dwello - Complaint Management System

## Project Overview

Dwello is a web-based complaint management system designed to simplify issue reporting and resolution within residential institutions such as hostels. It provides a centralized digital interface for residents to submit complaints and for administrators to monitor, manage, and resolve them in an organized manner. The system focuses on improving transparency, accountability, and ease of use by replacing manual complaint tracking with a structured digital workflow.

## Key Features

- **Student and Admin Access**: Separate dashboards for students and administrators, providing role-appropriate views and actions.
- **Complaint Submission System**: Students can raise complaints by specifying hostel, room number, and issue details through a structured form.
- **Complaint Status Management**: Complaints follow a clear lifecycle (Open → In Progress → Resolved), managed by administrators and visible to students.
- **Authentication and Authorization**: Secure login using JWT-based authentication, ensuring protected access to student and admin functionalities.
- **Responsive User Interface**: Clean and responsive interface designed to work effectively across desktops, tablets, and mobile devices.
- **Persistent Data Storage**: Complaint and user data are stored reliably using MongoDB, ensuring consistency and data integrity.

## Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | React.js, Vite, Tailwind CSS, Framer Motion |
| **Backend** | Node.js, Express.js |
| **Database** | MongoDB (Mongoose ODM) |
| **Authentication** | JSON Web Tokens (JWT), bcryptjs |
| **Testing** | Selenium WebDriver |

## System Architecture

The application follows a standard Model-View-Controller (MVC) architectural pattern within a decoupled client-server setup:

1.  **Client (Frontend)**: A Single Page Application (SPA) built with React that consumes RESTful APIs. It handles client-side routing, state management, and UI rendering.
2.  **Server (Backend)**: An Express.js REST API that serves as the interface between the client and the database. It enforces business logic, validation, and security policies.
3.  **Database**: MongoDB stores relational data (users, complaints) in document format, optimized for query performance.

## Getting Started

### Prerequisites

- Node.js (v18.0.0 or higher)
- MongoDB instance (Local or Atlas)


### Installation

1.  **Clone the repository**
    ```bash
    git clone https://github.com/VishalVaibhav22/dwello-hostel-complaint-system.git
    cd dwello-hostel-complaint-system
    ```

2.  **Server Setup**
    ```bash
    cd server
    npm install
    ```

3.  **Client Setup**
    ```bash
    cd ..
    npm install
    ```

### Running the Application

1.  **Start Backend**
    ```bash
    cd server
    npm start
    ```
    Server runs on `http://localhost:5000`

2.  **Start Frontend**
    ```bash
    # In a new terminal
    npm run dev
    ```
    Client runs on `http://localhost:5173`

## Environment Variables

Create a `.env` file in the `server/` directory with the following configuration:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/hostel-complaint
JWT_SECRET=your_jwt_secret_key_change_this_in_production
NODE_ENV=development
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=change_this_password
```

## Application Flow

1.  **User Registration**: Students register with their hostel details. Password is secured via bcrypt.
2.  **Authentication**: User logs in and receives a JWT for session authorization.
3.  **Complaint Submission**: Student submits a complaint with category and description.
4.  **Admin Review**: Administrators view a global dashboard of all active complaints.
5.  **Resolution**: Admin updates status (e.g., Open -> Resolved), which is immediately reflected on the student dashboard.

## Modules / Screens Overview

### Student Module
-   **Landing Page**: Product overview and entry point.
-   **Dashboard**: Personal view of submitted complaints and their live status.
-   **Submission Form**: Interface for reporting new issues.

### Admin Module
-   **Master Dashboard**: Aggregated view of all hostel complaints.
-   **Status Management**: Controls to update complaint progress.
-   **User Oversight**: View student details associated with specific complaints.

## Testing Strategy

Basic automated testing has been implemented to validate core user flows of the application.

- Selenium-based test scripts are used to verify key functionalities such as user login and basic navigation.
- Testing currently focuses on validating essential workflows rather than full coverage.
- Additional test cases and deeper coverage are planned as part of future enhancements.

## Future Enhancements

-   **Notification Service Integration**: Implement email notifications to inform students and administrators about updates in complaint status, improving communication and transparency.
-   **Analytics and Insights Dashboard**: Introduce an analytics module to visualize complaint trends, resolution timelines, and workload distribution, helping administration make data-driven decisions.
-   **Image Support for Complaints**: Allow students to attach images while submitting complaints to provide clearer context and assist maintenance staff in faster issue assessment.
-   **Intelligent Complaint Categorization**: Incorporate AI-based text analysis to automatically categorize complaints based on their description, reducing manual effort and improving routing accuracy.
-   **Scalable Hostel Management (Multi-Tenancy)**: Extend the system to support multiple hostels or blocks, each with dedicated administrative access while maintaining centralized oversight.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE.md) file for details.
