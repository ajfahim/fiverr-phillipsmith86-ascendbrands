import { ZodError } from 'zod'; // Assuming you're using Zod for validation

const validateRequest = (schema) => {
  return async (req, res, next) => {
    try {
      // Validate the request body and cookies
      await schema.parseAsync({
        body: req.body,
        cookies: req.cookies,
      });

      // If validation is successful, continue to the next middleware
      next();
    } catch (error) {
      // If validation fails, pass the error to the global error handler
      if (error instanceof ZodError) {
        return res.status(400).json({
          status: 'error',
          message: 'Validation failed',
          errors: error.errors, // Send the Zod validation errors
        });
      }

      // If it's not a Zod error, pass it to the next error handler
      next(error);
    }
  };
};

export default validateRequest;
