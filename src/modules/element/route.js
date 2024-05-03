// module imports
import { Router } from "express";

// file imports
import * as elementController from "./controller.js";
import { exceptionHandler } from "../../middlewares/exception-handler.js";
import {
  verifyToken,
  verifyAdmin,
  verifyUser,
} from "../../middlewares/authenticator.js";

// destructuring assignments

// variable initializations
const router = Router();

router.get(
  "/",
  verifyToken,
  verifyUser,
  exceptionHandler(async (req, res) => {
    const { page, limit } = req.query;
    let { keyword } = req.query;
    keyword = keyword?.toString() || "";
    const args = {
      keyword,
      limit: Number(limit),
      page: Number(page),
    };
    const response = await elementController.getElements(args);
    res.json(response);
  })
);

router
  .route("/admin")
  .all(verifyToken, verifyAdmin)
  .post(
    exceptionHandler(async (req, res) => {
      const { title } = req.body;
      const args = { title };
      const response = await elementController.addElement(args);
      res.json(response);
    })
  )
  .put(
    exceptionHandler(async (req, res) => {
      let { element } = req.query;
      const { title } = req.body;
      const args = { title };
      element = element?.toString() || "";
      const response = await elementController.updateElementById(element, args);
      res.json(response);
    })
  )
  .get(
    exceptionHandler(async (req, res) => {
      const { page, limit } = req.query;
      let { keyword } = req.query;
      keyword = keyword?.toString() || "";
      const args = {
        keyword,
        limit: Number(limit),
        page: Number(page),
      };
      const response = await elementController.getElements(args);
      res.json(response);
    })
  )
  .delete(
    exceptionHandler(async (req, res) => {
      let { element } = req.query;
      element = element?.toString() || "";
      const response = await elementController.deleteElementById(element);
      res.json(response);
    })
  );

router.get(
  "/:element",
  verifyToken,
  verifyAdmin,
  exceptionHandler(async (req, res) => {
    const { element } = req.params;
    const response = await elementController.getElementById(element);
    res.json(response);
  })
);

export default router;
