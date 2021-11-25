const multer = require("multer");
const uuid = require("uuid");

const PUBLIC_DIRECTORY = "public/";
const DOCUMENTS_DIRECTORY = "public/documents/";
const ATTACHMENTS_DIRECTORY = "public/attachments/";

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
