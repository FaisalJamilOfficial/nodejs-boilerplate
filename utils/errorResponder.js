class ErrorResponder extends Error {
	constructor(message, statusCode) {
		super(message);
		this.statusCode = statusCode;
	}
}

const throwError = (message) => {
	throw new Error(message);
};

module.exports = { ErrorResponder, throwError };
