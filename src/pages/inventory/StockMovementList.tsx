import { useState, useEffect } from 'react';
import api from '../../services/api';
import { History, ArrowUpRight, ArrowDownLeft, Loader2, Search } from 'lucide-react';
import { IStockMovement } from '../../types';

const StockMovementList = () => {
  const [movements, setMovements] = useState<IStockMovement[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => {
    fetchMovements();
  }, [page]);

  const fetchMovements = async () => {
    setLoading(true);
    try {
      const response = await api.get<{ movements: IStockMovement[], total: number, pages: number }>('/stock-movements', { params: { page, limit: 20 } });
      setMovements(response.data.movements);
      setTotalPages(response.data.pages);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getTypeStyle = (type: string) => {
    switch (type) {
      case 'purchase': return 'text-green-600 bg-green-50';
      case 'sale': return 'text-blue-600 bg-blue-50';
      case 'adjustment': return 'text-yellow-600 bg-yellow-50';
      case 'return': return 'text-purple-600 bg-purple-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'purchase': return 'Compra';
      case 'sale': return 'Venta';
      case 'adjustment': return 'Ajuste';
      case 'return': return 'Devolución';
      default: return type;
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Movimientos de Stock</h1>

      <div className="rounded-xl border border-gray-100 bg-white shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="border-b bg-gray-50">
            <tr>
              <th className="px-6 py-4 text-sm font-semibold">Producto</th>
              <th className="px-6 py-4 text-sm font-semibold">Tipo</th>
              <th className="px-6 py-4 text-sm font-semibold">Cantidad</th>
              <th className="px-6 py-4 text-sm font-semibold">Stock Resultante</th>
              <th className="px-6 py-4 text-sm font-semibold">Fecha</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr><td colSpan={5} className="px-6 py-8 text-center"><Loader2 className="animate-spin mx-auto" /></td></tr>
            ) : movements.map((m) => (
              <tr key={m._id}>
                <td className="px-6 py-4">
                  <p className="font-medium text-gray-800">{m.product.name}</p>
                  <p className="text-xs text-gray-500">{m.product.sku}</p>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeStyle(m.type)}`}>
                    {getTypeLabel(m.type)}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className={`font-bold ${m.quantity > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {m.quantity > 0 ? '+' : ''}{m.quantity}
                  </span>
                </td>
                <td className="px-6 py-4 font-medium">{m.stockAfter}</td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {new Intl.DateTimeFormat('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }).format(new Date(m.createdAt))}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default StockMovementList;
