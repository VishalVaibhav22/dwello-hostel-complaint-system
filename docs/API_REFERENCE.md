# API Reference

Base URL: `http://localhost:5000`

All authenticated endpoints require: `Authorization: Bearer <token>`

---

## Authentication

### Register

- **POST** `/auth/register`
- **Access**: Public
- **Body**:
  ```json
  {
    "university": "Thapar Institute of Engineering and Technology",
    "fullName": "Student Name",
    "rollNumber": "102203xxx",
    "email": "student@thapar.edu",
    "password": "password123",
    "hostel": "Hostel A",
    "roomNumber": "101"
  }
  ```
- `rollNumber` is required for Thapar University students (exactly 9 digits).

### Login

- **POST** `/auth/login`
- **Access**: Public
- **Body**:
  ```json
  {
    "email": "student@thapar.edu",
    "password": "password123"
  }
  ```

---

## Complaints (Student)

### Get My Complaints

- **GET** `/api/complaints/my`
- **Access**: Authenticated (Student)

### Get Complaint by ID

- **GET** `/api/complaints/:id`
- **Access**: Authenticated (own complaints only)

### Create Complaint

- **POST** `/api/complaints`
- **Access**: Authenticated (Student)
- **Content-Type**: `multipart/form-data`
- **Fields**: `title`, `description`, `images` (up to 3, JPG/PNG/WEBP, max 5MB each), `availability` (JSON string)

---

## Admin

### Health Check

- **GET** `/api/admin/health`
- **Access**: Public

### Analytics

- **GET** `/api/admin/analytics`
- **Access**: Admin
- **Returns**: Status distribution, average resolution time, response rate, daily/weekly trends.

### Get All Complaints

- **GET** `/api/admin/complaints`
- **Access**: Admin

### Update Complaint Status

- **PUT** `/api/admin/complaints/:id/status`
- **Access**: Admin
- **Body**: `{ "status": "In Progress" }`
- **Transitions**: Open → In Progress → Resolved

### Reject Complaint

- **PUT** `/api/admin/complaints/:id/reject`
- **Access**: Admin
- **Body**: `{ "rejectionReason": "Reason text" }`

### Get All Students

- **GET** `/api/admin/students`
- **Access**: Admin

### Get Student Details

- **GET** `/api/admin/students/:studentId`
- **Access**: Admin

---

## Notifications

### Get My Notifications

- **GET** `/api/notifications`
- **Access**: Authenticated

### Mark Notification as Read

- **PUT** `/api/notifications/:id/read`
- **Access**: Authenticated

### Mark All as Read

- **PUT** `/api/notifications/read-all`
- **Access**: Authenticated

---

## Announcements

### Get Announcements

- **GET** `/api/announcements`
- **Access**: Authenticated

### Get Unseen Count

- **GET** `/api/announcements/unseen-count`
- **Access**: Authenticated

### Mark All Seen

- **PUT** `/api/announcements/mark-seen`
- **Access**: Authenticated

### Create Announcement

- **POST** `/api/announcements`
- **Access**: Admin
- **Body**: `{ "title": "...", "content": "..." }`

### Delete Announcement

- **DELETE** `/api/announcements/:id`
- **Access**: Admin
