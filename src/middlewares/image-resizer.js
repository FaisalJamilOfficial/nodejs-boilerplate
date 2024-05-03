// file imports
import SharpManager from "../utils/sharp-manager.js";
import { exceptionHandler } from "./exception-handler.js";

// variable initializations

export const resizeImages = exceptionHandler(async (req, res, next) => {
  const images = req.files || [];
  const image = req.file || {};
  if (images || image) {
    // imagesData contains 1.image_name 2.image_path
    const imagesData = images ?? [image];

    // req.files = await new SharpManager().resizeImagesWithThumbnails(
    //   imagesData
    // );
    next();
  } else next();
});
