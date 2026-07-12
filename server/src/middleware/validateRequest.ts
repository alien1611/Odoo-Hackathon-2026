import { Request, Response, NextFunction } from 'express';
import { AnyZodObject } from 'zod';

export const validateRequest = (schema: AnyZodObject) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const parsed = await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      
      // req.body is fully writable, so this is safe. (This holds our transformed Dates).
      req.body = parsed.body;
      
      // Use Object.assign to safely mutate query and params without triggering the getter error
      Object.assign(req.query, parsed.query || {});
      Object.assign(req.params, parsed.params || {});
      
      next();
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: 'Validation Failure',
        error: error.errors || error.message
      });
    }
  };
};