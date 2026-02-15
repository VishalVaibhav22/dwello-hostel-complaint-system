# API Reference

## Authentication

### Register User
- **Endpoint**: `POST /auth/register`
- **Access**: Public
- **Body**:
  ```json
  {
    "university": "Thapar University",
    "fullName": "Student Name",
    "email": "student@thapar.edu",
    "password": "password123",
    "hostel": "Hostel M",
    "roomNumber": "101"
  }
  ```

### Login User
- **Endpoint**: `POST /auth/login`
- **Access**: Public
- **Body**:
  ```json
  {
    "email": "student@thapar.edu",
    "password": "password123"
  }
  ```

---

## Complaints

### Create Complaint
- **Endpoint**: `POST /api/complaints`
- **Access**: Private (Student)
- **header**: `Authorization: Bearer <token>`
- **Body**:
  ```json
  {
    "title": "Broken Fan",
    "description": "Ceiling fan in room 101 is not working."
  }
  ```

### Get My Complaints
- **Endpoint**: `GET /api/complaints/my`
- **Access**: Private (Student)

### Get Single Complaint
- **Endpoint**: `GET /api/complaints/:id`
- **Access**: Private (Student - own complaints only)

---

## Admin

### Get All Complaints
- **Endpoint**: `GET /admin/complaints`
- **Access**: Private (Admin)

### Update Complaint Status
- **Endpoint**: `PUT /admin/complaints/:id/status`
- **Access**: Private (Admin)
- **Body**:
  ```json
  {
    "status": "In Progress"
  }
  ```
  *Allowed status: Open -> In Progress -> Resolved*
