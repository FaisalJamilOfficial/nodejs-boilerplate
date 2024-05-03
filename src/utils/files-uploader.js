// module imports
import fs from "fs";
import { v4 } from "uuid";
import mime from "mime";

// file imports
import { PUBLIC_DIRECTORY } from "../configs/directories.js";

class FilesUploader {
  constructor() {
    this.fs = fs;
  }

  /**
   * @description Upload file
   * @param {Object} file file object
   * @param {String} directory directory to save file
   * @returns {Object} file object
   */
  uploadFile(file) {
    const fileExtension = mime.getExtension(file.mimetype);
    file.filename = v4() + "." + fileExtension;
    file.path = PUBLIC_DIRECTORY + file.filename;
    fs.createWriteStream(file.path).write(file.buffer);
    return file;
  }

  /**
   * @description Upload files
   * @param {[object]} files array of file
   * @param {String} directory directory to save file
   * @returns {[Object]} array of file
   */
  uploadFiles(files) {
    files = files.map((file) => {
      const fileExtension = mime.getExtension(file.mimetype);
      file.filename = v4() + "." + fileExtension;
      file.path = PUBLIC_DIRECTORY + file.filename;
      fs.createWriteStream(file.path).write(file.buffer);
      return file;
    });
    return files;
  }
}

export default FilesUploader;
