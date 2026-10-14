const { z } = require("zod");

module.exports = z.object({
  lng: z.number({
    required_error: "Longitude is required",
    invalid_type_error: "Longitude must be a number",
  }),
  lat: z.number({
    required_error: "Latitude is required",
    invalid_type_error: "Latitude must be a number",
  }),
});
