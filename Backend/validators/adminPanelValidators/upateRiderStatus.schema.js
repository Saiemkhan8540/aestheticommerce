const { z } = require("zod");
module.exports.updateRiderStatusSchema = z.object({
  isActive: z.boolean(),
});