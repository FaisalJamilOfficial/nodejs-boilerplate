const AWS = require("aws-sdk");
const multer = require("multer");
const multerS3 = require("multer-s3");
const uuid = require("uuid").v4;
const mime = require("mime-types");
const { AWS_NAME, AWS_ACCESS_KEY, AWS_SECRET_KEY, AWS_REGION } = process.env;
const s3Client = new AWS.S3({
  // apiVersion: "2006-03-01",
  accessKeyId: AWS_ACCESS_KEY,
  secretAccessKey: AWS_SECRET_KEY,
  // ServerSideEncryption: "AES256",
  region: AWS_REGION,
});

class S3BucketManager {
  constructor() {
    this.s3Client = s3Client;
  }

  /**
   * upload image to s3 bucket
   * @returns {object} file object <req.file>
   */
  upload = multer({
    storage: multerS3({
      s3: s3Client,
      bucket: AWS_NAME,
      metadata: (req, file, cb) => {
        cb(null, { fieldName: file.fieldname });
      },
      key: (req, file, cb) => {
        cb(null, uuid());
      },
    }),
  });

  async deleteAwsObject(url) {
    const url1 = String(url).split("/");
    const len = String(url).split("/").length;
    const uploadParams = {
      Bucket: AWS_NAME,
      Key: url1[len - 1], // pass key
    };
    s3Client.deleteObject(uploadParams, async (err, data) => {
      if (err) {
        console.log("err" + err);
      } else {
        console.log("deleted" + JSON.stringify(data));
      }
    });
  }

  async uploadFile(file, directory) {
    const fileObj = Array.isArray(file) ? file[0] : file;
    let fileName = uuid();
    const fileExtension = mime.extension(fileObj.mimetype);
    fileName += "." + fileExtension;
    if (directory) fileName = `${directory}/${fileName}`;
    const uploadParams = {
      Bucket: AWS_NAME,
      Key: fileName, // pass key
      ContentType: fileObj.mimetype,
      Body: fileObj.buffer, // pass file body
    };
    return await s3Client
      .upload(uploadParams)
      .promise()
      .then((data) => {
        return data.Key;
      })
      .catch((e) => {
        console.log("e", e);
      });
  }
}

module.exports = S3BucketManager;
