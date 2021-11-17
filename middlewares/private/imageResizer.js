const { resizeImagesWithThumbnails } = require("../public/imageResizer");

exports.resizeProfilePicture = async (req, res, next) => {
	try {
		const { profilePicture } = req.files || {};

		if (profilePicture) {
			const PATH = "public/images/profilePictures/";
			const images = profilePicture;

			// imagesData contains 1.image_name 2.image_path
			const imagesData = { images, PATH };

			req.files.profilePicture = await resizeImagesWithThumbnails(imagesData);
			next();
		} else {
			next();
		}
	} catch (error) {
		next(error);
	}
};
