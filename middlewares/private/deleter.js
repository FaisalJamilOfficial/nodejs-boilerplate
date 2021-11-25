const { deleteFiles } = require("../public/deleter");

const PROFILE_PICTURES_DIRECTORY = "public/profilePictures/";

exports.deleteProfilePicture = (profilePicture) => {
	try {
		const array = [];
		const PATH = PROFILE_PICTURES_DIRECTORY;
		array.push({ path: PATH + profilePicture });
		array.push({ path: PATH + "thumbnails/" + profilePicture });
		deleteFiles(array);
		return { success: true };
	} catch (error) {
		throw error;
	}
};
