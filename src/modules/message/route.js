// module imports
import { Router } from "express";

// file imports
import * as messageController from "./controller.js";
import * as conversationController from "../conversation/controller.js";
import { verifyToken, verifyUser } from "../../middlewares/authenticator.js";
import { exceptionHandler } from "../../middlewares/exception-handler.js";
import { upload } from "../../middlewares/uploader.js";

// destructuring assignments

// variable initializations
const router = Router();

router
  .route("/")
  .all(verifyToken, verifyUser)
  .post(
    upload().array("attachments", 8),
    exceptionHandler(async (req, res) => {
      const { _id: userFrom, name: username } = req.user;
      const { user: userTo, text } = req.body;
      const attachments = req.files || [];
      const args = { userFrom, username, userTo, text, attachments: [] };
      if (attachments)
        attachments.forEach((attachment) =>
          args.attachments.push({
            // path: attachment?.key,
            path: attachment?.filename,
            type: attachment?.mimetype,
          })
        );
      const response = await messageController.send(args);
      res.json(response);
    })
  )
  .get(
    exceptionHandler(async (req, res) => {
      const { _id: user1 } = req.user;
      const { limit, page, user } = req.query;
      let { conversation } = req.query;
      conversation = conversation?.toString() || "";
      const user2 = user?.toString() || "";
      const args = {
        conversation,
        user1,
        user2,
        limit: Number(limit),
        page: Number(page),
      };
      const response = await messageController.getMessages(args);
      res.json(response);
    })
  )
  .put(
    exceptionHandler(async (req, res) => {
      let { message } = req.query;
      const { text, status } = req.body;
      const args = { text, status };
      message = message?.toString() || "";
      const response = await messageController.updateMessageById(message, args);
      res.json(response);
    })
  )
  .patch(
    exceptionHandler(async (req, res) => {
      const { _id } = req.user;
      const { conversation } = req.body;
      const args = { conversation, userTo: _id };
      await messageController.readMessages(args);
      res.json({ message: "Operation completed successfully!" });
    })
  );

router.get(
  "/conversation",
  verifyToken,
  verifyUser,
  exceptionHandler(async (req, res) => {
    const { _id: user } = req.user;
    const { limit, page } = req.query;
    let { keyword } = req.query;
    keyword = keyword?.toString() || "";
    const args = {
      user,
      limit: Number(limit),
      page: Number(page),
      keyword,
    };
    const response = await conversationController.getConversations(args);
    res.json(response);
  })
);

export default router;
