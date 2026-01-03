import { validationResult } from "express-validator";
import  ApiError  from "../utils/api-error.js";
const validate = (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        // Convert errors into an array of objects
        const extractedErrors = errors.array().map(err => ({
            field: err.path,
            message: err.msg
        }));

        // Pass error to global error handler
        return next(new ApiError(422, "Received data is not valid", extractedErrors));
    }
    next();
};

export  {validate};
   

