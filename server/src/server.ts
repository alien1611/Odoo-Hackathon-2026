import express, { Application } from "express";
import cors from "cors";
import helmet from "helmet";

// Import all your module routers
import authRoutes from "./modules/auth/routes";
import departmentRoutes from "./modules/departments/routes";
import categoryRoutes from "./modules/categories/routes";
import userRoutes from "./modules/users/routes";
import dashboardRoutes from "./modules/dashboard/routes";
import notificationRoutes from "./modules/notifications/routes";
import activityLogRoutes from "./modules/activityLogs/routes";
import { assetRoutes } from "./modules/assets/routes";
import { bookingRoutes } from "./modules/bookings/routes";
import { maintenanceRoutes } from "./modules/maintenance/routes";
import { auditRoutes } from "./modules/audit/routes";
import { reportsRoutes } from "./modules/reports/routes";

import { errorHandler } from "./middleware/error.middleware";

const app: Application = express();
const PORT = process.env.PORT || 5000;

// Security & Utility Middlewares
app.use(helmet()); // Sets secure HTTP headers
app.use(cors()); // Enables Cross-Origin Resource Sharing
app.use(express.json()); // Parses incoming JSON payloads

// Mount Routes (Module 1 APIs)
// Add this above your "Mount Routes" section
app.get('/api/health', (_req, res) => {
  res.status(200).json({ success: true, message: 'ERP Backend is operational' });
});

// Your existing mount routes...
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/departments", departmentRoutes);
app.use("/api/v1/categories", categoryRoutes);
app.use("/api/v1/users", userRoutes); // Contains /directory and /promote
app.use("/api/v1/dashboard", dashboardRoutes);
app.use("/api/v1/notifications", notificationRoutes);
app.use("/api/v1/activity-logs", activityLogRoutes);
app.use("/api/v1/assets", assetRoutes);
app.use("/api/v1/bookings", bookingRoutes);
app.use("/api/v1/maintenance", maintenanceRoutes);
app.use("/api/v1/audits", auditRoutes);
app.use("/api/v1/reports", reportsRoutes);

// Global Error Handler (Must be the last middleware)
app.use(errorHandler);

// Start Server
app.listen(PORT, () => {
  console.log(`🚀 ERP Backend (Module 1) is running on port ${PORT}`);
});