// file imports
import SharpManager from "../utils/sharp-manager.js";
import directories from "../configs/directories.js";
import { exceptionHandler } from "./exception-handler.js";

// destructuring assignments
const { IMAGES_DIRECTORY } = directories;

export const resizeImages = exceptionHandler(async (req, res, next) => {
  const { images } = req.files || [];
  const { image } = req.file || {};
  if (images || image) {
    const path = IMAGES_DIRECTORY;

    // imagesData contains 1.image_name 2.image_path
    const imagesData = { images: images ?? [image], path };

    req.files = await new SharpManager().resizeImagesWithThumbnails(imagesData);
  }
  next();
});
