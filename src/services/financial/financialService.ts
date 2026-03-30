import api from '../api';
import type {
  IOperatingExpenseResponse,
  ICapitalContributionResponse,
  IIncomeStatement,
  ICashFlow,
  ICreateOperatingExpenseRequest,
  ICreateCapitalContributionRequest,
  IDateRangeParams,
} from './types';

/**
 * Obtiene todos los gastos operativos
 */
export const getOperatingExpenses = async (
  params?: IDateRangeParams
): Promise<IOperatingExpenseResponse[]> => {
  try {
    const response = await api.get<any>('/financial/operating-expenses', { params });
    return response.data?.expenses || [];
  } catch (error) {
    console.error('Error fetching operating expenses:', error);
    throw error;
  }
};

/**
 * Crea un nuevo gasto operativo
 */
export const createOperatingExpense = async (
  data: ICreateOperatingExpenseRequest
): Promise<IOperatingExpenseResponse> => {
  try {
    const response = await api.post<any>('/financial/operating-expenses', data);
    return response.data?.expense;
  } catch (error) {
    console.error('Error creating operating expense:', error);
    throw error;
  }
};

/**
 * Actualiza un gasto operativo
 */
export const updateOperatingExpense = async (
  id: string,
  data: Partial<ICreateOperatingExpenseRequest>
): Promise<IOperatingExpenseResponse> => {
  try {
    const response = await api.put<any>(`/financial/operating-expenses/${id}`, data);
    return response.data?.expense;
  } catch (error) {
    console.error('Error updating operating expense:', error);
    throw error;
  }
};

/**
 * Elimina un gasto operativo
 */
export const deleteOperatingExpense = async (id: string): Promise<void> => {
  try {
    await api.delete(`/financial/operating-expenses/${id}`);
  } catch (error) {
    console.error('Error deleting operating expense:', error);
    throw error;
  }
};

/**
 * Obtiene todos los aportes de capital
 */
export const getCapitalContributions = async (
  params?: IDateRangeParams
): Promise<ICapitalContributionResponse[]> => {
  try {
    const response = await api.get<any>('/financial/capital-contributions', { params });
    return response.data?.contributions || [];
  } catch (error) {
    console.error('Error fetching capital contributions:', error);
    throw error;
  }
};

/**
 * Crea un nuevo aporte de capital
 */
export const createCapitalContribution = async (
  data: ICreateCapitalContributionRequest
): Promise<ICapitalContributionResponse> => {
  try {
    const response = await api.post<any>('/financial/capital-contributions', data);
    return response.data?.contribution;
  } catch (error) {
    console.error('Error creating capital contribution:', error);
    throw error;
  }
};

/**
 * Actualiza un aporte de capital
 */
export const updateCapitalContribution = async (
  id: string,
  data: Partial<ICreateCapitalContributionRequest>
): Promise<ICapitalContributionResponse> => {
  try {
    const response = await api.put<any>(`/financial/capital-contributions/${id}`, data);
    return response.data?.contribution;
  } catch (error) {
    console.error('Error updating capital contribution:', error);
    throw error;
  }
};

/**
 * Elimina un aporte de capital
 */
export const deleteCapitalContribution = async (id: string): Promise<void> => {
  try {
    await api.delete(`/financial/capital-contributions/${id}`);
  } catch (error) {
    console.error('Error deleting capital contribution:', error);
    throw error;
  }
};

/**
 * Obtiene el Estado de Resultados
 */
export const getIncomeStatement = async (params?: IDateRangeParams): Promise<IIncomeStatement> => {
  try {
    const response = await api.get<any>('/financial/reports/income-statement', { params });
    return response.data?.report;
  } catch (error) {
    console.error('Error fetching income statement:', error);
    throw error;
  }
};

/**
 * Obtiene el Flujo de Caja
 */
export const getCashFlow = async (params?: IDateRangeParams): Promise<ICashFlow> => {
  try {
    const response = await api.get<any>('/financial/reports/cash-flow', { params });
    return response.data?.report;
  } catch (error) {
    console.error('Error fetching cash flow:', error);
    throw error;
  }
};
