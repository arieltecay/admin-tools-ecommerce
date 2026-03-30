import type { IOperatingExpenseResponse } from '../../../../services/financial/types';

export interface IOperatingExpensesSectionProps {
  expenses: IOperatingExpenseResponse[];
  loading: boolean;
  onRefresh: () => Promise<void>;
  onAdd: (data: any) => Promise<void>;
  onUpdate: (id: string, data: any) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}
