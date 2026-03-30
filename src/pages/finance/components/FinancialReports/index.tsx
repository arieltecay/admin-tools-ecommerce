import { FC, useState } from 'react';
import type { IFinancialReportsProps } from './types';

const FinancialReports: FC<IFinancialReportsProps> = ({
  incomeStatement,
  cashFlow,
  loading,
  startDate,
  endDate,
  onDateChange,
  onGenerateReports,
}) => {
  const [localStartDate, setLocalStartDate] = useState(startDate);
  const [localEndDate, setLocalEndDate] = useState(endDate);

  const handleGenerateClick = async () => {
    onDateChange(localStartDate, localEndDate);
    await onGenerateReports();
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-4 rounded shadow">
        <h2 className="text-lg font-semibold mb-4">Filtros de Fecha</h2>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Fecha Inicio</label>
            <input
              type="date"
              value={localStartDate}
              onChange={(e) => setLocalStartDate(e.target.value)}
              className="w-full px-3 py-2 border rounded"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Fecha Fin</label>
            <input
              type="date"
              value={localEndDate}
              onChange={(e) => setLocalEndDate(e.target.value)}
              className="w-full px-3 py-2 border rounded"
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={handleGenerateClick}
              disabled={loading}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400"
            >
              {loading ? 'Generando...' : 'Generar Reportes'}
            </button>
          </div>
        </div>
      </div>

      {incomeStatement && (
        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-lg font-semibold mb-4">Estado de Resultados</h2>
          <p className="text-sm text-gray-600 mb-4">
            Período: {new Date(incomeStatement.period.startDate).toLocaleDateString()} -{' '}
            {new Date(incomeStatement.period.endDate).toLocaleDateString()}
          </p>
          <div className="space-y-2">
            <div className="flex justify-between border-b pb-2">
              <span>Total Ingresos por Ventas:</span>
              <span className="font-semibold">${incomeStatement.totalSalesRevenue.toFixed(2)}</span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span>Costo de Mercadería Vendida:</span>
              <span className="font-semibold text-red-600">
                -${incomeStatement.totalCostOfGoodsSold.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between border-b pb-2 bg-blue-50 p-2">
              <span className="font-semibold">Ganancia Bruta:</span>
              <span className="font-semibold">${incomeStatement.grossProfit.toFixed(2)}</span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span>Gastos Operativos:</span>
              <span className="font-semibold text-red-600">
                -${incomeStatement.totalOperatingExpenses.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between bg-green-50 p-2">
              <span className="font-bold text-lg">Ganancia Neta:</span>
              <span
                className={`font-bold text-lg ${
                  incomeStatement.netProfit >= 0 ? 'text-green-600' : 'text-red-600'
                }`}
              >
                ${incomeStatement.netProfit.toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      )}

      {cashFlow && (
        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-lg font-semibold mb-4">Flujo de Caja</h2>
          <p className="text-sm text-gray-600 mb-4">
            Período: {new Date(cashFlow.period.startDate).toLocaleDateString()} -{' '}
            {new Date(cashFlow.period.endDate).toLocaleDateString()}
          </p>
          <div className="space-y-2">
            <div className="flex justify-between border-b pb-2">
              <span>Total Ingresos:</span>
              <span className="font-semibold">${cashFlow.totalIncome.toFixed(2)}</span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span>Total Gastos:</span>
              <span className="font-semibold text-red-600">-${cashFlow.totalExpenses.toFixed(2)}</span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span>Aportes de Capital:</span>
              <span className="font-semibold text-green-600">+${cashFlow.capitalContributions.toFixed(2)}</span>
            </div>
            <div className="flex justify-between bg-blue-50 p-2">
              <span className="font-bold text-lg">Flujo Neto de Caja:</span>
              <span
                className={`font-bold text-lg ${cashFlow.netCashFlow >= 0 ? 'text-green-600' : 'text-red-600'}`}
              >
                ${cashFlow.netCashFlow.toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      )}

      {!incomeStatement && !cashFlow && !loading && (
        <div className="bg-gray-50 p-4 rounded text-center text-gray-500">
          Haga clic en "Generar Reportes" para ver los informes financieros
        </div>
      )}
    </div>
  );
};

export default FinancialReports;
