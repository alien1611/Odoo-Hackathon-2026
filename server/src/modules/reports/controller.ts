import { Request, Response, NextFunction } from 'express';
import { ReportsService } from './service';

export class ReportsController {
  constructor(private reportsService: ReportsService) {}

  getDashboardData = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const data = await this.reportsService.getDashboardSummary();
      res.status(200).json({
        success: true,
        message: 'Dashboard analytics retrieved successfully.',
        data,
      });
    } catch (error) {
      next(error);
    }
  };

  getAssetReport = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const isExport = req.query.export === 'csv';

      if (isExport) {
        const csv = await this.reportsService.exportAssetsCsv();
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=asset_utilization_report.csv');
        res.status(200).send(csv);
        return;
      }

      const data = await this.reportsService.getAssetSummary();
      res.status(200).json({
        success: true,
        message: 'Asset analytics retrieved successfully.',
        data,
      });
    } catch (error) {
      next(error);
    }
  };

  getBookingReport = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const isExport = req.query.export === 'csv';

      if (isExport) {
        const csv = await this.reportsService.exportBookingsCsv();
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=bookings_report.csv');
        res.status(200).send(csv);
        return;
      }

      const data = await this.reportsService.getBookingSummary();
      res.status(200).json({
        success: true,
        message: 'Booking analytics retrieved successfully.',
        data,
      });
    } catch (error) {
      next(error);
    }
  };

  getMaintenanceReport = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const isExport = req.query.export === 'csv';

      if (isExport) {
        const csv = await this.reportsService.exportMaintenanceCsv();
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=maintenance_report.csv');
        res.status(200).send(csv);
        return;
      }

      const data = await this.reportsService.getMaintenanceSummary();
      res.status(200).json({
        success: true,
        message: 'Maintenance analytics retrieved successfully.',
        data,
      });
    } catch (error) {
      next(error);
    }
  };

  getAuditReport = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const isExport = req.query.export === 'csv';

      if (isExport) {
        const csv = await this.reportsService.exportAuditCsv();
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=audit_findings_report.csv');
        res.status(200).send(csv);
        return;
      }

      const data = await this.reportsService.getAuditSummary();
      res.status(200).json({
        success: true,
        message: 'Audit analytics retrieved successfully.',
        data,
      });
    } catch (error) {
      next(error);
    }
  };
}
