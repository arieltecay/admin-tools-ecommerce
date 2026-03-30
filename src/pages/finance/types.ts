// Component types
export interface IFinancePageProps {
  initialTab?: 'dashboard' | 'expenses' | 'contributions' | 'reports';
}

export interface IDateFilter {
  startDate?: string;
  endDate?: string;
}

export interface IOperatingExpense {
  id: string;
  description: string;
  amount: number;
  date: Date;
  category: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICapitalContribution {
  id: string;
  description: string;
  amount: number;
  date: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface IFinancialReport {
  incomeStatement: {
    period: {
      startDate: Date;
      endDate: Date;
    };
    totalSalesRevenue: number;
    totalCostOfGoodsSold: number;
    grossProfit: number;
    totalOperatingExpenses: number;
    netProfit: number;
  } | null;
  cashFlow: {
    period: {
      startDate: Date;
      endDate: Date;
    };
    totalIncome: number;
    totalExpenses: number;
    capitalContributions: number;
    netCashFlow: number;
  } | null;
  loading: boolean;
  error: string | null;
}
