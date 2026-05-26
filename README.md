# Team Task Manager

A MERN task and project management app with JWT auth, role-based access, project workspaces, Kanban task movement, comments, activity history, analytics, and Socket.io live updates.

## Tech Stack

- Frontend: React, Tailwind CSS, dnd-kit, Recharts
- Backend: Node.js, Express, MongoDB, Mongoose
- Auth: JWT with admin/member roles
- Realtime: Socket.io

## Features

- Signup and login
- Admin project creation
- Seeded demo users, project, and tasks
- Project dashboard
- Project details with progress, member management, status, and delete action
- Task creation with title, description, priority, status, and deadline
- Task editing with assignee, priority, deadline, and status updates
- Kanban board with Todo, In Progress, and Done columns
- Drag and drop task status updates
- Task comments
- Activity timeline entries for creation, updates, comments, assignments, uploads, and status changes
- Local file attachments for tasks
- Dashboard analytics for total, completed, and pending tasks
- Search and priority filtering
- Profile editing with avatar initials
- Dark mode and in-app toast notifications

## Local Setup

1. Install dependencies:

   ```bash
   npm install
   npm install --prefix backend
   npm install --prefix frontend
   ```

2. Create backend environment file:

   ```bash
   cp backend/.env.example backend/.env
   ```

3. Update `backend/.env`:

   ```env
   PORT=5001
   MONGO_URI=mongodb://127.0.0.1:27017/team-task-manager
   JWT_SECRET=replace-with-a-long-random-secret
   CLIENT_URL=http://localhost:5173,http://localhost:5174,http://localhost:5175,http://localhost:5176
   ```

4. Optional frontend environment:

   ```bash
   cp frontend/.env.example frontend/.env
   ```

5. Start the app:

   ```bash
   npm run dev
   ```

6. Add demo data:

   ```bash
   npm run seed --prefix backend
   ```

Frontend runs at `http://localhost:5173` or the next available Vite port; backend runs at `http://localhost:5001`.

## Demo Logins

- Admin: `demo.admin@example.com` / `admin123`
- Member: `aarav@example.com` / `member123`

## Deployment Notes

### MongoDB Atlas

1. Create a free Atlas cluster.
2. Add a database user and allow your Render server IP, or allow access from anywhere for a demo deployment.
3. Copy the connection string into `backend/.env.production.example` as `MONGO_URI`.

### Render Backend

1. Create a new Web Service from the backend repository/root.
2. Set the build command:

   ```bash
   npm install
   ```

3. Set the start command:

   ```bash
   npm start
   ```

4. Add environment variables from `backend/.env.production.example`.
5. Set the root directory to `backend` if you are deploying from the monorepo root.
6. For this deployment, use `CLIENT_URL=https://tasksphere-59tm.vercel.app`.

### Vercel Frontend

1. Import the project into Vercel.
2. Set the root directory to `frontend`.
3. Add environment variables from `frontend/.env.production.example`.
4. Deploy after the Render API URL is ready.
5. `frontend/vercel.json` enables client-side routing refreshes to resolve to `index.html`.
6. For this deployment, use `VITE_API_URL=https://tasksphere-backend-gk78.onrender.com/api` and `VITE_SOCKET_URL=https://tasksphere-backend-gk78.onrender.com`.

### Attachments

The current app stores uploads locally under `backend/uploads`. For production, replace local storage with Cloudinary, S3, or another persistent object store because Render file storage is not durable across redeploys.

## Resume Line

Built a full-stack team collaboration tool with role-based access, real-time task updates, comments, analytics, and a Kanban workflow similar to Jira/Trello.
