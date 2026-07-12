"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateRequest = void 0;
const validateRequest = (schema) => {
    return async (req, res, next) => {
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
        }
        catch (error) {
            res.status(400).json({
                success: false,
                message: 'Validation Failure',
                error: error.errors || error.message
            });
        }
    };
};
exports.validateRequest = validateRequest;
//# sourceMappingURL=validateRequest.js.map