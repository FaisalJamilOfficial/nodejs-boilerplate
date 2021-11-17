const fs = require("fs");

exports.deleteFiles = (files) => {
	try {
		if (files && Array.isArray(files)) {
			files.forEach((element) => {
				fs.unlink(element.path, (error) => {
					if (error) throw error;
				});
			});
		}
	} catch (error) {
		throw error;
	}
};
