import { PrismaClient, AuditCycle, AuditRecord, AuditStatus, VerificationStatus } from '@prisma/client';

export interface AuditCycleFilters {
  page?: number;
  limit?: number;
  status?: AuditStatus;
}

export class AuditRepository {
  constructor(private prisma: PrismaClient) {}

  async createCycle(data: {
    name: string;
    scope: string;
    startDate: Date;
    endDate: Date;
    createdBy: string;
  }): Promise<AuditCycle> {
    return this.prisma.auditCycle.create({
      data: {
        name: data.name,
        scope: data.scope,
        startDate: data.startDate,
        endDate: data.endDate,
        status: 'OPEN',
        createdBy: data.createdBy,
      },
    });
  }

  async findCycleById(id: string): Promise<AuditCycle | null> {
    return this.prisma.auditCycle.findUnique({
      where: { id },
    });
  }

  async updateCycle(id: string, data: {
    name?: string;
    scope?: string;
    startDate?: Date;
    endDate?: Date;
    status?: AuditStatus;
  }): Promise<AuditCycle> {
    return this.prisma.auditCycle.update({
      where: { id },
      data,
    });
  }

  async findManyCycles(filters: AuditCycleFilters): Promise<{ cycles: any[]; total: number }> {
    const page = Number(filters.page) || 1;
    const limit = Number(filters.limit) || 10;
    const skip = (page - 1) * limit;

    const whereClause: any = {};
    if (filters.status) whereClause.status = filters.status;

    const [cycles, total] = await this.prisma.$transaction([
      this.prisma.auditCycle.findMany({
        where: whereClause,
        include: {
          creator: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
        orderBy: { startDate: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.auditCycle.count({ where: whereClause }),
    ]);

    return { cycles, total };
  }

  async findRecord(auditCycleId: string, assetId: string): Promise<AuditRecord | null> {
    return this.prisma.auditRecord.findFirst({
      where: {
        auditCycleId,
        assetId,
      },
    });
  }

  async upsertRecord(data: {
    auditCycleId: string;
    assetId: string;
    verifiedBy: string;
    verificationStatus: VerificationStatus;
    remarks?: string;
  }): Promise<AuditRecord> {
    const existing = await this.findRecord(data.auditCycleId, data.assetId);

    if (existing) {
      return this.prisma.auditRecord.update({
        where: { id: existing.id },
        data: {
          verifiedBy: data.verifiedBy,
          verificationStatus: data.verificationStatus,
          remarks: data.remarks,
          verifiedAt: new Date(),
        },
      });
    }

    return this.prisma.auditRecord.create({
      data: {
        auditCycleId: data.auditCycleId,
        assetId: data.assetId,
        verifiedBy: data.verifiedBy,
        verificationStatus: data.verificationStatus,
        remarks: data.remarks,
      },
    });
  }

  async findRecordsByCycleId(auditCycleId: string): Promise<any[]> {
    return this.prisma.auditRecord.findMany({
      where: { auditCycleId },
      include: {
        asset: {
          select: {
            id: true,
            assetTag: true,
            name: true,
            status: true,
            condition: true,
            location: true,
          },
        },
        verifier: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  }
}
