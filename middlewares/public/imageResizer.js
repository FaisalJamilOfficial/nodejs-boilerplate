const sharp = require("sharp");
const uuid = require("uuid");

const imageMimeTypes = ["image/png", "image/jpg", "image/jpeg"];

exports.resizeImages = async (imagesData) => {
	const { images, PATH } = imagesData;
	const array = [];
	if (images) {
		for (let i = 0; i < images.length; i++) {
			if (imageMimeTypes.includes(images[i].mimetype)) {
				const buffer = images[i].buffer;
				const id = uuid.v4() + ".jpeg";
				try {
					sharp(buffer)
						.jpeg({
							mozjpeg: true,
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
						.toFile(PATH + id, (err, info) => {});
					array.push({
						...images[i],
						path: id,
					});
				} catch (error) {
					throw error;
				}
			}
		}
		return array;
	} else return;
};

exports.resizeImagesWithThumbnails = async (imagesData) => {
	const { images, PATH } = imagesData;

	const array = [];
	if (images) {
		for (let i = 0; i < images.length; i++) {
			if (imageMimeTypes.includes(images[i].mimetype)) {
				const buffer = images[i].buffer;
				const id = uuid.v4() + ".jpeg";

				try {
					sharp(buffer)
						.resize({
							width: 200,
							fit: "contain",
							background: "white",
						})
						.jpeg({ mozjpeg: true })
						.toFile(PATH + "thumbnails/" + id, (err, info) => {});
					sharp(buffer)
						.jpeg({
							mozjpeg: true,
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
						.toFile(PATH + id, (err, info) => {});
					array.push({
						...images[i],
						path: id,
					});
				} catch (error) {
					throw error;
				}
			}
		}
		return array;
	} else return;
};
