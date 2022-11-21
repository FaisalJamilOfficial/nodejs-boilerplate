const sharp = require("sharp");
const uuid = require("uuid");
const FilesUploader = require("../utils/FilesUploader");
const { ATTACHMENTS_DIRECTORY } = require("../configs/directories");

class SharpManager {
	constructor() {
		this.sharp = sharp;
	}

	/**
	 * Resize images
	 * @param {[object]} images image files
	 * @param {string} path directory to save resized images
	 * @returns {[object]} array of resized images
	 */
	async resizeImages(parameters) {
		const { images, path } = parameters;
		const array = [];
		if (images) {
			for (let i = 0; i < images.length; i++) {
				const buffer = images[i].buffer;
				let id;
				if (imagesMimeRegex.test(images[i].mimetype)) {
					const file = new FilesUploader().uploadFile({
						file,
						directory: ATTACHMENTS_DIRECTORY,
					});
					id = file.filename;
				} else {
					const id = uuid.v4() + ".png";

					await sharp(buffer)
						.png({
							// mozjpeg: true,
							palette: true,
							quality:
								images[i].size > 6000000
									? 25
									: images[i].size > 4000000
									? 35
									: images[i].size > 2000000
									? 45
									: 65,
							background: "white",
						})
						.toFile(path + id);
				}
				array.push({
					...images[i],
					path: id,
				});
			}
			return array;
		} else return;
	}

	/**
	 * Resize images with thumbnails
	 * @param {[object]} images image files
	 * @param {string} path directory to save resized images
	 * @returns {[object]} array of resized images
	 */
	async resizeImagesWithThumbnails(parameters) {
		const { images, path } = parameters;

		const array = [];
		if (images) {
			const imagesMimeRegex = new RegExp("image/(.*)");
			for (let i = 0; i < images.length; i++) {
				const buffer = images[i].buffer;
				let id;

				if (imagesMimeRegex.test(images[i].mimetype)) {
					// const fileExtension = mime.extension(images[i].mimetype);
					id = uuid.v4() + ".png";
					await sharp(buffer)
						.resize({
							width: 200,
							fit: "contain",
							// background: "white",
						})
						// .jpeg({ mozjpeg: true })
						.png({ palette: true })
						.toFile(path + "thumbnails/" + id);
					await sharp(buffer)
						.png({
							// mozjpeg: true,
							palette: true,
							quality:
								images[i].size > 6000000
									? 25
									: images[i].size > 4000000
									? 35
									: images[i].size > 2000000
									? 45
									: 65,
							// background: "white",
						})
						.toFile(path + id);
				} else {
					const file = await new FilesUploader().uploadFile({
						file: images[i],
						directory: ATTACHMENTS_DIRECTORY,
					});
					id = file.filename;
				}

				array.push({
					...images[i],
					path: id,
				});
			}
			return array;
		} else return;
	}
}

module.exports = SharpManager;
