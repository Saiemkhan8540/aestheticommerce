const { z } = require("zod");

module.exports  = z.object({
  taskId: z.string({
    required_error: "Task ID is required",
  }),
});

