// module imports
import fs from "fs";
import { v4 } from "uuid";
import mime from "mime";

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
  async uploadFile(params) {
    const { file, directory } = params;
    const fileExtension = mime.extension(file.mimetype);
    file.filename = v4() + "." + fileExtension;
    file.path = directory + file.filename;
    fs.createWriteStream(file.path).write(file.buffer);
    return file;
  }

  /**
   * @description Upload files
   * @param {[object]} files array of file
   * @param {String} directory directory to save file
   * @returns {[Object]} array of file
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
