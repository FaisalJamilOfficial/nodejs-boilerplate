const fs = require("fs");
const uuid = require("uuid");

class FilesUploader {
	constructor() {
		this.fs = fs;
	}

	/**
	 * Upload file
	 * @param {object} file file object
	 * @param {string} directory directory to save file
	 * @returns {object} file object
	 */
	async uploadFile(parameters) {
		const { file, directory } = parameters;
		const fileExtension = mime.extension(file.mimetype);
		file.filename = uuid.v4() + "." + fileExtension;
		file.path = directory + file.filename;
		fs.createWriteStream(file.path).write(file.buffer);
		return file;
	}

	/**
	 * Upload files
	 * @param {[object]} files array of file
	 * @param {string} directory directory to save file
	 * @returns {[object]} array of file
	 */
	async uploadFiles(parameters) {
		const { files, directory } = parameters;
		files = files.map((file) => {
			const fileExtension = mime.extension(file.mimetype);
			file.filename = uuid.v4() + "." + fileExtension;
			file.path = directory + file.filename;
			fs.createWriteStream(file.path).write(file.buffer);
			return file;
		});
	}
}

module.exports = FilesUploader;
