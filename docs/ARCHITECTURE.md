# System Architecture

## High-Level Overview

Dwello follows a standard **MERN Stack** architecture with a **Model-View-Controller (MVC)** design pattern on the backend.

```mermaid
graph TD
    Client[React Client] <-->|JSON/REST| Server[Express Server]
    
    subgraph Backend
        Server --> Router[Express Router]
        Router --> AuthController
        Router --> ComplaintController
        Router --> AdminController
        
        AuthController --> UserMode[User Model]
        ComplaintController --> ComplaintModel[Complaint Model]
        AdminController --> ComplaintModel
        
        UserMode <--> DB[(MongoDB)]
        ComplaintModel <--> DB
    end
```

## Directory Structure Strategy

- **`server/controllers/`**: Contains the business logic, separated from routing.
- **`server/routes/`**: Handles request routing and middleware application.
- **`server/models/`**: Defines the database schema and data validation.
- **`server/middleware/`**: Handles cross-cutting concerns like authentication (JWT).
- **`server/scripts/`**: Contains administrative utilities and maintenance scripts.
