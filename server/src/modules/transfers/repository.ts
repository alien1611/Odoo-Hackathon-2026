import { PrismaClient, TransferRequest, TransferStatus } from '@prisma/client';

export interface TransferQueryFilters {
  page?: number;
  limit?: number;
  status?: TransferStatus;
  assetId?: string;
  requestedBy?: string;
}

export class TransferRequestRepository {
  constructor(private prisma: PrismaClient) {}

  async create(data: {
    assetId: string;
    requestedBy: string;
    fromDepartment: string;
    toDepartment: string;
    reason: string;
  }): Promise<TransferRequest> {
    return this.prisma.transferRequest.create({
      data: {
        assetId: data.assetId,
        requestedBy: data.requestedBy,
        fromDepartment: data.fromDepartment,
        toDepartment: data.toDepartment,
        reason: data.reason,
        status: 'PENDING',
      },
    });
  }

  async findById(id: string): Promise<TransferRequest | null> {
    return this.prisma.transferRequest.findUnique({
      where: { id },
    });
  }

  async update(id: string, data: {
    status: TransferStatus;
    approvedBy: string;
  }): Promise<TransferRequest> {
    return this.prisma.transferRequest.update({
      where: { id },
      data: {
        status: data.status,
        approvedBy: data.approvedBy,
      },
    });
  }

  async findManyAndCount(filters: TransferQueryFilters): Promise<{ transfers: any[]; total: number }> {
    const page = Number(filters.page) || 1;
    const limit = Number(filters.limit) || 10;
    const skip = (page - 1) * limit;

    const whereClause: any = {};
    if (filters.status) whereClause.status = filters.status;
    if (filters.assetId) whereClause.assetId = filters.assetId;
    if (filters.requestedBy) whereClause.requestedBy = filters.requestedBy;

    const [transfers, total] = await this.prisma.$transaction([
      this.prisma.transferRequest.findMany({
        where: whereClause,
        include: {
          asset: {
            select: {
              id: true,
              assetTag: true,
              name: true,
            },
          },
          requester: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          approver: {
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
      this.prisma.transferRequest.count({ where: whereClause }),
    ]);

    return { transfers, total };
  }
}
