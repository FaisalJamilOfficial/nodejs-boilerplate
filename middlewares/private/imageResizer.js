const { resizeImagesWithThumbnails } = require("../public/imageResizer");

const PUBLIC_DIRECTORY = "public/";
const IMAGES_DIRECTORY = "public/images/";
const DOCUMENTS_DIRECTORY = "public/documents/";
const ATTACHMENTS_DIRECTORY = "public/attachments/";
const PROFILE_PICTURES_DIRECTORY = "public/profilePictures/";

exports.resizeProfilePicture = async (req, res, next) => {
	try {
		const { profilePicture } = req.files || {};

		if (profilePicture) {
			const PATH = PROFILE_PICTURES_DIRECTORY;
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
