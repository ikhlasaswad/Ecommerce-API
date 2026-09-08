const { ZodError } = require("zod");

const validate = (schema) => (req, res, next) => {
  try {
    schema.parse({ body: req.body });
    next();
  } catch (error) {
    if (error instanceof ZodError) {
      const issues = error.issues; // Zod v4: use `.issues`, not `.errors`
      return res.status(400).json({
        success: false,
        message: issues[0].message,
        errors: issues.map((e) => ({
          field: e.path.join("."),
          message: e.message,
        })),
      });
    }
    next(error);
  }
};

module.exports = { validate };