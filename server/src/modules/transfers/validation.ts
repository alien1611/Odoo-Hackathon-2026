import { z } from 'zod';
import { TransferStatus } from '@prisma/client';

export const createTransferSchema = z.object({
  body: z.object({
    assetId: z.string({ required_error: 'Asset ID is required' }).uuid(),
    toDepartment: z.string({ required_error: 'Target Department ID is required' }).uuid(),
    reason: z.string({ required_error: 'Transfer reason is required' }).min(5).max(500),
  }),
});

export const approveTransferSchema = z.object({
  body: z.object({
    status: z.nativeEnum(TransferStatus, { required_error: 'Approval status must be APPROVED or REJECTED' }),
  }),
});
