// module imports

export class ErrorHandler extends Error {
  statusCode;
  constructor(message, statusCode = 500) {
    super(message);
    this.statusCode = statusCode;
  }
}

const error = (err, req, res, next) => {
  let error = err;

  console.error(err);

  if (err.name === "CastError") {
    const message = `Cast failed for value ${err.value}`;
    error = new ErrorHandler(message, 400);
  } else if (err.name === "ValidationError") {
    const message = Object.values(err.errors).map((e) => e.message);
    error = new ErrorHandler(message.toString(), 400);
  } else if (err.code === 11000) {
    let field = Object.keys(err.keyPattern)[0];
    field = field.charAt(0).toUpperCase() + field.slice(1);
    const message = `${field} already exists, try another one instead!`;
    error = new ErrorHandler(message, 400);
  }

  res.status(Number(error?.statusCode) || 500).json({
    error: error?.message || "Server Error",
  });
};
export default error;
