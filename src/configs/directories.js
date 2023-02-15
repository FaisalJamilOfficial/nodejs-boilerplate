// module imports
import path from "path";
import { fileURLToPath } from "url";

// variable initializations
const __basedir = path
  .dirname(fileURLToPath(import.meta.url))
  .toString()
  .replace("configs", "");

export default {
  PUBLIC_DIRECTORY: __basedir + "public/",
  IMAGES_DIRECTORY: __basedir + "/public/images/",
  ATTACHMENTS_DIRECTORY: __basedir + "public/attachments/",
};
