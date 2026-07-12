import { ReportsRepository } from './repository';

export class ReportsService {
  constructor(private reportsRepository: ReportsRepository) {}

  async getDashboardSummary() {
    const [
      assetStatus,
      maintStatus,
      deptUtilization,
      bookings,
      audits,
      mostAllocated,
      overdueMaintenance,
    ] = await Promise.all([
      this.reportsRepository.getAssetStatusStats(),
      this.reportsRepository.getMaintenanceStatusStats(),
      this.reportsRepository.getDepartmentUtilization(),
      this.reportsRepository.getBookingStats(),
      this.reportsRepository.getAuditFindings(),
      this.reportsRepository.getMostAllocatedAssets(),
      this.reportsRepository.getOverdueMaintenanceCount(),
    ]);

    // KPI Cards computations
    const assetsUnderMaintCount = assetStatus.find(s => s.status === 'UNDER_MAINTENANCE')?._count.id || 0;
    const pendingMaintRequestsCount = maintStatus.find(s => s.status === 'PENDING')?._count.id || 0;
    const missingAssetsCount = audits.find(a => a.verificationStatus === 'MISSING')?._count.id || 0;

    return {
      kpi: {
        assetsUnderMaintenance: assetsUnderMaintCount,
        pendingMaintenanceRequests: pendingMaintRequestsCount,
        overdueMaintenanceCount: overdueMaintenance,
        missingAssets: missingAssetsCount,
      },
      charts: {
        assetsByStatus: assetStatus,
        maintenanceByStatus: maintStatus,
        departmentUtilization: deptUtilization,
        bookingsByResource: bookings,
        auditFindings: audits,
        mostAllocatedAssets: mostAllocated,
      },
    };
  }

  async getAssetSummary() {
    const assetStatus = await this.reportsRepository.getAssetStatusStats();
    const deptUtilization = await this.reportsRepository.getDepartmentUtilization();
    return { assetStatus, deptUtilization };
  }

  async getBookingSummary() {
    return this.reportsRepository.getBookingStats();
  }

  async getMaintenanceSummary() {
    return this.reportsRepository.getMaintenanceStatusStats();
  }

  async getAuditSummary() {
    return this.reportsRepository.getAuditFindings();
  }

  // Report CSV Generators
  async exportBookingsCsv(): Promise<string> {
    const bookings = await this.reportsRepository.getDetailedBookingReport();
    let csv = 'Booking ID,Resource ID,Resource Type,Booked By (Name),Booked By (Email),Start Time,End Time,Purpose,Status,Created At\n';
    
    for (const b of bookings) {
      csv += `"${b.id}","${b.resourceId}","${b.resourceType}","${b.user?.name || ''}","${b.user?.email || ''}","${b.startTime.toISOString()}","${b.endTime.toISOString()}","${(b.purpose || '').replace(/"/g, '""')}","${b.status}","${b.createdAt.toISOString()}"\n`;
    }
    return csv;
  }

  async exportMaintenanceCsv(): Promise<string> {
    const requests = await this.reportsRepository.getDetailedMaintenanceReport();
    let csv = 'Request ID,Asset ID,Asset Tag,Asset Name,Reported By,Assigned To,Issue Title,Description,Priority,Status,Approval Status,Created At\n';

    for (const r of requests) {
      csv += `"${r.id}","${r.assetId}","${r.asset?.assetTag || ''}","${r.asset?.name || ''}","${r.reporter?.name || ''}","${r.technician?.name || 'Unassigned'}","${r.issueTitle.replace(/"/g, '""')}","${r.description.replace(/"/g, '""')}","${r.priority}","${r.status}","${r.approvalStatus}","${r.createdAt.toISOString()}"\n`;
    }
    return csv;
  }

  async exportAuditCsv(): Promise<string> {
    const records = await this.reportsRepository.getDetailedAuditReport();
    let csv = 'Record ID,Audit Cycle,Asset ID,Asset Tag,Asset Name,Verified By,Verification Status,Remarks,Verified At\n';

    for (const rec of records) {
      csv += `"${rec.id}","${rec.cycle?.name || ''}","${rec.assetId}","${rec.asset?.assetTag || ''}","${rec.asset?.name || ''}","${rec.verifier?.name || ''}","${rec.verificationStatus}","${(rec.remarks || '').replace(/"/g, '""')}","${rec.verifiedAt.toISOString()}"\n`;
    }
    return csv;
  }

  async exportAssetsCsv(): Promise<string> {
    const assets = await this.reportsRepository.getDetailedAssetReport();
    let csv = 'Asset ID,Asset Tag,Serial Number,Name,Category,Department,Location,Vendor,Purchase Date,Purchase Cost,Condition,Status,Created At\n';

    for (const a of assets) {
      csv += `"${a.id}","${a.assetTag}","${a.serialNumber}","${a.name}","${a.category?.name || ''}","${a.department?.name || ''}","${a.location}","${a.vendor}","${a.purchaseDate.toISOString().split('T')[0]}","${a.purchaseCost.toString()}","${a.condition}","${a.status}","${a.createdAt.toISOString()}"\n`;
    }
    return csv;
  }
}
