// module imports
import fs from "fs";

// file imports
import directories from "../configs/directories.js";

// destructuring assignments
const { IMAGES_DIRECTORY, ATTACHMENTS_DIRECTORY } = directories;

class FilesDeleter {
  constructor() {
    this.fs = fs;
  }

  /**
   * Delete image file
   * @param {string} image image file name
   * @returns {null}
   */
  async deleteImage(params) {
    const { image } = params;
    const array = [];
    const PATH = IMAGES_DIRECTORY;
    array.push({ path: PATH + image });
    array.push({ path: PATH + "thumbnails/" + image });
    this.deleteFiles({ files: array });
    return { success: true };
  }

  /**
   * Delete attachment file
   * @param {string} attachment attachment file name
   * @returns {null}
   */
  async deleteAttachment(params) {
    const { attachment } = params;
    const array = [];
    const PATH = ATTACHMENTS_DIRECTORY;
    array.push({ path: PATH + attachment });
    this.deleteFiles({ files: array });
    return { success: true };
  }

  /**
   * Delete files from server
   * @param {[object]} files array of files
   * @returns {null}
   */
  async deleteFiles(params) {
    const { files } = params;
    if (files && Array.isArray(files)) {
      for (let i = 0; i < files.length; i++) {
        const element = files[i];
        try {
          fs.unlinkSync(element.path);
        } catch (error) {
          console.error(error);
        }
      }
    }
    return { success: true };
  }
}

export default FilesDeleter;
