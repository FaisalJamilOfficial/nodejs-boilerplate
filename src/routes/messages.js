// module imports
import express from "express";

// file imports
import * as messagesController from "../controllers/messages.js";
import { verifyToken, verifyUser } from "../middlewares/authenticator.js";
import { exceptionHandler } from "../middlewares/exception-handler.js";
import { upload } from "../middlewares/uploader.js";
import directories from "../configs/directories.js";

// destructuring assignments
const { ATTACHMENTS_DIRECTORY } = directories;

// variable initializations
const router = express.Router();

router
  .route("/")
  .all(verifyToken, verifyUser)
  .post(
    upload(ATTACHMENTS_DIRECTORY).array("attachments", 8),
    exceptionHandler(async (req, res) => {
      const { _id: userFrom, name: username } = req?.user;
      const { user: userTo, text } = req.body;
      const attachments = req.files || [];
      const args = { userFrom, username, userTo, text, attachments: [] };
      if (attachments)
        attachments.forEach((attachment) =>
          args.attachments.push({
            // path: attachment.key,
            path: attachment.filename,
            type: attachment.mimetype,
          })
        );

      const response = await messagesController.send(args);
      res.json(response);
    })
  )
  .get(
    exceptionHandler(async (req, res) => {
      const { _id: user1 } = req.user;
      const { conversation, limit, page, user: user2 } = req.query;
      const args = {
        conversation,
        user1,
        user2,
        limit: Number(limit),
        page: Number(page),
      };
      const response = await messagesController.getMessages(args);
      res.json(response);
    })
  )
  .put(
    exceptionHandler(async (req, res) => {
      const { message, text, status } = req.body;
      const args = { message, text, status };
      const response = await messagesController.updateMessage(args);
      res.json(response);
    })
  )
  .patch(
    exceptionHandler(async (req, res) => {
      const { _id } = req?.user;
      const { conversation } = req.body;
      const args = { conversation, userTo: _id };
      await messagesController.readMessages(args);
      res.json({ message: "messages read successfully!" });
    })
  );

router.get(
  "/conversations",
  verifyToken,
  verifyUser,
  exceptionHandler(async (req, res) => {
    const { _id: user } = req?.user;
    const { limit, page, keyword } = req.query;
    const args = { user, limit: Number(limit), page: Number(page), keyword };
    const response = await messagesController.getConversations(args);
    res.json(response);
  })
);

export default router;
