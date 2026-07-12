"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = void 0;
const errorHandler = (err, _req, res, _next) => {
    console.error(`[ERROR] ${err.message}`); // Only log to console on backend, not frontend
    res.status(err.status || 500).json({
        success: false,
        message: err.message || "Internal Server Error",
        error: process.env.NODE_ENV === "development" ? err : {}, // Hide stack traces in production
    });
};
exports.errorHandler = errorHandler;
//# sourceMappingURL=error.middleware.js.map