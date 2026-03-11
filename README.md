# Project Camp Backend

A RESTful API backend for a collaborative project management system. Teams can manage projects, tasks, subtasks, and notes with role-based access control.

## Tech Stack

- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB + Mongoose
- **Auth:** JWT (Access + Refresh Tokens)
- **Email:** Nodemailer + Mailgen (Mailtrap)
- **File Upload:** Multer
- **Validation:** express-validator

---

## Getting Started

### 1. Clone the repo

```bash
git clone https://github.com/your-username/project-camp-backend.git
cd project-camp-backend
```

### 2. Install dependencies

```bash
npm install
```

### 3. Setup environment variables

`.env` file banao root mein:

```env
MONGO_URI=your_mongodb_connection_string
PORT=8000
CORS_ORIGIN=http://localhost:5173

ACCESS_TOKEN_SECRET=your_access_token_secret
ACCESS_TOKEN_EXPIRY=1d

REFRESH_TOKEN_SECRET=your_refresh_token_secret
REFRESH_TOKEN_EXPIRY=10d

MAILTRAP_SMTP_HOST=sandbox.smtp.mailtrap.io
MAILTRAP_SMTP_PORT=2525
MAILTRAP_SMTP_USER=your_mailtrap_user
MAILTRAP_SMTP_PASS=your_mailtrap_pass
```

### 4. Run the server

```bash
# Development (auto-restart)
npm run dev

# Production
npm start
```

Server `http://localhost:8000` pe run karega.

---

## Project Structure

```
src/
├── controllers/        # Request handlers
│   ├── auth.controller.js
│   ├── project.controller.js
│   ├── task.controller.js
│   ├── note.controller.js
│   └── healthcheck.controller.js
├── models/             # Mongoose schemas
│   ├── user.models.js
│   ├── project.models.js
│   ├── task.models.js
│   ├── subtask.models.js
│   └── note.models.js
├── routes/             # Express routers
│   ├── auth.routes.js
│   ├── project.routes.js
│   ├── task.routes.js
│   ├── note.routes.js
│   └── healthcheck.routes.js
├── middlewares/
│   ├── auth.middlewares.js       # JWT verification
│   ├── project.middlewares.js    # Role-based access
│   ├── multer.middlewares.js     # File uploads
│   └── validator.middlewares.js  # Input validation
├── validators/
│   ├── auth.validators.js
│   └── project.validators.js
├── utils/
│   ├── api-error.js
│   ├── api-response.js
│   ├── async-handler.js
│   ├── constants.js
│   └── mail.js
├── db/
│   └── index.js
├── app.js
└── index.js
```

---

## API Endpoints

Base URL: `/api/v1`

### Auth `/auth`

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/register` | User registration | ❌ |
| POST | `/login` | Login, returns tokens | ❌ |
| POST | `/logout` | Logout | ✅ |
| GET | `/current-user` | Logged-in user info | ✅ |
| POST | `/change-password` | Change password | ✅ |
| POST | `/refresh-token` | New access token | ❌ |
| GET | `/verify-email/:token` | Email verification | ❌ |
| POST | `/forgot-password` | Password reset email | ❌ |
| POST | `/reset-password/:token` | Reset password | ❌ |
| POST | `/resend-email-verification` | Resend verification | ✅ |

### Projects `/projects`

| Method | Endpoint | Description | Role |
|--------|----------|-------------|------|
| GET | `/` | My projects list | Any |
| POST | `/` | Create project | Any |
| GET | `/:projectId` | Project details | Member+ |
| PUT | `/:projectId` | Update project | Admin |
| DELETE | `/:projectId` | Delete project | Admin |
| GET | `/:projectId/members` | List members | Member+ |
| POST | `/:projectId/members` | Add member | Admin |
| PUT | `/:projectId/members/:userId` | Update member role | Admin |
| DELETE | `/:projectId/members/:userId` | Remove member | Admin |

### Tasks `/tasks`

| Method | Endpoint | Description | Role |
|--------|----------|-------------|------|
| GET | `/:projectId` | List tasks | Member+ |
| POST | `/:projectId` | Create task | Admin/Project Admin |
| GET | `/:projectId/t/:taskId` | Task details + subtasks | Member+ |
| PUT | `/:projectId/t/:taskId` | Update task | Admin/Project Admin |
| DELETE | `/:projectId/t/:taskId` | Delete task | Admin/Project Admin |
| POST | `/:projectId/t/:taskId/subtasks` | Create subtask | Admin/Project Admin |
| PUT | `/:projectId/st/:subTaskId` | Update subtask | Member+ |
| DELETE | `/:projectId/st/:subTaskId` | Delete subtask | Admin/Project Admin |

### Notes `/notes`

| Method | Endpoint | Description | Role |
|--------|----------|-------------|------|
| GET | `/:projectId` | List notes | Member+ |
| POST | `/:projectId` | Create note | Admin |
| GET | `/:projectId/n/:noteId` | Note details | Member+ |
| PUT | `/:projectId/n/:noteId` | Update note | Admin |
| DELETE | `/:projectId/n/:noteId` | Delete note | Admin |

### Health Check

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/healthcheck` | Server status |

---

## Roles & Permissions

| Action | Admin | Project Admin | Member |
|--------|-------|---------------|--------|
| Create/Update/Delete Project | ✅ | ❌ | ❌ |
| Manage Members | ✅ | ❌ | ❌ |
| Create/Update/Delete Tasks | ✅ | ✅ | ❌ |
| View Tasks | ✅ | ✅ | ✅ |
| Create/Delete Subtasks | ✅ | ✅ | ❌ |
| Update Subtask Status | ✅ | ✅ | ✅ |
| Create/Update/Delete Notes | ✅ | ❌ | ❌ |
| View Notes | ✅ | ✅ | ✅ |

---

## API Response Format

**Success:**
```json
{
  "statusCode": 200,
  "data": {},
  "message": "Success",
  "success": true
}
```

**Error:**
```json
{
  "statusCode": 422,
  "message": "Received data is not valid",
  "success": false,
  "errors": [{ "field": "error message" }]
}
```

---

## Authentication

JWT Bearer token use karo:

```
Authorization: Bearer <accessToken>
```

Access token expire hone pe `/auth/refresh-token` se naya lo:

```json
{
  "refreshToken": "your_refresh_token"
}
```
