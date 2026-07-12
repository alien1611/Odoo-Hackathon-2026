"use strict";
// server/src/middleware/rbac.middleware.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireRole = void 0;
const requireRole = (allowedRoles) => {
    return (req, res, next) => {
        const user = req.user;
        if (!user) {
            res.status(401).json({
                success: false,
                message: "Unauthorized - User context not found",
                error: {},
            });
            return;
        }
        if (!allowedRoles.includes(user.role)) {
            res.status(403).json({
                success: false,
                message: `Forbidden - Requires one of the following roles: ${allowedRoles.join(", ")}`,
                error: {},
            });
            return;
        }
        next();
    };
};
exports.requireRole = requireRole;
//# sourceMappingURL=rbac.middleware.js.map