import { PrismaClient, AssetHistory } from '@prisma/client';

export class AssetHistoryRepository {
  constructor(private prisma: PrismaClient) {}

  async create(data: {
    assetId: string;
    action: string;
    performedBy: string;
    description: string;
  }): Promise<AssetHistory> {
    return this.prisma.assetHistory.create({
      data: {
        assetId: data.assetId,
        action: data.action,
        performedBy: data.performedBy,
        description: data.description,
      },
    });
  }

  async findByAssetId(assetId: string, page = 1, limit = 10): Promise<{ history: any[]; total: number }> {
    const skip = (page - 1) * limit;
    const [history, total] = await this.prisma.$transaction([
      this.prisma.assetHistory.findMany({
        where: { assetId },
        select: {
          id: true,
          assetId: true,
          action: true,
          performedBy: true,
          description: true,
          timestamp: true,
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
            },
          },
        },
        orderBy: { timestamp: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.assetHistory.count({
        where: { assetId },
      }),
    ]);
    return { history, total };
  }
}
