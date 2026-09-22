const { ZodError } = require("zod");

// Validates whichever parts of the request the schema defines (body, params, query).
// A schema that only defines `body` (like the auth ones) still works exactly as before.
const validate = (schema) => (req, res, next) => {
  try {
    const parsed = schema.parse({
      body: req.body,
      params: req.params,
      query: req.query,
    });

    if (parsed.body) req.body = parsed.body;
    if (parsed.params) req.params = parsed.params;
    if (parsed.query) req.query = parsed.query;

    next();
  } catch (error) {
    if (error instanceof ZodError) {
      const issues = error.issues; // Zod v4: `.issues`, not `.errors`
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