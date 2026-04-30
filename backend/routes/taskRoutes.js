import express from "express";
import { addComment, createTask, deleteTask, listTasks, updateTask, uploadAttachment } from "../controllers/taskController.js";
import { protect } from "../middleware/auth.js";
import { loadProject } from "../middleware/projectAccess.js";
import { upload } from "../middleware/upload.js";

const router = express.Router({ mergeParams: true });

router.use(protect, loadProject);
router.route("/").get(listTasks).post(createTask);
router.route("/:taskId").patch(updateTask).delete(deleteTask);
router.post("/:taskId/comments", addComment);
router.post("/:taskId/attachments", upload.single("file"), uploadAttachment);

export default router;
