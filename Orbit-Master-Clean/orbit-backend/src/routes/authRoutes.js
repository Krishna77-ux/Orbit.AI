import express from "express";
import { signupUser, loginUser, socialLogin } from "../controllers/authController.js";

const router = express.Router();

router.post("/signup", signupUser);
router.post("/login", loginUser);
router.post("/social-login", socialLogin);

export default router;