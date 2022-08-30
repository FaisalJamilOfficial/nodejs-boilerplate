const SharpManager = require("../utils/SharpManager");

const { IMAGES_DIRECTORY } = require("../configs/directories");

exports.resizeImages = async (req, res, next) => {
	try {
		const { images } = req.files || {};

		if (images) {
			const path = IMAGES_DIRECTORY;

			// imagesData contains 1.image_name 2.image_path
			const imagesData = { images, path };

			req.files.images = await new SharpManager().resizeImagesWithThumbnails(
				imagesData
			);
			next();
		} else {
			next();
		}
	} catch (error) {
		next(error);
	}
};
