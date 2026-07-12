import { PrismaClient, Asset, Prisma } from '@prisma/client';
import { CreateAssetInput, UpdateAssetInput, AssetQueryFilters } from './types';

export class AssetRepository {
  private prisma: PrismaClient;

  // Optimized selection matrix to prevent heavy SELECT * queries
  private defaultSelect = {
    id: true,
    assetTag: true,
    serialNumber: true,
    name: true,
    description: true,
    categoryId: true,
    departmentId: true,
    purchaseDate: true,
    purchaseCost: true,
    vendor: true,
    warrantyExpiry: true,
    location: true,
    condition: true,
    status: true,
    qrCode: true,
    image: true,
    createdAt: true,
    updatedAt: true,
  };

  constructor(prismaClient: PrismaClient) {
    this.prisma = prismaClient;
  }

  async findByAssetTag(assetTag: string): Promise<Partial<Asset> | null> {
    return this.prisma.asset.findFirst({
      where: { assetTag, deletedAt: null },
      select: this.defaultSelect,
    });
  }

  async findBySerialNumber(serialNumber: string): Promise<Partial<Asset> | null> {
    return this.prisma.asset.findFirst({
      where: { serialNumber, deletedAt: null },
      select: this.defaultSelect,
    });
  }

  async findById(id: string): Promise<Partial<Asset> | null> {
    return this.prisma.asset.findFirst({
      where: { id, deletedAt: null },
      select: this.defaultSelect,
    });
  }

  async create(data: CreateAssetInput): Promise<Partial<Asset>> {
    return this.prisma.asset.create({
      data: {
        ...data,
        status: 'AVAILABLE', // All new assets start as AVAILABLE
      },
      select: this.defaultSelect,
    });
  }

  async updateQrCode(id: string, qrUrl: string): Promise<void> {
    await this.prisma.asset.update({
      where: { id },
      data: { qrCode: qrUrl },
    });
  }

  async findManyAndCount(filters: AssetQueryFilters): Promise<{ assets: Partial<Asset>[]; total: number }> {
    const page = Number(filters.page) || 1;
    const limit = Number(filters.limit) || 10;
    const skip = (page - 1) * limit;

    const whereClause: Prisma.AssetWhereInput = { deletedAt: null };

    // Search Engine (Asset Tag, Serial Number, Name, Vendor, Location)
    if (filters.search) {
      whereClause.OR = [
        { assetTag: { contains: filters.search, mode: 'insensitive' } },
        { serialNumber: { contains: filters.search, mode: 'insensitive' } },
        { name: { contains: filters.search, mode: 'insensitive' } },
        { location: { contains: filters.search, mode: 'insensitive' } },
        { vendor: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    // Exact Match Filters
    if (filters.departmentId) whereClause.departmentId = filters.departmentId;
    if (filters.categoryId) whereClause.categoryId = filters.categoryId;
    if (filters.status) whereClause.status = filters.status;
    if (filters.condition) whereClause.condition = filters.condition;

    // Date Range Filters
    if (filters.purchaseDateStart || filters.purchaseDateEnd) {
      whereClause.purchaseDate = {};
      if (filters.purchaseDateStart) whereClause.purchaseDate.gte = new Date(filters.purchaseDateStart);
      if (filters.purchaseDateEnd) whereClause.purchaseDate.lte = new Date(filters.purchaseDateEnd);
    }

    const sortBy = filters.sortBy || 'createdAt';
    const sortOrder = filters.sortOrder || 'desc';

    const [assets, total] = await this.prisma.$transaction([
      this.prisma.asset.findMany({
        where: whereClause,
        select: this.defaultSelect,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
      }),
      this.prisma.asset.count({ where: whereClause }),
    ]);

    return { assets, total };
  }

  async update(id: string, data: UpdateAssetInput): Promise<Partial<Asset>> {
    return this.prisma.asset.update({
      where: { id },
      data,
      select: this.defaultSelect,
    });
  }

  async softDelete(id: string): Promise<void> {
    await this.prisma.asset.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}