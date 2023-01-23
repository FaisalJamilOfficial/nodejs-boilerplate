const { S3Client, DeleteObjectCommand } = require("@aws-sdk/client-s3");
const multer = require("multer");
const multerS3 = require("multer-s3");
const uuid = require("uuid").v4;
const mime = require("mime-types");
const { AWS_BUCKET_NAME, AWS_ACCESS_KEY, AWS_SECRET_KEY } = process.env;

const s3 = new S3Client({
  credentials: { accessKeyId: AWS_ACCESS_KEY, secretAccessKey: AWS_SECRET_KEY },
});

class S3BucketManager {
  constructor() {
    this.s3 = s3;
  }

  /**
   * upload image to s3 bucket
   * @returns {object} file object <req.file>
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
        cb(null, uuid() + fileExtension);
      },
    }),
  });

  /**
   *
   * @param {string} filePath path to file
   * @returns {object} data of deleted object
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

module.exports = S3BucketManager;
