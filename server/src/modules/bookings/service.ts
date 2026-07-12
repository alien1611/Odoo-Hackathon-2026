import { BookingRepository, BookingQueryFilters } from './repository';
import { ApiError } from '../../utils/ApiError';
import { BookingStatus } from '@prisma/client';

export class BookingService {
  constructor(private bookingRepository: BookingRepository) {}

  async createBooking(data: {
    resourceId: string;
    resourceType: string;
    bookedBy: string;
    startTime: Date;
    endTime: Date;
    purpose: string;
  }) {
    // 1. Conflict detection rule: Search existing bookings for conflicts
    const overlaps = await this.bookingRepository.findOverlappingBookings(
      data.resourceId,
      data.startTime,
      data.endTime
    );

    if (overlaps.length > 0) {
      throw new ApiError(409, 'Conflict: Booking conflict detected. Resource is already booked for this timeframe.');
    }

    // 2. Create the booking
    return this.bookingRepository.create(data);
  }

  async updateBooking(id: string, userId: string, userRole: string, data: {
    startTime?: Date;
    endTime?: Date;
    purpose?: string;
    status?: BookingStatus;
  }) {
    // 1. Fetch existing booking
    const booking = await this.bookingRepository.findById(id);
    if (!booking) {
      throw new ApiError(404, `Not Found: Booking with ID '${id}' does not exist.`);
    }

    // 2. Authorization check (only owner can modify details, admins/managers can update any status)
    const isOwner = booking.bookedBy === userId;
    const isPrivileged = ['ADMIN', 'ASSET_MANAGER', 'DEPARTMENT_HEAD'].includes(userRole);

    if (!isOwner && !isPrivileged) {
      throw new ApiError(403, 'Forbidden: You do not have permission to modify this booking.');
    }

    // 3. Timeframe conflict check if changing times
    const start = data.startTime || booking.startTime;
    const end = data.endTime || booking.endTime;

    if (data.startTime || data.endTime) {
      const overlaps = await this.bookingRepository.findOverlappingBookings(
        booking.resourceId,
        start,
        end,
        id
      );

      if (overlaps.length > 0) {
        throw new ApiError(409, 'Conflict: Booking conflict detected. Selected timeframe is unavailable.');
      }
    }

    // 4. Update the booking
    return this.bookingRepository.update(id, data);
  }

  async cancelBooking(id: string, userId: string, userRole: string) {
    const booking = await this.bookingRepository.findById(id);
    if (!booking) {
      throw new ApiError(404, `Not Found: Booking with ID '${id}' does not exist.`);
    }

    const isOwner = booking.bookedBy === userId;
    const isPrivileged = ['ADMIN', 'ASSET_MANAGER', 'DEPARTMENT_HEAD'].includes(userRole);

    if (!isOwner && !isPrivileged) {
      throw new ApiError(403, 'Forbidden: You do not have permission to cancel this booking.');
    }

    return this.bookingRepository.update(id, { status: 'CANCELLED' });
  }

  async approveBooking(id: string, status: BookingStatus) {
    if (status !== 'APPROVED' && status !== 'REJECTED') {
      throw new ApiError(400, 'Bad Request: Status must be APPROVED or REJECTED for this action.');
    }

    const booking = await this.bookingRepository.findById(id);
    if (!booking) {
      throw new ApiError(404, `Not Found: Booking with ID '${id}' does not exist.`);
    }

    // If approving, do a final overlap check
    if (status === 'APPROVED') {
      const overlaps = await this.bookingRepository.findOverlappingBookings(
        booking.resourceId,
        booking.startTime,
        booking.endTime,
        id
      );

      // Check if any of the overlapping bookings is already APPROVED
      const approvedOverlaps = overlaps.filter(o => o.status === 'APPROVED');
      if (approvedOverlaps.length > 0) {
        throw new ApiError(409, 'Conflict: Cannot approve. An overlapping booking is already approved.');
      }
    }

    return this.bookingRepository.update(id, { status });
  }

  async getBookings(filters: BookingQueryFilters) {
    return this.bookingRepository.findManyAndCount(filters);
  }
}
