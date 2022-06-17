const fs = require("fs");

const { PROFILE_PICTURES_DIRECTORY } = require("../configs/directories");

class FilesDeleter {
	constructor() {
		this.fs = fs;
	}

	/**
	 * Delete profile picture file
	 * @param {string} profilePicture profile picture file name
	 * @returns {null}
	 */
	async deleteProfilePicture(parameters) {
		const { profilePicture } = parameters;
		const array = [];
		const PATH = PROFILE_PICTURES_DIRECTORY;
		array.push({ path: PATH + profilePicture });
		array.push({ path: PATH + "thumbnails/" + profilePicture });
		this.deleteFiles(array);
		return;
	}

	/**
	 * Delete files from server
	 * @param {[files]} files array of files
	 * @returns {null}
	 */
	async deleteFiles(parameters) {
		const { files } = parameters;
		if (files && Array.isArray(files)) {
			for (let i = 0; i < files.length; i++) {
				const element = files[i];
				fs.unlinkSync(element.path);
			}
		}
		return;
	}
}

module.exports = FilesDeleter;
