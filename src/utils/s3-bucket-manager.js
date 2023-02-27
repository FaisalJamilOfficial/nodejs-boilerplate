// module imports
import { S3Client, DeleteObjectCommand } from "@aws-sdk/client-s3";
import multer from "multer";
import multerS3 from "multer-s3";
import { v4 } from "uuid";
import mime from "mime-types";

// destructuring assignments
const { AWS_BUCKET_NAME, AWS_ACCESS_KEY, AWS_SECRET_KEY } = process.env;

// variable initializations
const s3 = new S3Client({
  credentials: { accessKeyId: AWS_ACCESS_KEY, secretAccessKey: AWS_SECRET_KEY },
});

class S3BucketManager {
  constructor() {
    this.s3 = s3;
  }

  /**
   * @description upload image to s3 bucket
   * @returns {Object} file object <req.file>
   */
  upload = multer({
    storage: multerS3({
      s3,
      bucket: AWS_BUCKET_NAME,
      metadata: (req, file, cb) => {
        cb(null);
      },
      key: (req, file, cb) => {
        const fileExtension = "." + mime.extension(file.mimetype);
        cb(null, v4() + fileExtension);
      },
    }),
  });

  /**
   *
   * @param {String} filePath path to file
   * @returns {Object} data of deleted object
   */
  async delete(params) {
    const { path } = params;
    if (path);
    else return null;
    const keyArray = path.split("/");
    const key = keyArray[keyArray.length - 1];
    const input = { Bucket: AWS_BUCKET_NAME, Key: key };
    const command = new DeleteObjectCommand(input);
    const data = await s3.send(command);
    return data;
  }
}

export default S3BucketManager;
