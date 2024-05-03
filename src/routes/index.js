// module imports
import { Router } from "express";

// file imports
import admin from "../modules/admin/route.js";
import auth from "../modules/auth/route.js";
import element from "../modules/element/route.js";
import message from "../modules/message/route.js";
import user from "../modules/user/route.js";

// destructuring assignments
const { POSTMAN_URL } = process.env;

// variable initializations
const router = Router();

router.use("/admin", admin);
router.use("/auth", auth);
router.use("/element", element);
router.use("/message", message);
router.use("/user", user);

router.use("/docs", (req, res) => res.redirect(POSTMAN_URL || ""));

export default router;
