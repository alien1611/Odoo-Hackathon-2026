import { PrismaClient } from '@prisma/client';

export class ReportsRepository {
  constructor(private prisma: PrismaClient) {}

  async getAssetStatusStats() {
    return this.prisma.asset.groupBy({
      by: ['status'],
      where: { deletedAt: null },
      _count: { id: true },
    });
  }

  async getMaintenanceStatusStats() {
    return this.prisma.maintenanceRequest.groupBy({
      by: ['status'],
      _count: { id: true },
    });
  }

  async getDepartmentUtilization() {
    const counts = await this.prisma.asset.groupBy({
      by: ['departmentId'],
      where: { deletedAt: null },
      _count: { id: true },
    });

    const departments = await this.prisma.department.findMany({
      select: { id: true, name: true },
    });

    return counts.map(c => {
      const dept = departments.find(d => d.id === c.departmentId);
      return {
        departmentId: c.departmentId,
        departmentName: dept ? dept.name : 'Unknown',
        count: c._count.id,
      };
    });
  }

  async getBookingStats() {
    return this.prisma.booking.groupBy({
      by: ['resourceType', 'status'],
      _count: { id: true },
    });
  }

  async getAuditFindings() {
    return this.prisma.auditRecord.groupBy({
      by: ['verificationStatus'],
      _count: { id: true },
    });
  }

  async getMostAllocatedAssets() {
    const allocations = await this.prisma.assetAllocation.groupBy({
      by: ['assetId'],
      _count: { id: true },
      orderBy: { _count: { assetId: 'desc' } },
      take: 5,
    });

    const assetIds = allocations.map(a => a.assetId);
    const assets = await this.prisma.asset.findMany({
      where: { id: { in: assetIds } },
      select: { id: true, name: true, assetTag: true },
    });

    return allocations.map(a => {
      const asset = assets.find(as => as.id === a.assetId);
      return {
        assetId: a.assetId,
        name: asset ? asset.name : 'Unknown',
        assetTag: asset ? asset.assetTag : 'N/A',
        allocationCount: a._count.id,
      };
    });
  }

  async getOverdueMaintenanceCount() {
    const thresholdDate = new Date();
    thresholdDate.setDate(thresholdDate.getDate() - 7); // 7 days ago

    return this.prisma.maintenanceRequest.count({
      where: {
        status: {
          notIn: ['RESOLVED', 'REJECTED'],
        },
        createdAt: {
          lt: thresholdDate,
        },
      },
    });
  }

  // Raw lists for detailed reports export
  async getDetailedBookingReport() {
    return this.prisma.booking.findMany({
      include: {
        user: { select: { name: true, email: true } },
      },
      orderBy: { startTime: 'desc' },
    });
  }

  async getDetailedMaintenanceReport() {
    return this.prisma.maintenanceRequest.findMany({
      include: {
        asset: { select: { assetTag: true, name: true } },
        reporter: { select: { name: true, email: true } },
        technician: { select: { name: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getDetailedAuditReport() {
    return this.prisma.auditRecord.findMany({
      include: {
        asset: { select: { assetTag: true, name: true } },
        verifier: { select: { name: true, email: true } },
        cycle: { select: { name: true } },
      },
      orderBy: { verifiedAt: 'desc' },
    });
  }

  async getDetailedAssetReport() {
    return this.prisma.asset.findMany({
      where: { deletedAt: null },
      include: {
        department: { select: { name: true } },
        category: { select: { name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}
