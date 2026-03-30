import { useState } from 'react';
import * as financialService from '../../../services/financial/financialService';
import type { IIncomeStatement, ICashFlow, IDateRangeParams } from '../../../services/financial/types';

export interface IUseFinancialReportsLogic {
  incomeStatement: IIncomeStatement | null;
  cashFlow: ICashFlow | null;
  loading: boolean;
  error: string | null;
  generateReports: (params?: IDateRangeParams) => Promise<void>;
}

export const useFinancialReportsLogic = (): IUseFinancialReportsLogic => {
  const [incomeStatement, setIncomeStatement] = useState<IIncomeStatement | null>(null);
  const [cashFlow, setCashFlow] = useState<ICashFlow | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateReports = async (params?: IDateRangeParams) => {
    try {
      setLoading(true);
      setError(null);

      const [statement, flow] = await Promise.all([
        financialService.getIncomeStatement(params),
        financialService.getCashFlow(params),
      ]);

      setIncomeStatement(statement);
      setCashFlow(flow);
    } catch (err: any) {
      setError(err?.message || 'Error generating financial reports');
    } finally {
      setLoading(false);
    }
  };

  return {
    incomeStatement,
    cashFlow,
    loading,
    error,
    generateReports,
  };
};
