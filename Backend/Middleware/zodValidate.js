/**
 * Zod schema validation middleware.
 * Create Zod schemas inside the `validators/` folder and use this middleware
 * in your route files to validate request data.
 * @param {"body" | "query" | "params"} [property = "body"]  - property you want to validate 
 * @returns next() middleware  
 */

const AppError = require("../utils/AppError");

const zodValidate = (schema, property = "body") => {
    return (req,res,next) =>{
        const dataToValidate = req[property] || {};
        const parsed = schema.safeParse(dataToValidate);

        if(!parsed.success){
            console.error("Zod Validation Error:", JSON.stringify(parsed.error.issues, null, 2));
            return next(new AppError(parsed.error.issues[0].message, 400, parsed.error.issues));
        }

        req[property] = parsed.data;
        next();
    };
};

module.exports = zodValidate;