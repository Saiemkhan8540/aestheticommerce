const { z } = require("zod");

module.exports = z.object({
  taskId: z.string({ required_error: "Task ID is required" }),
  reason: z.string().min(3, "Rejection reason required").optional(),
});