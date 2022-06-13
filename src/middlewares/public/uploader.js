const multer = require("multer");
const uuid = require("uuid");

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

exports.uploadFiles = (file, directory) => {
	const fileExtension = mime.extension(file.mimetype);
	file.filename = uuid.v4() + "." + fileExtension;
	file.path = directory + file.filename;
	fs.createWriteStream(file.path).write(file.buffer);
	return file;
};
