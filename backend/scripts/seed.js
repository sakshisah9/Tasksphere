import dotenv from "dotenv";
import mongoose from "mongoose";
import { connectDB } from "../config/db.js";
import Project from "../models/Project.js";
import Task from "../models/Task.js";
import User from "../models/User.js";

dotenv.config();

const users = [
  { name: "Demo Admin", email: "demo.admin@example.com", password: "admin123", role: "admin", title: "Delivery Manager", department: "Operations", avatarColor: "#2563eb" },
  { name: "Aarav Mehta", email: "aarav@example.com", password: "member123", role: "member", title: "Frontend Engineer", department: "Engineering", avatarColor: "#0f766e" },
  { name: "Maya Rao", email: "maya@example.com", password: "member123", role: "member", title: "Product Designer", department: "Design", avatarColor: "#be123c" },
  { name: "Neha Singh", email: "neha@example.com", password: "member123", role: "member", title: "QA Analyst", department: "Quality", avatarColor: "#7c3aed" }
];

const taskTemplates = [
  ["Design onboarding task flow", "Map the first-run experience for project owners and members.", "todo", "high", 5],
  ["Build role-based project controls", "Restrict project creation and destructive actions to admins.", "in-progress", "high", 3],
  ["Create Kanban analytics widgets", "Summarize completed, pending, and overdue work for leadership review.", "done", "medium", -2],
  ["Prepare UAT checklist", "Write acceptance checks for signup, project setup, drag and drop, and comments.", "todo", "medium", 8],
  ["Document deployment pipeline", "Capture Vercel, Render, and MongoDB Atlas configuration steps.", "in-progress", "low", 10]
];

function daysFromNow(days) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date;
}

async function seed() {
  await connectDB();
  const createdUsers = [];

  for (const user of users) {
    const existing = await User.findOne({ email: user.email });
    if (existing) {
      existing.name = user.name;
      existing.role = user.role;
      existing.title = user.title;
      existing.department = user.department;
      existing.avatarColor = user.avatarColor;
      await existing.save();
      createdUsers.push(existing);
    } else {
      createdUsers.push(await User.create(user));
    }
  }

  const admin = createdUsers[0];

  const project = await Project.findOneAndUpdate(
    { title: "Corporate Portal Revamp" },
    {
      title: "Corporate Portal Revamp",
      description: "Cross-functional delivery board for the internal operations portal release.",
      status: "active",
      owner: admin._id,
      members: createdUsers.map((user) => user._id)
    },
    { new: true, upsert: true }
  );

  const existingTaskCount = await Task.countDocuments({ project: project._id });

  if (existingTaskCount === 0) {
    await Task.create(
      taskTemplates.map(([title, description, status, priority, dueIn], index) => ({
      title,
      description,
      status,
      priority,
      deadline: daysFromNow(dueIn),
      assignedTo: createdUsers[(index % (createdUsers.length - 1)) + 1]._id,
      project: project._id,
      comments: [
        {
          body: "Added to the sprint board for visibility.",
          author: admin._id
        }
      ],
      activity: [
        { action: "created task", actor: admin._id },
        { action: "assigned task", actor: admin._id, to: createdUsers[(index % (createdUsers.length - 1)) + 1]._id.toString() }
      ]
      }))
    );
  }

  console.log("Seed complete");
  console.log("Admin login: demo.admin@example.com / admin123");
  console.log("Member login: aarav@example.com / member123");
  await mongoose.disconnect();
}

seed().catch(async (error) => {
  console.error(error);
  await mongoose.disconnect();
  process.exit(1);
});
