import { z } from 'zod';

export const allocateAssetSchema = z.object({
  body: z.object({
    assetId: z.string({ required_error: 'Asset ID is required' }).uuid(),
    employeeId: z.string({ required_error: 'Employee ID is required' }).uuid(),
    expectedReturnDate: z.string({ required_error: 'Expected Return Date is required' }).transform((val) => new Date(val)),
    remarks: z.string().optional(),
  }).refine((data) => {
    return data.expectedReturnDate > new Date();
  }, {
    message: 'Expected return date must be in the future.',
    path: ['expectedReturnDate'],
  }),
});

export const returnAssetSchema = z.object({
  body: z.object({
    assetId: z.string({ required_error: 'Asset ID is required' }).uuid(),
    condition: z.string({ required_error: 'Asset condition after return is required' }).min(2).max(50),
    remarks: z.string().optional(),
  }),
});
