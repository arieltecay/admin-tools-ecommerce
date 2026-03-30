// Responses from API
export interface IOperatingExpenseResponse {
  id: string;
  description: string;
  amount: number;
  date: Date;
  category: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICapitalContributionResponse {
  id: string;
  description: string;
  amount: number;
  date: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface IIncomeStatement {
  period: {
    startDate: Date;
    endDate: Date;
  };
  totalSalesRevenue: number;
  totalCostOfGoodsSold: number;
  grossProfit: number;
  totalOperatingExpenses: number;
  netProfit: number;
}

export interface ICashFlow {
  period: {
    startDate: Date;
    endDate: Date;
  };
  totalIncome: number;
  totalExpenses: number;
  capitalContributions: number;
  netCashFlow: number;
}

// Request DTOs
export interface ICreateOperatingExpenseRequest {
  description: string;
  amount: number;
  date: string;
  category: string;
}

export interface ICreateCapitalContributionRequest {
  description: string;
  amount: number;
  date: string;
}

export interface IDateRangeParams {
  startDate?: string;
  endDate?: string;
}
