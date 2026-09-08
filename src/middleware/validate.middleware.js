const validate = (schema) => (req, res, next) => {
  try {
    schema.parse({ body: req.body });
    next();
  } catch (error) {
    if (error.errors) {
      return res.status(400).json({
        success: false,
        message: error.errors[0].message,
        errors: error.errors.map((e) => ({
          field: e.path.join("."),
          message: e.message,
        })),
      });
    }
    next(error);
  }
};

module.exports = { validate };
