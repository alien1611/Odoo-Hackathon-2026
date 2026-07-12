import { PrismaClient, MaintenanceRequest, MaintenanceStatus, Priority } from '@prisma/client';

export interface MaintenanceQueryFilters {
  page?: number;
  limit?: number;
  status?: MaintenanceStatus;
  priority?: Priority;
  assetId?: string;
  assignedTo?: string;
}

export class MaintenanceRepository {
  constructor(private prisma: PrismaClient) {}

  async create(data: {
    assetId: string;
    reportedBy: string;
    issueTitle: string;
    description: string;
    priority: Priority;
  }): Promise<MaintenanceRequest> {
    return this.prisma.maintenanceRequest.create({
      data: {
        assetId: data.assetId,
        reportedBy: data.reportedBy,
        issueTitle: data.issueTitle,
        description: data.description,
        priority: data.priority,
        status: 'PENDING',
        approvalStatus: 'PENDING',
      },
    });
  }

  async findById(id: string): Promise<MaintenanceRequest | null> {
    return this.prisma.maintenanceRequest.findUnique({
      where: { id },
    });
  }

  async update(id: string, data: {
    assignedTo?: string | null;
    status?: MaintenanceStatus;
    approvalStatus?: string;
    priority?: Priority;
    description?: string;
  }): Promise<MaintenanceRequest> {
    return this.prisma.maintenanceRequest.update({
      where: { id },
      data,
    });
  }

  async findManyAndCount(filters: MaintenanceQueryFilters): Promise<{ requests: any[]; total: number }> {
    const page = Number(filters.page) || 1;
    const limit = Number(filters.limit) || 10;
    const skip = (page - 1) * limit;

    const whereClause: any = {};
    if (filters.status) whereClause.status = filters.status;
    if (filters.priority) whereClause.priority = filters.priority;
    if (filters.assetId) whereClause.assetId = filters.assetId;
    if (filters.assignedTo) whereClause.assignedTo = filters.assignedTo;

    const [requests, total] = await this.prisma.$transaction([
      this.prisma.maintenanceRequest.findMany({
        where: whereClause,
        include: {
          asset: {
            select: {
              id: true,
              assetTag: true,
              name: true,
              status: true,
            },
          },
          reporter: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          technician: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.maintenanceRequest.count({ where: whereClause }),
    ]);

    return { requests, total };
  }
}
