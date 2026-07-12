// server/src/middleware/rbac.middleware.ts

import { Request, Response, NextFunction } from "express";
import { Role } from "@prisma/client";

export const requireRole = (allowedRoles: Role[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const user = (req as any).user;

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