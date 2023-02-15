// file imports
import SharpManager from "../utils/sharp-manager.js";
import directories from "../configs/directories.js";
import { asyncHandler } from "./async-handler.js";

// destructuring assignments
const { IMAGES_DIRECTORY } = directories;

export const resizeImages = asyncHandler(async (req, res, next) => {
  const { images } = req.files || {};
  if (images) {
    const path = IMAGES_DIRECTORY;

    // imagesData contains 1.image_name 2.image_path
    const imagesData = { images, path };

    req.files.images = await new SharpManager().resizeImagesWithThumbnails(
      imagesData
    );
    next();
  } else next();
});
