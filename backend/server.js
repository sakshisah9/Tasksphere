import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import http from "http";
import morgan from "morgan";
import { Server } from "socket.io";
import { connectDB } from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import projectRoutes from "./routes/projectRoutes.js";
import taskRoutes from "./routes/taskRoutes.js";
import userRoutes from "./routes/userRoutes.js";

dotenv.config();

const app = express();
const server = http.createServer(app);
const allowedOrigins = (process.env.CLIENT_URL || "http://localhost:5173,http://localhost:5174,http://localhost:5175,http://localhost:5176")
  .split(",")
  .map((origin) => origin.trim());
const io = new Server(server, {
  cors: { origin: allowedOrigins, credentials: true }
});

app.set("io", io);
app.use(cors({ origin: allowedOrigins, credentials: true }));
app.use(express.json());
app.use(morgan("dev"));

app.get("/api/health", (_req, res) => res.json({ status: "ok" }));
app.use("/uploads", express.static("uploads"));
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/projects/:projectId/tasks", taskRoutes);

io.on("connection", (socket) => {
  socket.on("project:join", (projectId) => socket.join(`project:${projectId}`));
  socket.on("project:leave", (projectId) => socket.leave(`project:${projectId}`));
});

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(err.status || 500).json({ message: err.message || "Server error" });
});

const port = process.env.PORT || 5000;

connectDB()
  .then(() => server.listen(port, () => console.log(`API running on port ${port}`)))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
