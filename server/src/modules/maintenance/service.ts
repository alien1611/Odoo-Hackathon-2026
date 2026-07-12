import { MaintenanceRepository, MaintenanceQueryFilters } from './repository';
import { AssetRepository } from '../assets/repository';
import { AssetHistoryRepository } from '../history/repository';
import { ApiError } from '../../utils/ApiError';
import { MaintenanceStatus, Priority } from '@prisma/client';

export class MaintenanceService {
  constructor(
    private maintenanceRepository: MaintenanceRepository,
    private assetRepository: AssetRepository,
    private historyRepository: AssetHistoryRepository
  ) {}

  async createRequest(data: {
    assetId: string;
    reportedBy: string;
    issueTitle: string;
    description: string;
    priority: Priority;
  }) {
    // 1. Fetch asset details
    const asset = await this.assetRepository.findById(data.assetId);
    if (!asset) {
      throw new ApiError(404, `Not Found: Asset with ID '${data.assetId}' does not exist.`);
    }

    // 2. Business Rules
    // Disposed assets cannot raise maintenance. Lost assets cannot raise maintenance.
    // Rule: "Only Allocated Assets can raise maintenance."
    if (asset.status !== 'ALLOCATED') {
      throw new ApiError(400, `Bad Request: Maintenance can only be raised for ALLOCATED assets. Asset is currently '${asset.status}'.`);
    }

    // 3. Create request
    const request = await this.maintenanceRepository.create(data);

    // 4. Log event to Asset History
    await this.historyRepository.create({
      assetId: data.assetId,
      action: 'MAINTENANCE_REQUESTED',
      performedBy: data.reportedBy,
      description: `Maintenance requested: "${data.issueTitle}" (Priority: ${data.priority}).`,
    });

    return request;
  }

  async updateRequest(id: string, userId: string, data: {
    assignedTo?: string | null;
    status?: MaintenanceStatus;
    approvalStatus?: string;
    priority?: Priority;
  }) {
    // 1. Fetch request details
    const request = await this.maintenanceRepository.findById(id);
    if (!request) {
      throw new ApiError(404, `Not Found: Maintenance request with ID '${id}' does not exist.`);
    }

    const updatePayload: any = { ...data };

    // 2. Business Rule: Transition Status and update Asset Status where appropriate
    if (data.approvalStatus) {
      if (data.approvalStatus === 'APPROVED') {
        updatePayload.status = 'APPROVED';
      } else if (data.approvalStatus === 'REJECTED') {
        updatePayload.status = 'REJECTED';
      }
    }

    if (data.assignedTo) {
      updatePayload.status = 'ASSIGNED';
    }

    // Perform database update
    const updatedRequest = await this.maintenanceRepository.update(id, updatePayload);

    // 3. Trigger Asset status changes based on maintenance stage
    if (data.status) {
      if (data.status === 'IN_PROGRESS') {
        // Change asset status to UNDER_MAINTENANCE
        await this.assetRepository.update(request.assetId, {
          status: 'UNDER_MAINTENANCE',
        });

        await this.historyRepository.create({
          assetId: request.assetId,
          action: 'UNDER_MAINTENANCE',
          performedBy: userId,
          description: 'Asset status changed to UNDER_MAINTENANCE as repair has commenced.',
        });
      } else if (data.status === 'RESOLVED') {
        // Change asset status back to AVAILABLE
        await this.assetRepository.update(request.assetId, {
          status: 'AVAILABLE',
        });

        await this.historyRepository.create({
          assetId: request.assetId,
          action: 'MAINTENANCE_RESOLVED',
          performedBy: userId,
          description: 'Asset repaired and returned to AVAILABLE status.',
        });
      }
    }

    // Log general updates
    if (data.assignedTo) {
      await this.historyRepository.create({
        assetId: request.assetId,
        action: 'MAINTENANCE_ASSIGNED',
        performedBy: userId,
        description: `Maintenance request assigned to technician ID '${data.assignedTo}'.`,
      });
    }

    return updatedRequest;
  }

  async getRequests(filters: MaintenanceQueryFilters) {
    return this.maintenanceRepository.findManyAndCount(filters);
  }

  async getRequestById(id: string) {
    const request = await this.maintenanceRepository.findById(id);
    if (!request) {
      throw new ApiError(404, `Not Found: Maintenance request with ID '${id}' does not exist.`);
    }
    return request;
  }
}
