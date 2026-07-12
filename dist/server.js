"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
// Import all your module routers
const routes_1 = __importDefault(require("./modules/auth/routes"));
const routes_2 = __importDefault(require("./modules/departments/routes"));
const routes_3 = __importDefault(require("./modules/categories/routes"));
const routes_4 = __importDefault(require("./modules/users/routes"));
//import dashboardRoutes from "./modules/dashboard/routes";
const routes_5 = __importDefault(require("./modules/notifications/routes"));
const routes_6 = __importDefault(require("./modules/activityLogs/routes"));
const routes_7 = require("./modules/assets/routes");
const error_middleware_1 = require("./middleware/error.middleware");
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5000;
// Security & Utility Middlewares
app.use((0, helmet_1.default)()); // Sets secure HTTP headers
app.use((0, cors_1.default)()); // Enables Cross-Origin Resource Sharing
app.use(express_1.default.json()); // Parses incoming JSON payloads
// Mount Routes (Module 1 APIs)
// Add this above your "Mount Routes" section
app.get('/api/health', (_req, res) => {
    res.status(200).json({ success: true, message: 'ERP Backend is operational' });
});
// Your existing mount routes...
app.use("/api/v1/auth", routes_1.default);
app.use("/api/v1/departments", routes_2.default);
app.use("/api/v1/categories", routes_3.default);
app.use("/api/v1/users", routes_4.default); // Contains /directory and /promote
//app.use("/api/v1/dashboard", dashboardRoutes);
app.use("/api/v1/notifications", routes_5.default);
app.use("/api/v1/activity-logs", routes_6.default);
app.use("/api/v1/assets", routes_7.assetRoutes);
// Global Error Handler (Must be the last middleware)
app.use(error_middleware_1.errorHandler);
// Start Server
app.listen(PORT, () => {
    console.log(`🚀 ERP Backend (Module 1) is running on port ${PORT}`);
});
//# sourceMappingURL=server.js.map