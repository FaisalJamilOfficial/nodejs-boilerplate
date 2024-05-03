// module imports
import fs from "fs";

// file imports
import { PUBLIC_DIRECTORY } from "../configs/directories.js";

// destructuring assignments

class FilesRemover {
  constructor() {
    this.fs = fs;
  }

  /**
   * @description Delete files from server
   * @param {String[]} files array of files
   */
  async remove(files) {
    for (let i = 0; i < files.length; i++) {
      const element = files[i];
      try {
        fs.unlinkSync(PUBLIC_DIRECTORY + element);
      } catch (error) {
        console.error(error);
      }
    }
  }
}

export default FilesRemover;
