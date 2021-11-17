const { deleteFiles } = require("../public/deleter");

exports.deleteProfilePicture = (profilePicture) => {
	try {
		const array = [];
		const PATH = "public/images/profilePictures/";
		array.push({ path: PATH + profilePicture });
		array.push({ path: PATH + "thumbnails/" + profilePicture });
		deleteFiles(array);
		return { success: true };
	} catch (error) {
		throw error;
	}
};
