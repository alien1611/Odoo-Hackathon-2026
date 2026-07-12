import { PrismaClient, Booking, BookingStatus } from '@prisma/client';

export interface BookingQueryFilters {
  page?: number;
  limit?: number;
  resourceId?: string;
  resourceType?: string;
  bookedBy?: string;
  status?: BookingStatus;
  startDate?: string;
  endDate?: string;
}

export class BookingRepository {
  constructor(private prisma: PrismaClient) {}

  async create(data: {
    resourceId: string;
    resourceType: string;
    bookedBy: string;
    startTime: Date;
    endTime: Date;
    purpose: string;
  }): Promise<Booking> {
    return this.prisma.booking.create({
      data: {
        resourceId: data.resourceId,
        resourceType: data.resourceType,
        bookedBy: data.bookedBy,
        startTime: data.startTime,
        endTime: data.endTime,
        purpose: data.purpose,
        status: 'PENDING', // All new bookings start as PENDING
      },
    });
  }

  async findById(id: string): Promise<Booking | null> {
    return this.prisma.booking.findUnique({
      where: { id },
    });
  }

  async findOverlappingBookings(
    resourceId: string,
    startTime: Date,
    endTime: Date,
    excludeBookingId?: string
  ): Promise<Booking[]> {
    const whereClause: any = {
      resourceId,
      status: {
        notIn: ['REJECTED', 'CANCELLED'] as BookingStatus[],
      },
      startTime: {
        lt: endTime,
      },
      endTime: {
        gt: startTime,
      },
    };

    if (excludeBookingId) {
      whereClause.id = {
        not: excludeBookingId,
      };
    }

    return this.prisma.booking.findMany({
      where: whereClause,
    });
  }

  async update(id: string, data: {
    startTime?: Date;
    endTime?: Date;
    purpose?: string;
    status?: BookingStatus;
  }): Promise<Booking> {
    return this.prisma.booking.update({
      where: { id },
      data,
    });
  }

  async findManyAndCount(filters: BookingQueryFilters): Promise<{ bookings: any[]; total: number }> {
    const page = Number(filters.page) || 1;
    const limit = Number(filters.limit) || 10;
    const skip = (page - 1) * limit;

    const whereClause: any = {};

    if (filters.resourceId) whereClause.resourceId = filters.resourceId;
    if (filters.resourceType) whereClause.resourceType = filters.resourceType;
    if (filters.bookedBy) whereClause.bookedBy = filters.bookedBy;
    if (filters.status) whereClause.status = filters.status;

    if (filters.startDate || filters.endDate) {
      whereClause.startTime = {};
      if (filters.startDate) whereClause.startTime.gte = new Date(filters.startDate);
      if (filters.endDate) whereClause.startTime.lte = new Date(filters.endDate);
    }

    const [bookings, total] = await this.prisma.$transaction([
      this.prisma.booking.findMany({
        where: whereClause,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
            },
          },
        },
        orderBy: { startTime: 'asc' },
        skip,
        take: limit,
      }),
      this.prisma.booking.count({ where: whereClause }),
    ]);

    return { bookings, total };
  }
}
