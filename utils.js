const { validationResult } = require('express-validator');

const asyncHandler = (handler) => (req, res, next) =>
    handler(req, res, next).catch(next);

const handleValidationErrors = (req, res, next) => {
    const validationErrors = validationResult(req);
    if (!validationErrors.isEmpty()) {
        const errors = validationErrors.array().map((error) => error.msg);
        const error = new Error("Bad request.");
        error.errors = errors;
        error.status = 400;
        error.title = "Bad request.";
        next(error);
    }
    next();
};

module.exports = {
    asyncHandler,
    handleValidationErrors,
}