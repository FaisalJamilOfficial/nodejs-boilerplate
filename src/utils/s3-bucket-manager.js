// module imports
import {
  S3Client,
  DeleteObjectCommand,
  CopyObjectCommand,
} from "@aws-sdk/client-s3";
import multer from "multer";
import multerS3 from "multer-s3";
import { v4 } from "uuid";
import mime from "mime-types";
import path from "path";

// destructuring assignments
const { AWS_BUCKET_NAME, AWS_ACCESS_KEY, AWS_SECRET_KEY, AWS_REGION } =
  process.env;

// variable initializations
const s3 = new S3Client({
  credentials: { accessKeyId: AWS_ACCESS_KEY, secretAccessKey: AWS_SECRET_KEY },
  region: AWS_REGION,
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
      contentType: multerS3.AUTO_CONTENT_TYPE,
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
   * @description delete s3 bucket object
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
    return await s3.send(command);
  }

  /**
   * @description copy s3 bucket object
   * @param {String} sourceFile path to source file
   * @returns {Object} data of copied object
   */
  async copy(params) {
    const { sourceFile } = params;
    const key = v4() + path.extname(sourceFile);
    const input = {
      Bucket: AWS_BUCKET_NAME,
      CopySource: sourceFile,
      Key: key,
    };
    const command = new CopyObjectCommand(input);
    const data = await s3.send(command);
    return { ...data, key };
  }
}

export default S3BucketManager;
