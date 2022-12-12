const __basedir = __dirname.toString().replace("configs", "");

module.exports = {
  PUBLIC_DIRECTORY: __basedir + "public/",
  IMAGES_DIRECTORY: __basedir + "/public/images/",
  ATTACHMENTS_DIRECTORY: __basedir + "public/attachments/",
};
