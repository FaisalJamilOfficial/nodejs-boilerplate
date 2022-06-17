const SharpManager = require("../utils/SharpManager");

const { PROFILE_PICTURES_DIRECTORY } = require("../configs/directories");

exports.resizeProfilePicture = async (req, res, next) => {
	try {
		const { picture } = req.files || {};

		if (picture) {
			const path = PROFILE_PICTURES_DIRECTORY;
			const images = picture;

			// imagesData contains 1.image_name 2.image_path
			const imagesData = { images, path };

			req.files.picture = await new SharpManager().resizeImagesWithThumbnails(
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
