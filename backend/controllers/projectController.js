import Project from "../models/Project.js";
import User from "../models/User.js";

export async function listProjects(req, res) {
  const filter =
    req.user.role === "admin"
      ? {}
      : { $or: [{ owner: req.user._id }, { members: req.user._id }] };

  const projects = await Project.find(filter)
    .populate("owner", "name email role title department avatarColor")
    .populate("members", "name email role title department avatarColor")
    .sort({ updatedAt: -1 });

  res.json(projects);
}

export async function createProject(req, res) {
  const { title, description, status, members = [] } = req.body;
  const project = await Project.create({
    title,
    description,
    status,
    owner: req.user._id,
    members: [...new Set([req.user._id.toString(), ...members])]
  });

  const populated = await project.populate(["owner", "members"]);
  res.status(201).json(populated);
}

export async function updateProject(req, res) {
  const allowed = ["title", "description", "status"];

  allowed.forEach((field) => {
    if (req.body[field] !== undefined) req.project[field] = req.body[field];
  });

  await req.project.save();
  const project = await req.project.populate([
    { path: "owner", select: "name email role title department avatarColor" },
    { path: "members", select: "name email role title department avatarColor" }
  ]);

  res.json(project);
}

export async function deleteProject(req, res) {
  await req.project.deleteOne();
  res.json({ message: "Project deleted" });
}

export async function addMembers(req, res) {
  const { members = [] } = req.body;
  const validMembers = await User.find({ _id: { $in: members } }).select("_id");

  req.project.members = [...new Set([...req.project.members.map(String), ...validMembers.map((u) => u._id.toString())])];
  await req.project.save();

  const project = await req.project.populate("members", "name email role title department avatarColor");
  res.json(project);
}

export async function removeMember(req, res) {
  req.project.members = req.project.members.filter((member) => member.toString() !== req.params.userId);

  if (!req.project.members.some((member) => member.toString() === req.project.owner.toString())) {
    req.project.members.push(req.project.owner);
  }

  await req.project.save();
  const project = await req.project.populate("members", "name email role title department avatarColor");
  res.json(project);
}
