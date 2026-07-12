import { AssetStatus } from '@prisma/client';

export interface AssetQueryFilters {
  page?: number;
  limit?: number;
  search?: string;
  departmentId?: string;
  categoryId?: string;
  status?: AssetStatus;
  condition?: string;
  purchaseDateStart?: string;
  purchaseDateEnd?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface CreateAssetInput {
  assetTag: string;
  serialNumber: string;
  name: string;
  description?: string;
  categoryId: string;
  departmentId: string;
  purchaseDate: Date;
  purchaseCost: number;
  vendor: string;
  warrantyExpiry?: Date;
  location: string;
  condition: string;
  image?: string;
}

export interface UpdateAssetInput {
  name?: string;
  description?: string;
  categoryId?: string;
  departmentId?: string;
  purchaseDate?: Date;
  purchaseCost?: number;
  vendor?: string;
  warrantyExpiry?: Date;
  location?: string;
  condition?: string;
  image?: string;
}