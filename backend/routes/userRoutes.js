import express from "express";
import { listUsers, updateProfile } from "../controllers/userController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

router.use(protect);
router.get("/", listUsers);
router.patch("/me", updateProfile);

export default router;
