import express from "express";
import { addMembers, createProject, deleteProject, listProjects, removeMember, updateProject } from "../controllers/projectController.js";
import { protect, requireAdmin } from "../middleware/auth.js";
import { loadProject } from "../middleware/projectAccess.js";

const router = express.Router();

router.use(protect);
router.route("/").get(listProjects).post(requireAdmin, createProject);
router.route("/:id").patch(loadProject, requireAdmin, updateProject).delete(loadProject, requireAdmin, deleteProject);
router.post("/:id/members", loadProject, requireAdmin, addMembers);
router.delete("/:id/members/:userId", loadProject, requireAdmin, removeMember);

export default router;
