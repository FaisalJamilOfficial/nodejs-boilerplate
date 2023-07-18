// module imports
import sharp from "sharp";
import { v4 } from "uuid";

// file imports
import FilesUploader from "./files_uploader.js";
import directories from "../configs/directories.js";

// destructuring assignments
const { ATTACHMENTS_DIRECTORY } = directories;

class SharpManager {
  constructor() {
    this.sharp = sharp;
  }

  /**
   * @description Resize images
   * @param {[object]} images image files
   * @param {String} path directory to save resized images
   * @returns {[Object]} array of resized images
   */
  async resizeImages(params) {
    const { images, path } = params;

    const array = [];
    if (images) {
      // const imagesMimeRegex = new RegExp("image/(.*)");
      const imagesMimeRegex = /image\/(.*)/;
      for (let i = 0; i < images.length; i++) {
        const buffer = images[i].buffer;
        let id;

        if (imagesMimeRegex.test(images[i].mimetype)) {
          // const fileExtension = mime.extension(images[i].mimetype);
          id = v4() + ".png";
          await sharp(buffer)
            .png({
              // mozjpeg: true,
              palette: true,
              quality:
                images[i].size > 6000000
                  ? 25
                  : images[i].size > 4000000
                  ? 35
                  : images[i].size > 2000000
                  ? 45
                  : 65,
              // background: "white",
            })
            .toFile(path + id);
        } else {
          const file = await new FilesUploader().uploadFile({
            file: images[i],
            directory: ATTACHMENTS_DIRECTORY,
          });
          id = file.filename;
        }

        array.push({
          ...images[i],
          path: id,
        });
      }
      return array;
    }
  }

  /**
   * @description Resize images with thumbnails
   * @param {[object]} images image files
   * @param {String} path directory to save resized images
   * @returns {[Object]} array of resized images
   */
  async resizeImagesWithThumbnails(params) {
    const { images, path } = params;

    const array = [];
    if (images) {
      if (path);
      // const imagesMimeRegex = new RegExp("image/(.*)");
      const imagesMimeRegex = /image\/(.*)/;
      for (let i = 0; i < images.length; i++) {
        const buffer = images[i].buffer;
        let id;

        if (imagesMimeRegex.test(images[i].mimetype)) {
          // const fileExtension = mime.extension(images[i].mimetype);
          id = v4() + ".png";
          await sharp(buffer)
            .resize({
              width: 200,
              fit: "contain",
              // background: "white",
            })
            // .jpeg({ mozjpeg: true })
            .png({ palette: true })
            .toFile(path + "thumbnails/" + id);
          await sharp(buffer)
            .png({
              // mozjpeg: true,
              palette: true,
              quality:
                images[i].size > 6000000
                  ? 25
                  : images[i].size > 4000000
                  ? 35
                  : images[i].size > 2000000
                  ? 45
                  : 65,
              // background: "white",
            })
            .toFile(path + id);
        } else {
          const file = await new FilesUploader().uploadFile({
            file: images[i],
            directory: ATTACHMENTS_DIRECTORY,
          });
          id = file.filename;
        }

        array.push({
          ...images[i],
          path: id,
        });
      }
      return array;
    }
  }
}

export default SharpManager;
