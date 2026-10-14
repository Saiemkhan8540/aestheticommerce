const { z } = require("zod");

const toNumber = z.string().transform(Number)
                 .refine(val => !isNaN(val) , {
                    message : "Must be a valid number"
                 });

module.exports = { toNumber };

