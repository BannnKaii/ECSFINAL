// routes/admin.route.js
import express from "express";
import { protectRoute, isAdmin } from "../middleware/auth.middleware.js";
import { getUsers, banUser } from "../controllers/admin.controller.js";

const router = express.Router();

// GET /admin/users?search=optionalQuery
router.get("/users", protectRoute, isAdmin, getUsers);

// PUT /admin/ban/:id
router.put("/ban/:id", protectRoute, isAdmin, banUser);

export default router;
