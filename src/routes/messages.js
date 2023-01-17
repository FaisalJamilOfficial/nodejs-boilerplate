const express = require("express");
const router = express.Router();

const messagesController = require("../controllers/messages");
const { verifyToken, verifyUser } = require("../middlewares/authenticator");
const { asyncHandler } = require("../middlewares/asyncHandler");

const { upload } = require("../middlewares/uploader");
const { ATTACHMENTS_DIRECTORY } = require("../configs/directories");
const { USER_TYPES } = require("../configs/enums");
const { ADMIN } = USER_TYPES;

router
  .route("/")
  .all(verifyToken, verifyUser)
  .post(
    upload(ATTACHMENTS_DIRECTORY).fields([
      { name: "attachments", maxCount: 10 },
    ]),
    asyncHandler(async (req, res) => {
      const { _id, type } = req?.user;
      const { user } = req.body;
      const userFrom = type === ADMIN ? user : _id;
      const { attachments } = req.files || {};
      const args = {
        ...req.body,
        userFrom,
        attachments,
        socket: req.io,
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
      const { _id } = req?.user;
      const { user, message, text, status } = req.body;
      const userID = req?.user?.type === ADMIN ? user : _id;
      const args = { user: userID, message, text, status };
      const response = await messagesController.updateMessage(args);
      res.json(response);
    })
  )
  .patch(
    asyncHandler(async (req, res) => {
      const { _id, type } = req?.user;
      const { user } = req.query;
      const userID = type === ADMIN ? user : _id;
      const args = { ...req.body, userTo: userID };
      const response = await messagesController.readMessages(args);
      res.json(response);
    })
  );
router.get(
  "/conversations",
  verifyToken,
  verifyUser,
  asyncHandler(async (req, res) => {
    const { _id } = req?.user;
    const { limit, page, user } = req.query;
    const userID = req?.user?.type === ADMIN ? user : _id;
    const args = {
      user: userID,
      limit: Number(limit),
      page: Number(page),
    };
    const response = await messagesController.getConversations(args);
    res.json(response);
  })
);

module.exports = router;
