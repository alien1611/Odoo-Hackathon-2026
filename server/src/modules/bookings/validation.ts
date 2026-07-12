import { z } from 'zod';
import { BookingStatus } from '@prisma/client';

const validResourceTypes = ['Meeting Room', 'Conference Hall', 'Projector', 'Vehicle', 'Shared Device'];

export const createBookingSchema = z.object({
  body: z.object({
    resourceId: z.string({ required_error: 'Resource ID is required' }).uuid(),
    resourceType: z.string({ required_error: 'Resource type is required' }).refine((val) => validResourceTypes.includes(val), {
      message: `Resource type must be one of: ${validResourceTypes.join(', ')}`,
    }),
    startTime: z.string({ required_error: 'Start time is required' }).transform((val) => new Date(val)),
    endTime: z.string({ required_error: 'End time is required' }).transform((val) => new Date(val)),
    purpose: z.string({ required_error: 'Purpose is required' }).min(3).max(500),
  }).refine((data) => {
    return data.endTime > data.startTime && data.startTime >= new Date(Date.now() - 60000); // Allow slight clock drift
  }, {
    message: 'End time must be after start time, and start time must be in the future.',
    path: ['endTime'],
  }),
});

export const updateBookingSchema = z.object({
  body: z.object({
    startTime: z.string().transform((val) => new Date(val)).optional(),
    endTime: z.string().transform((val) => new Date(val)).optional(),
    purpose: z.string().min(3).max(500).optional(),
    status: z.nativeEnum(BookingStatus).optional(),
  }).refine((data) => {
    if (data.startTime && data.endTime) {
      return data.endTime > data.startTime;
    }
    return true;
  }, {
    message: 'End time must be after start time.',
    path: ['endTime'],
  }),
});
