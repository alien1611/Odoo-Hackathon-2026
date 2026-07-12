import { AuditRepository, AuditCycleFilters } from './repository';
import { AssetRepository } from '../assets/repository';
import { AssetHistoryRepository } from '../history/repository';
import { ApiError } from '../../utils/ApiError';
import { AuditStatus, VerificationStatus } from '@prisma/client';

export class AuditService {
  constructor(
    private auditRepository: AuditRepository,
    private assetRepository: AssetRepository,
    private historyRepository: AssetHistoryRepository
  ) {}

  async createCycle(data: {
    name: string;
    scope: string;
    startDate: Date;
    endDate: Date;
    createdBy: string;
  }) {
    return this.auditRepository.createCycle(data);
  }

  async updateCycle(id: string, data: {
    name?: string;
    scope?: string;
    startDate?: Date;
    endDate?: Date;
    status?: AuditStatus;
  }) {
    const cycle = await this.auditRepository.findCycleById(id);
    if (!cycle) {
      throw new ApiError(404, `Not Found: Audit Cycle with ID '${id}' does not exist.`);
    }

    if (cycle.status === 'CLOSED' && data.status) {
      throw new ApiError(400, 'Bad Request: Audit cycle is already closed and cannot be modified.');
    }

    return this.auditRepository.updateCycle(id, data);
  }

  async verifyAsset(cycleId: string, verifierId: string, data: {
    assetId: string;
    verificationStatus: VerificationStatus;
    remarks?: string;
  }) {
    // 1. Fetch audit cycle
    const cycle = await this.auditRepository.findCycleById(cycleId);
    if (!cycle) {
      throw new ApiError(404, `Not Found: Audit Cycle with ID '${cycleId}' does not exist.`);
    }

    // Business Rule: Audit cycle must not be closed/completed
    if (cycle.status === 'CLOSED' || cycle.status === 'COMPLETED') {
      throw new ApiError(400, `Bad Request: Audit verification failed. Audit cycle status is '${cycle.status}'.`);
    }

    // 2. Fetch asset details
    const asset = await this.assetRepository.findById(data.assetId);
    if (!asset) {
      throw new ApiError(404, `Not Found: Asset with ID '${data.assetId}' does not exist.`);
    }

    // 3. Create or Update verification record
    const record = await this.auditRepository.upsertRecord({
      auditCycleId: cycleId,
      assetId: data.assetId,
      verifiedBy: verifierId,
      verificationStatus: data.verificationStatus,
      remarks: data.remarks,
    });

    // 4. Update asset status & condition based on findings
    if (data.verificationStatus === 'DAMAGED') {
      await this.assetRepository.update(data.assetId, { condition: 'DAMAGED' });
      await this.historyRepository.create({
        assetId: data.assetId,
        action: 'AUDIT_DAMAGED',
        performedBy: verifierId,
        description: `Audit cycle '${cycle.name}' flagged asset as DAMAGED. Remarks: ${data.remarks || 'None'}`,
      });
    } else if (data.verificationStatus === 'MISSING') {
      await this.assetRepository.update(data.assetId, { status: 'LOST' });
      await this.historyRepository.create({
        assetId: data.assetId,
        action: 'AUDIT_MISSING',
        performedBy: verifierId,
        description: `Audit cycle '${cycle.name}' flagged asset as MISSING. Status updated to LOST.`,
      });
    } else if (data.verificationStatus === 'VERIFIED') {
      // If it was previously marked lost/missing or damaged, we could restore it
      const updates: any = {};
      if (asset.status === 'LOST') {
        updates.status = 'AVAILABLE';
      }
      
      if (Object.keys(updates).length > 0) {
        await this.assetRepository.update(data.assetId, updates);
      }

      await this.historyRepository.create({
        assetId: data.assetId,
        action: 'AUDIT_VERIFIED',
        performedBy: verifierId,
        description: `Audit cycle '${cycle.name}' verified asset successfully. Remarks: ${data.remarks || 'None'}`,
      });
    }

    return record;
  }

  async getDiscrepancyReport(cycleId: string) {
    const cycle = await this.auditRepository.findCycleById(cycleId);
    if (!cycle) {
      throw new ApiError(404, `Not Found: Audit Cycle with ID '${cycleId}' does not exist.`);
    }

    const records = await this.auditRepository.findRecordsByCycleId(cycleId);

    const missingCount = records.filter(r => r.verificationStatus === 'MISSING').length;
    const damagedCount = records.filter(r => r.verificationStatus === 'DAMAGED').length;
    const verifiedCount = records.filter(r => r.verificationStatus === 'VERIFIED').length;

    return {
      cycle,
      summary: {
        totalVerified: records.length,
        missingCount,
        damagedCount,
        verifiedCount,
      },
      records,
    };
  }

  async getCycles(filters: AuditCycleFilters) {
    return this.auditRepository.findManyCycles(filters);
  }

  async getCycleById(id: string) {
    const cycle = await this.auditRepository.findCycleById(id);
    if (!cycle) {
      throw new ApiError(404, `Not Found: Audit Cycle with ID '${id}' does not exist.`);
    }
    return cycle;
  }
}
