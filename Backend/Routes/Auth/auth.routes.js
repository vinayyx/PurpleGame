// Routes/auth.routes.js
import express from "express";
import { register, login, refresh, logout, me } from "../../Controller/Auth/auth.controller.js";
import { verifyAcess } from "../../Middleware/auth.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/refresh", refresh);
router.post("/logout", logout);
router.get("/me", verifyAcess, me);

export default router;
