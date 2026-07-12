import { z } from 'zod';
import { AuditStatus, VerificationStatus } from '@prisma/client';

export const createCycleSchema = z.object({
  body: z.object({
    name: z.string({ required_error: 'Audit cycle name is required' }).min(3).max(255),
    scope: z.string({ required_error: 'Audit scope description is required' }).min(5),
    startDate: z.string({ required_error: 'Start date is required' }).transform((val) => new Date(val)),
    endDate: z.string({ required_error: 'End date is required' }).transform((val) => new Date(val)),
  }).refine((data) => {
    return data.endDate > data.startDate;
  }, {
    message: 'End date must be chronologically after the start date.',
    path: ['endDate'],
  }),
});

export const updateCycleSchema = z.object({
  body: z.object({
    name: z.string().min(3).max(255).optional(),
    scope: z.string().min(5).optional(),
    startDate: z.string().transform((val) => new Date(val)).optional(),
    endDate: z.string().transform((val) => new Date(val)).optional(),
    status: z.nativeEnum(AuditStatus).optional(),
  }).refine((data) => {
    if (data.startDate && data.endDate) {
      return data.endDate > data.startDate;
    }
    return true;
  }, {
    message: 'End date must be chronologically after the start date.',
    path: ['endDate'],
  }),
});

export const verifyAssetSchema = z.object({
  body: z.object({
    assetId: z.string({ required_error: 'Asset ID is required' }).uuid(),
    verificationStatus: z.nativeEnum(VerificationStatus, { required_error: 'Verification status is required' }),
    remarks: z.string().optional(),
  }),
});
