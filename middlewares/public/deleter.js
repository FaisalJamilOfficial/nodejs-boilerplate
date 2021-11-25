const fs = require("fs");

exports.deleteFiles = (files) => {
	try {
		if (files && Array.isArray(files)) {
			for (let i = 0; i < files.length; i++) {
				const element = files[i];
				fs.unlinkSync(element.path);
			}
		}
	} catch (error) {
		throw error;
	}
};
