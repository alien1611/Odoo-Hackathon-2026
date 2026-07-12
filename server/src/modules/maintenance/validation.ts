import { z } from 'zod';
import { Priority, MaintenanceStatus } from '@prisma/client';

export const createMaintenanceSchema = z.object({
  body: z.object({
    assetId: z.string({ required_error: 'Asset ID is required' }).uuid(),
    issueTitle: z.string({ required_error: 'Issue title is required' }).min(3).max(255),
    description: z.string({ required_error: 'Issue description is required' }).min(5),
    priority: z.nativeEnum(Priority).default('MEDIUM'),
  }),
});

export const updateMaintenanceSchema = z.object({
  body: z.object({
    assignedTo: z.string().uuid().nullable().optional(),
    status: z.nativeEnum(MaintenanceStatus).optional(),
    approvalStatus: z.enum(['PENDING', 'APPROVED', 'REJECTED']).optional(),
    priority: z.nativeEnum(Priority).optional(),
  }),
});
