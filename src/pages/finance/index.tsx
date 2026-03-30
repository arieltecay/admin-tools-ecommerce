import { FC, useState } from 'react';
import {
  OperatingExpensesSection,
  CapitalContributionsSection,
  FinancialReports,
} from './components';
import {
  useOperatingExpensesLogic,
  useCapitalContributionsLogic,
  useFinancialReportsLogic,
} from './hooks';

const FinancePage: FC = () => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'expenses' | 'contributions' | 'reports'>(
    'dashboard'
  );
  const [startDate, setStartDate] = useState(
    new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0]
  );
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);

  // Logic hooks
  const expensesLogic = useOperatingExpensesLogic();
  const contributionsLogic = useCapitalContributionsLogic();
  const reportsLogic = useFinancialReportsLogic();

  const handleDateChange = (newStartDate: string, newEndDate: string) => {
    setStartDate(newStartDate);
    setEndDate(newEndDate);
  };

  const handleGenerateReports = async () => {
    await reportsLogic.generateReports({
      startDate,
      endDate,
    });
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Módulo de Finanzas</h1>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b bg-white rounded-t">
          {[
            { id: 'dashboard', label: 'Dashboard' },
            { id: 'expenses', label: 'Gastos Operativos' },
            { id: 'contributions', label: 'Aportes de Capital' },
            { id: 'reports', label: 'Reportes' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-3 font-medium transition ${
                activeTab === tab.id
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="bg-white p-6 rounded-b shadow">
          {activeTab === 'dashboard' && (
            <div className="space-y-4">
              <h2 className="text-2xl font-bold mb-4">Dashboard Financiero</h2>
              <div className="text-gray-600">
                <p>
                  Bienvenido al módulo de Inteligencia de Negocios y Finanzas. Desde aquí podrá:
                </p>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>Registrar y gestionar gastos operativos</li>
                  <li>Registrar aportes de capital</li>
                  <li>Generar reportes financieros (Estado de Resultados y Flujo de Caja)</li>
                  <li>Analizar la rentabilidad de su negocio</li>
                </ul>
              </div>

              {/* Quick Summary Cards */}
              <div className="grid grid-cols-4 gap-4 mt-6">
                <div className="bg-blue-50 p-4 rounded">
                  <p className="text-sm text-gray-600">Total Gastos</p>
                  <p className="text-2xl font-bold text-blue-600">
                    ${expensesLogic.expenses.reduce((sum, e) => sum + e.amount, 0).toFixed(2)}
                  </p>
                </div>
                <div className="bg-green-50 p-4 rounded">
                  <p className="text-sm text-gray-600">Total Aportes</p>
                  <p className="text-2xl font-bold text-green-600">
                    ${contributionsLogic.contributions.reduce((sum, c) => sum + c.amount, 0).toFixed(2)}
                  </p>
                </div>
                <div className="bg-purple-50 p-4 rounded">
                  <p className="text-sm text-gray-600">Gastos Registrados</p>
                  <p className="text-2xl font-bold text-purple-600">{expensesLogic.expenses.length}</p>
                </div>
                <div className="bg-orange-50 p-4 rounded">
                  <p className="text-sm text-gray-600">Aportes Registrados</p>
                  <p className="text-2xl font-bold text-orange-600">{contributionsLogic.contributions.length}</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'expenses' && (
            <OperatingExpensesSection
              expenses={expensesLogic.expenses}
              loading={expensesLogic.loading}
              onRefresh={expensesLogic.fetchExpenses}
              onAdd={expensesLogic.addExpense}
              onUpdate={expensesLogic.updateExpense}
              onDelete={expensesLogic.deleteExpense}
            />
          )}

          {activeTab === 'contributions' && (
            <CapitalContributionsSection
              contributions={contributionsLogic.contributions}
              loading={contributionsLogic.loading}
              onRefresh={contributionsLogic.fetchContributions}
              onAdd={contributionsLogic.addContribution}
              onUpdate={contributionsLogic.updateContribution}
              onDelete={contributionsLogic.deleteContribution}
            />
          )}

          {activeTab === 'reports' && (
            <FinancialReports
              incomeStatement={reportsLogic.incomeStatement}
              cashFlow={reportsLogic.cashFlow}
              loading={reportsLogic.loading}
              startDate={startDate}
              endDate={endDate}
              onDateChange={handleDateChange}
              onGenerateReports={handleGenerateReports}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default FinancePage;
