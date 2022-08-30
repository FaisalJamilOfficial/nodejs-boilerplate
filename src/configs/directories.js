const __basedir = __dirname.toString().replace("configs", "");

module.exports = {
	PUBLIC_DIRECTORY: __basedir + "public/",
	IMAGES_DIRECTORY: __basedir + "/public/images/",
	PROFILE_PICTURES_DIRECTORY: __basedir + "public/images/profile_pictures/",
	ATTACHMENTS_DIRECTORY: __basedir + "public/attachments/",
};
