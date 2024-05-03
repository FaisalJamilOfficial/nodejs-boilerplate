// module imports
import { Router } from "express";

// file imports

import { exceptionHandler } from "../../middlewares/exception-handler.js";
import {
  verifyToken,
  verifyAdmin,
  verifyKey,
} from "../../middlewares/authenticator.js";

// destructuring assignments

// variable initializations
const router = Router();

router.delete(
  "/clean/DB",
  verifyToken,
  verifyAdmin,
  verifyKey,
  exceptionHandler(async (req, res) => {
    res.json({ message: "Operation completed successfully!" });
  })
);

export default router;
