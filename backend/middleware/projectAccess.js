import Project from "../models/Project.js";

export async function loadProject(req, res, next) {
  const projectId = req.params.projectId || req.params.id;
  const project = await Project.findById(projectId);

  if (!project) return res.status(404).json({ message: "Project not found" });

  const userId = req.user._id.toString();
  const isOwner = project.owner.toString() === userId;
  const isMember = project.members.some((member) => member.toString() === userId);

  if (req.user.role !== "admin" && !isOwner && !isMember) {
    return res.status(403).json({ message: "You are not a member of this project" });
  }

  req.project = project;
  next();
}
