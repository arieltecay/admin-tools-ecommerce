import { useState, useEffect } from 'react';
import * as financialService from '../../../services/financial/financialService';
import type { ICapitalContributionResponse, IDateRangeParams } from '../../../services/financial/types';

export interface IUseCapitalContributionsLogic {
  contributions: ICapitalContributionResponse[];
  loading: boolean;
  error: string | null;
  fetchContributions: (params?: IDateRangeParams) => Promise<void>;
  addContribution: (data: any) => Promise<void>;
  updateContribution: (id: string, data: any) => Promise<void>;
  deleteContribution: (id: string) => Promise<void>;
}

export const useCapitalContributionsLogic = (): IUseCapitalContributionsLogic => {
  const [contributions, setContributions] = useState<ICapitalContributionResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchContributions = async (params?: IDateRangeParams) => {
    try {
      setLoading(true);
      setError(null);
      const data = await financialService.getCapitalContributions(params);
      setContributions(data);
    } catch (err: any) {
      setError(err?.message || 'Error fetching capital contributions');
    } finally {
      setLoading(false);
    }
  };

  const addContribution = async (data: any) => {
    try {
      await financialService.createCapitalContribution(data);
      await fetchContributions();
    } catch (err: any) {
      setError(err?.message || 'Error creating capital contribution');
      throw err;
    }
  };

  const updateContribution = async (id: string, data: any) => {
    try {
      await financialService.updateCapitalContribution(id, data);
      await fetchContributions();
    } catch (err: any) {
      setError(err?.message || 'Error updating capital contribution');
      throw err;
    }
  };

  const deleteContribution = async (id: string) => {
    try {
      await financialService.deleteCapitalContribution(id);
      await fetchContributions();
    } catch (err: any) {
      setError(err?.message || 'Error deleting capital contribution');
      throw err;
    }
  };

  useEffect(() => {
    fetchContributions();
  }, []);

  return {
    contributions,
    loading,
    error,
    fetchContributions,
    addContribution,
    updateContribution,
    deleteContribution,
  };
};
