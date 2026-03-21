import { useState, useEffect } from 'react';
import api from '../../services/api';
import { Loader2, ChevronUp, ChevronDown } from 'lucide-react';
import { IStockMovement } from '../../types';

const StockMovementList = () => {
  const [movements, setMovements] = useState<IStockMovement[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => { fetchMovements(); }, [page]);

  const fetchMovements = async () => {
    setLoading(true);
    try {
      const response = await api.get<{ movements: IStockMovement[], total: number, pages: number }>('/stock-movements', { params: { page, limit: 15 } });
      setMovements(response.data.movements);
      setTotalPages(response.data.pages);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  const getTypeStyle = (type: string) => {
    switch (type) {
      case 'purchase': return 'text-emerald-700 bg-emerald-50 border-emerald-100';
      case 'sale': return 'text-blue-700 bg-blue-50 border-blue-100';
      case 'adjustment': return 'text-amber-700 bg-amber-50 border-amber-100';
      case 'return': return 'text-purple-700 bg-purple-50 border-purple-100';
      default: return 'text-gray-500 bg-gray-50 border-gray-100';
    }
  };

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = { purchase: 'Entrada', sale: 'Salida', adjustment: 'Ajuste', return: 'Devolución' };
    return labels[type] || type;
  };

  return (
    <div className="space-y-4">
      {/* Header Compacto */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-black text-gray-900 uppercase tracking-tight italic">Inventario</h1>
          <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Movimientos de Stock</p>
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-gray-200">
          <table className="w-full text-left min-w-[800px]">
            <thead className="border-b bg-gray-50/50">
              <tr>
                <th className="px-4 py-3 text-[9px] font-black uppercase tracking-widest text-gray-400">Producto / SKU</th>
                <th className="px-4 py-3 text-[9px] font-black uppercase tracking-widest text-gray-400">Tipo</th>
                <th className="px-4 py-3 text-[9px] font-black uppercase tracking-widest text-gray-400 text-center">Variación</th>
                <th className="px-4 py-3 text-[9px] font-black uppercase tracking-widest text-gray-400 text-center">Balance Final</th>
                <th className="px-4 py-3 text-[9px] font-black uppercase tracking-widest text-gray-400 text-right">Fecha / Hora</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan={5} className="px-4 py-12 text-center"><Loader2 className="animate-spin text-blue-600 mx-auto" size={24} /></td></tr>
              ) : movements.length === 0 ? (
                <tr><td colSpan={5} className="px-4 py-12 text-center text-[10px] font-bold text-gray-400 uppercase">Sin movimientos registrados</td></tr>
              ) : movements.map((m) => (
                <tr key={m._id} className="hover:bg-blue-50/20 transition-all group">
                  <td className="px-4 py-2">
                    <div className="flex flex-col">
                      <span className="text-[11px] font-black text-gray-800 uppercase italic tracking-tighter leading-none">{m.product.name}</span>
                      <span className="text-[9px] text-gray-400 font-mono font-bold uppercase tracking-widest leading-none mt-1">{m.product.sku}</span>
                    </div>
                  </td>
                  <td className="px-4 py-2">
                    <span className={`inline-flex rounded-md px-2 py-0.5 text-[8px] font-black uppercase tracking-tight border ${getTypeStyle(m.type)}`}>
                      {getTypeLabel(m.type)}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-center">
                    <span className={`text-[11px] font-mono font-black ${m.quantity > 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {m.quantity > 0 ? '+' : ''}{m.quantity}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-center">
                    <span className="text-[10px] font-black text-gray-900 bg-gray-100 px-2 py-0.5 rounded-md">{m.stockAfter}</span>
                  </td>
                  <td className="px-4 py-2 text-right">
                    <span className="text-[10px] font-bold text-gray-400 italic">
                      {new Intl.DateTimeFormat('es-AR', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' }).format(new Date(m.createdAt))}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination Compacta */}
        <div className="bg-gray-50 px-4 py-3 border-t border-gray-100 flex items-center justify-between">
          <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Pág {page} / {totalPages || 1}</div>
          <div className="flex items-center gap-1.5">
            <button disabled={page === 1} onClick={() => setPage(page - 1)} className="p-1.5 rounded-lg border border-gray-200 bg-white text-gray-400 disabled:opacity-30 transition-all"><ChevronUp className="-rotate-90" size={14} /></button>
            <button disabled={page === totalPages || totalPages === 0} onClick={() => setPage(page + 1)} className="p-1.5 rounded-lg border border-gray-200 bg-white text-gray-400 disabled:opacity-30 transition-all"><ChevronDown className="-rotate-90" size={14} /></button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StockMovementList;
