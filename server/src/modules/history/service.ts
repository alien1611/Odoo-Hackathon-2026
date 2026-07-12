import { AssetHistoryRepository } from './repository';

export class AssetHistoryService {
  constructor(private historyRepository: AssetHistoryRepository) {}

  async logEvent(data: {
    assetId: string;
    action: string;
    performedBy: string;
    description: string;
  }) {
    return this.historyRepository.create(data);
  }

  async getHistoryByAsset(assetId: string, page?: number, limit?: number) {
    const p = page || 1;
    const l = limit || 10;
    return this.historyRepository.findByAssetId(assetId, p, l);
  }
}
