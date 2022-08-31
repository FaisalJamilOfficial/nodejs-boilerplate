const fs = require("fs");

const {
	IMAGES_DIRECTORY,
	ATTACHMENTS_DIRECTORY,
} = require("../configs/directories");

class FilesDeleter {
	constructor() {
		this.fs = fs;
	}

	/**
	 * Delete image file
	 * @param {string} image image file name
	 * @returns {null}
	 */
	async deleteImage(parameters) {
		const { image } = parameters;
		const array = [];
		const PATH = IMAGES_DIRECTORY;
		array.push({ path: PATH + image });
		array.push({ path: PATH + "thumbnails/" + image });
		this.deleteFiles({ files: array });
		return;
	}

	/**
	 * Delete attachment file
	 * @param {string} attachment attachment file name
	 * @returns {null}
	 */
	async deleteAttachment(parameters) {
		const { attachment } = parameters;
		const array = [];
		const PATH = ATTACHMENTS_DIRECTORY;
		array.push({ path: PATH + attachment });
		this.deleteFiles({ files: array });
		return;
	}

	/**
	 * Delete files from server
	 * @param {[object]} files array of files
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
