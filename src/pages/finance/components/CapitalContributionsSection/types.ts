import type { ICapitalContributionResponse } from '../../../../services/financial/types';

export interface ICapitalContributionsSectionProps {
  contributions: ICapitalContributionResponse[];
  loading: boolean;
  onRefresh: () => Promise<void>;
  onAdd: (data: any) => Promise<void>;
  onUpdate: (id: string, data: any) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}
