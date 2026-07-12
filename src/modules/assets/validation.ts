import { z } from 'zod';

export const createAssetSchema = z.object({
  body: z.object({
    assetTag: z.string({ required_error: 'Asset Tag is required' }).min(3).max(100),
    serialNumber: z.string({ required_error: 'Serial Number is required' }).min(3).max(255),
    name: z.string({ required_error: 'Asset Name is required' }).min(2).max(255),
    description: z.string().optional(),
    categoryId: z.string({ required_error: 'Category ID must be a valid UUID' }).uuid(),
    departmentId: z.string({ required_error: 'Department ID must be a valid UUID' }).uuid(),
    purchaseDate: z.string({ required_error: 'Purchase Date is required' }).transform((val) => new Date(val)),
    purchaseCost: z.number({ required_error: 'Purchase Cost must be a positive number' }).positive(),
    vendor: z.string({ required_error: 'Vendor designation is required' }).min(2).max(150),
    warrantyExpiry: z.string().optional().transform((val) => (val ? new Date(val) : undefined)),
    location: z.string({ required_error: 'Physical location tracking string is required' }).min(2).max(255),
    condition: z.string({ required_error: 'Condition assessment is required' }).min(2).max(50),
    image: z.string().url().optional(),
  }).refine((data) => {
    if (data.warrantyExpiry && data.warrantyExpiry <= data.purchaseDate) {
      return false;
    }
    return true;
  }, {
    message: 'Warranty expiration date must be chronologically after the purchase date.',
    path: ['warrantyExpiry'],
  }),
});

export const updateAssetSchema = z.object({
  body: z.object({
    name: z.string().min(2).max(255).optional(),
    description: z.string().optional(),
    categoryId: z.string().uuid().optional(),
    departmentId: z.string().uuid().optional(),
    purchaseDate: z.string().transform((val) => new Date(val)).optional(),
    purchaseCost: z.number().positive().optional(),
    vendor: z.string().min(2).max(150).optional(),
    warrantyExpiry: z.string().transform((val) => new Date(val)).optional(),
    location: z.string().min(2).max(255).optional(),
    condition: z.string().min(2).max(50).optional(),
    image: z.string().url().optional(),
  }),
});