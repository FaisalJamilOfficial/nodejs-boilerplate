const S3BucketManager = require("../utils/S3BucketManager");
const multer = require("multer");
const uuid = require("uuid");

exports.upload = (directory) => {
  return multer({
    storage: multer.diskStorage({
      destination: function (req, file, cb) {
        cb(null, directory);
      },
      filename: function (req, file, cb) {
        cb(null, uuid.v4() + file.originalname);
      },
    }),
  });
};

exports.uploadTemporary = multer({ storage: multer.memoryStorage() });

exports.uploadImages = async (req, res, next) => {
  try {
    const { images } = req.files || {};
    if (images && images.length > 0) {
      for (let i = 0; i < images.length; i++) {
        const path = await new S3BucketManager().uploadFile(images[i]);
        images[i].path = path;
      }
      req.files.images = images;
      next();
    } else {
      next();
    }
  } catch (error) {
    next(error);
  }
};

exports.uploadAttachments = async (req, res, next) => {
  try {
    const { attachments } = req.files || {};
    if (attachments && attachments.length > 0) {
      for (let i = 0; i < attachments.length; i++) {
        const path = await new S3BucketManager().uploadFile(attachments[i]);
        attachments[i].path = path;
      }
      next();
    } else {
      next();
    }
  } catch (error) {
    next(error);
  }
};
