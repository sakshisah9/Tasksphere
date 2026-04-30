import Task from "../models/Task.js";

const taskPopulate = [
  { path: "assignedTo", select: "name email role title department avatarColor" },
  { path: "comments.author", select: "name email role title department avatarColor" },
  { path: "activity.actor", select: "name email role title department avatarColor" },
  { path: "attachments.uploadedBy", select: "name email role title department avatarColor" }
];

function emitProject(req, event, payload) {
  req.app.get("io")?.to(`project:${req.project._id}`).emit(event, payload);
}

export async function listTasks(req, res) {
  const tasks = await Task.find({ project: req.project._id }).populate(taskPopulate).sort({ createdAt: -1 });
  res.json(tasks);
}

export async function createTask(req, res) {
  const { title, description, priority, deadline, assignedTo, status } = req.body;
  const activity = [{ action: "created task", actor: req.user._id }];

  if (assignedTo) {
    activity.push({ action: "assigned task", actor: req.user._id, to: assignedTo });
  }

  const task = await Task.create({
    title,
    description,
    priority,
    deadline: deadline || undefined,
    assignedTo: assignedTo || undefined,
    status,
    project: req.project._id,
    activity
  });

  const populated = await task.populate(taskPopulate);
  emitProject(req, "task:created", populated);
  res.status(201).json(populated);
}

export async function updateTask(req, res) {
  const task = await Task.findOne({ _id: req.params.taskId, project: req.project._id });
  if (!task) return res.status(404).json({ message: "Task not found" });

  const oldStatus = task.status;
  const oldAssignee = task.assignedTo?.toString();
  const allowed = ["title", "description", "priority", "deadline", "assignedTo", "status"];

  allowed.forEach((field) => {
    if (req.body[field] !== undefined) task[field] = req.body[field] || undefined;
  });

  if (req.body.status && req.body.status !== oldStatus) {
    task.activity.push({ action: "changed status", actor: req.user._id, from: oldStatus, to: req.body.status });
  } else if (req.body.assignedTo !== undefined && req.body.assignedTo !== oldAssignee) {
    task.activity.push({ action: "changed assignee", actor: req.user._id, from: oldAssignee || "unassigned", to: req.body.assignedTo || "unassigned" });
  } else {
    task.activity.push({ action: "updated task", actor: req.user._id });
  }

  await task.save();
  const populated = await task.populate(taskPopulate);
  emitProject(req, "task:updated", populated);
  res.json(populated);
}

export async function deleteTask(req, res) {
  const task = await Task.findOneAndDelete({ _id: req.params.taskId, project: req.project._id });
  if (!task) return res.status(404).json({ message: "Task not found" });

  emitProject(req, "task:deleted", { id: task._id });
  res.json({ message: "Task deleted" });
}

export async function addComment(req, res) {
  const task = await Task.findOne({ _id: req.params.taskId, project: req.project._id });
  if (!task) return res.status(404).json({ message: "Task not found" });

  task.comments.push({ body: req.body.body, author: req.user._id });
  task.activity.push({ action: "commented", actor: req.user._id });
  await task.save();

  const populated = await task.populate(taskPopulate);
  emitProject(req, "task:updated", populated);
  res.status(201).json(populated);
}

export async function uploadAttachment(req, res) {
  const task = await Task.findOne({ _id: req.params.taskId, project: req.project._id });
  if (!task) return res.status(404).json({ message: "Task not found" });
  if (!req.file) return res.status(400).json({ message: "No file uploaded" });

  task.attachments.push({
    name: req.file.originalname,
    url: `/uploads/${req.file.filename}`,
    type: req.file.mimetype,
    size: req.file.size,
    uploadedBy: req.user._id
  });
  task.activity.push({ action: "uploaded attachment", actor: req.user._id, to: req.file.originalname });
  await task.save();

  const populated = await task.populate(taskPopulate);
  emitProject(req, "task:updated", populated);
  res.status(201).json(populated);
}
