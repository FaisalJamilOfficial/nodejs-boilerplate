const { resizeImagesWithThumbnails } = require("../public/imageResizer");

const { PROFILE_PICTURES_DIRECTORY } = require("../../configs/directories");

exports.resizeProfilePicture = async (req, res, next) => {
	try {
		const { picture } = req.files || {};

		if (picture) {
			const PATH = PROFILE_PICTURES_DIRECTORY;
			const images = picture;

			// imagesData contains 1.image_name 2.image_path
			const imagesData = { images, PATH };

			req.files.picture = await resizeImagesWithThumbnails(imagesData);
			next();
		} else {
			next();
		}
	} catch (error) {
		next(error);
	}
};
