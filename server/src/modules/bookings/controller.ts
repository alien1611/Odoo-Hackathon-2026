import { Request, Response, NextFunction } from 'express';
import { BookingService } from './service';

export class BookingController {
  constructor(private bookingService: BookingService) {}

  createBooking = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const user = (req as any).user;
      const { resourceId, resourceType, startTime, endTime, purpose } = req.body;

      const result = await this.bookingService.createBooking({
        resourceId,
        resourceType,
        bookedBy: user.id,
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        purpose,
      });

      res.status(201).json({
        success: true,
        message: 'Resource booking request submitted successfully.',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  getAllBookings = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const filters = {
        page: req.query.page ? Number(req.query.page) : undefined,
        limit: req.query.limit ? Number(req.query.limit) : undefined,
        resourceId: req.query.resourceId as string,
        resourceType: req.query.resourceType as string,
        bookedBy: req.query.bookedBy as string,
        status: req.query.status as any,
        startDate: req.query.startDate as string,
        endDate: req.query.endDate as string,
      };

      const result = await this.bookingService.getBookings(filters);

      res.status(200).json({
        success: true,
        message: 'Bookings retrieved successfully.',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  updateBooking = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const user = (req as any).user;
      const { id } = req.params;
      const { startTime, endTime, purpose, status } = req.body;

      // If status is being updated by a non-privileged user, require approval endpoint behavior
      let result;
      if (status && (status === 'APPROVED' || status === 'REJECTED')) {
        // Only Admins, Asset Managers or Department Heads can approve/reject
        if (!['ADMIN', 'ASSET_MANAGER', 'DEPARTMENT_HEAD'].includes(user.role)) {
          res.status(403).json({
            success: false,
            message: 'Forbidden: You do not have permission to approve/reject bookings.',
            error: {},
          });
          return;
        }
        result = await this.bookingService.approveBooking(id, status);
      } else {
        result = await this.bookingService.updateBooking(id, user.id, user.role, {
          startTime: startTime ? new Date(startTime) : undefined,
          endTime: endTime ? new Date(endTime) : undefined,
          purpose,
          status, // Allow user to cancel or complete
        });
      }

      res.status(200).json({
        success: true,
        message: 'Booking successfully updated.',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  deleteBooking = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const user = (req as any).user;
      const { id } = req.params;

      await this.bookingService.cancelBooking(id, user.id, user.role);

      res.status(200).json({
        success: true,
        message: 'Booking successfully cancelled.',
        data: {},
      });
    } catch (error) {
      next(error);
    }
  };
}
