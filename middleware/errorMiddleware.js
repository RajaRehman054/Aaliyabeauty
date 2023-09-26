var ErrorHandler = require('../utils/error');

const errorMiddleware = (err, req, res, next) => {
	message = err.message || 'Internal Server Error';
	statusCode = err.statusCode || 500;

	if (err.message === 'Incorrect Credentials') {
		var error = new ErrorHandler(message, statusCode);
	} else {
		var error = new ErrorHandler(message, statusCode);
	}

	res.status(error.statusCode).json({
		message: error.message,
		status: error.statusCode,
	});
};

module.exports = errorMiddleware;
