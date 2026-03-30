import { useState, useEffect } from 'react';
import * as financialService from '../../../services/financial/financialService';
import type { IOperatingExpenseResponse, IDateRangeParams } from '../../../services/financial/types';

export interface IUseOperatingExpensesLogic {
  expenses: IOperatingExpenseResponse[];
  loading: boolean;
  error: string | null;
  fetchExpenses: (params?: IDateRangeParams) => Promise<void>;
  addExpense: (data: any) => Promise<void>;
  updateExpense: (id: string, data: any) => Promise<void>;
  deleteExpense: (id: string) => Promise<void>;
}

export const useOperatingExpensesLogic = (): IUseOperatingExpensesLogic => {
  const [expenses, setExpenses] = useState<IOperatingExpenseResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchExpenses = async (params?: IDateRangeParams) => {
    try {
      setLoading(true);
      setError(null);
      const data = await financialService.getOperatingExpenses(params);
      setExpenses(data);
    } catch (err: any) {
      setError(err?.message || 'Error fetching operating expenses');
    } finally {
      setLoading(false);
    }
  };

  const addExpense = async (data: any) => {
    try {
      await financialService.createOperatingExpense(data);
      await fetchExpenses();
    } catch (err: any) {
      setError(err?.message || 'Error creating operating expense');
      throw err;
    }
  };

  const updateExpense = async (id: string, data: any) => {
    try {
      await financialService.updateOperatingExpense(id, data);
      await fetchExpenses();
    } catch (err: any) {
      setError(err?.message || 'Error updating operating expense');
      throw err;
    }
  };

  const deleteExpense = async (id: string) => {
    try {
      await financialService.deleteOperatingExpense(id);
      await fetchExpenses();
    } catch (err: any) {
      setError(err?.message || 'Error deleting operating expense');
      throw err;
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, []);

  return {
    expenses,
    loading,
    error,
    fetchExpenses,
    addExpense,
    updateExpense,
    deleteExpense,
  };
};
