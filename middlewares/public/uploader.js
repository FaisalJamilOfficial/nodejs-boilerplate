const multer = require("multer");
const uuid = require("uuid");

const imageMimeTypes = ["image/png", "image/jpg", "image/jpeg"];
const documentMimeTypes = ["application/pdf"];

exports.PUBLIC_DIRECTORY = "public/";
exports.IMAGES_DIRECTORY = "public/images/";
exports.DOCUMENTS_DIRECTORY = "public/documents/";
exports.ATTACHMENTS_DIRECTORY = "public/attachments/";
exports.PROFILE_PICTURES_DIRECTORY = "public/profilePictures/";

exports.upload = (directory) => {
	return multer({
		storage: multer.diskStorage({
			destination: function (req, file, cb) {
				console.log("file.mimetype", file.mimetype);
				cb(null, directory);
			},
			filename: function (req, file, cb) {
				cb(null, uuid.v4() + file.originalname);
			},
		}),
	});
};

exports.uploadTemporary = multer({ storage: multer.memoryStorage() });
