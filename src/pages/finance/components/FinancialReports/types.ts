import type { IIncomeStatement, ICashFlow } from '../../../../services/financial/types';

export interface IFinancialReportsProps {
  incomeStatement: IIncomeStatement | null;
  cashFlow: ICashFlow | null;
  loading: boolean;
  startDate: string;
  endDate: string;
  onDateChange: (startDate: string, endDate: string) => void;
  onGenerateReports: () => Promise<void>;
}
