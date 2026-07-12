import { PrismaClient, AssetAllocation, AllocationStatus } from '@prisma/client';

export interface AllocationQueryFilters {
  page?: number;
  limit?: number;
  employeeId?: string;
  assetId?: string;
  status?: AllocationStatus;
}

export class AssetAllocationRepository {
  constructor(private prisma: PrismaClient) {}

  async create(data: {
    assetId: string;
    employeeId: string;
    allocatedBy: string;
    expectedReturnDate: Date;
    remarks?: string;
  }): Promise<AssetAllocation> {
    return this.prisma.assetAllocation.create({
      data: {
        assetId: data.assetId,
        employeeId: data.employeeId,
        allocatedBy: data.allocatedBy,
        expectedReturnDate: data.expectedReturnDate,
        remarks: data.remarks,
        status: 'ACTIVE',
      },
    });
  }

  async findById(id: string): Promise<AssetAllocation | null> {
    return this.prisma.assetAllocation.findUnique({
      where: { id },
    });
  }

  async findActiveAllocationByAssetId(assetId: string): Promise<AssetAllocation | null> {
    return this.prisma.assetAllocation.findFirst({
      where: {
        assetId,
        status: 'ACTIVE',
      },
    });
  }

  async update(id: string, data: {
    actualReturnDate?: Date;
    status?: AllocationStatus;
    remarks?: string;
  }): Promise<AssetAllocation> {
    return this.prisma.assetAllocation.update({
      where: { id },
      data,
    });
  }

  async findManyAndCount(filters: AllocationQueryFilters): Promise<{ allocations: any[]; total: number }> {
    const page = Number(filters.page) || 1;
    const limit = Number(filters.limit) || 10;
    const skip = (page - 1) * limit;

    const whereClause: any = {};

    if (filters.employeeId) {
      whereClause.employeeId = filters.employeeId;
    }
    if (filters.assetId) {
      whereClause.assetId = filters.assetId;
    }
    if (filters.status) {
      whereClause.status = filters.status;
    }

    const [allocations, total] = await this.prisma.$transaction([
      this.prisma.assetAllocation.findMany({
        where: whereClause,
        include: {
          asset: {
            select: {
              id: true,
              assetTag: true,
              name: true,
              serialNumber: true,
            },
          },
          employee: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          manager: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
        orderBy: { allocatedDate: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.assetAllocation.count({ where: whereClause }),
    ]);

    return { allocations, total };
  }
}
