const { deleteFiles } = require("../../utils/filesDeleter");
const { PROFILE_PICTURES_DIRECTORY } = require("../../configs/directories");

exports.deleteProfilePicture = (profilePicture) => {
	try {
		const array = [];
		const PATH = PROFILE_PICTURES_DIRECTORY;
		array.push({ path: PATH + profilePicture });
		array.push({ path: PATH + "thumbnails/" + profilePicture });
		deleteFiles(array);
		return { success: true };
	} catch (error) {
		return error;
	}
};
