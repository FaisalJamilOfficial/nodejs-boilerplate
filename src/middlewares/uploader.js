// module imports
import multer from "multer";
import { v4 } from "uuid";

export const upload = (directory) => {
  return multer({
    storage: multer.diskStorage({
      destination: function (req, file, cb) {
        cb(null, directory);
      },
      filename: function (req, file, cb) {
        cb(null, v4() + file.originalname);
      },
    }),
  });
};

export const uploadTemporary = multer({ storage: multer.memoryStorage() });
