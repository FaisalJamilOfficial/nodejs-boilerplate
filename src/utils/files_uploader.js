// module imports
import fs from "fs";
import { v4 } from "uuid";
import mime from "mime";

class FilesUploader {
  constructor() {
    this.fs = fs;
  }

  /**
   * Upload file
   * @param {object} file file object
   * @param {string} directory directory to save file
   * @returns {object} file object
   */
  async uploadFile(params) {
    const { file, directory } = params;
    const fileExtension = mime.extension(file.mimetype);
    file.filename = v4() + "." + fileExtension;
    file.path = directory + file.filename;
    fs.createWriteStream(file.path).write(file.buffer);
    return file;
  }

  /**
   * Upload files
   * @param {[object]} files array of file
   * @param {string} directory directory to save file
   * @returns {[object]} array of file
   */
  async uploadFiles(params) {
    let { files, directory } = params;
    files = files.map((file) => {
      const fileExtension = mime.extension(file.mimetype);
      file.filename = v4() + "." + fileExtension;
      file.path = directory + file.filename;
      fs.createWriteStream(file.path).write(file.buffer);
      return file;
    });
    return files;
  }
}

export default FilesUploader;