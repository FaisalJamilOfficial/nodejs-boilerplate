// module imports
import express from "express";

// file imports
import * as messagesController from "../controllers/messages.js";
import { verifyToken, verifyUser } from "../middlewares/authenticator.js";
import { asyncHandler } from "../middlewares/async-handler.js";
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
    asyncHandler(async (req, res) => {
      const { _id } = req?.user;
      const { user, text } = req.body;
      const attachments = req.files || [];
      const args = {
        userFrom: _id,
        userTo: user,
        text,
        attachments,
      };
      const response = await messagesController.send(args);
      res.json(response);
    })
  )
  .get(
    asyncHandler(async (req, res) => {
      const { conversation, limit, page } = req.query;
      const args = {
        conversation,
        limit: Number(limit),
        page: Number(page),
      };
      const response = await messagesController.chat(args);
      res.json(response);
    })
  )
  .put(
    asyncHandler(async (req, res) => {
      const { message, text, status } = req.body;
      const args = { message, text, status };
      const response = await messagesController.updateMessage(args);
      res.json(response);
    })
  )
  .patch(
    asyncHandler(async (req, res) => {
      const { _id } = req?.user;
      const { conversation } = req.body;
      const args = { conversation, userTo: _id };
      const response = await messagesController.readMessages(args);
      res.json(response);
    })
  );

router.get(
  "/conversations",
  verifyToken,
  verifyUser,
  asyncHandler(async (req, res) => {
    const { _id: user } = req?.user;
    const { limit, page } = req.query;
    const args = {
      user,
      limit: Number(limit),
      page: Number(page),
    };
    const response = await messagesController.getConversations(args);
    res.json(response);
  })
);

export default router;
