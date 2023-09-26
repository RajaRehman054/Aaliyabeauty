const asyncHandler = promisedFunction => (req, res, next) => {
	Promise.resolve(promisedFunction(req, res, next)).catch(next);
};

module.exports = asyncHandler;
