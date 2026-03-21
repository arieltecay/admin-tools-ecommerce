import { useState, useEffect } from 'react';
import api from '../../services/api';
import { Search, Eye, Loader2, ChevronUp, ChevronDown } from 'lucide-react';
import { Link } from 'react-router-dom';
import { IOrder } from '../../types';

const OrderList = () => {
  const [orders, setOrders] = useState<IOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [statusFilter, setStatusFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      setPage(1);
      fetchOrders();
    }, 400);
    return () => clearTimeout(delayDebounceFn);
  }, [statusFilter, searchTerm]);

  useEffect(() => { fetchOrders(); }, [page]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const response = await api.get<{ orders: IOrder[], total: number, pages: number }>('/orders', {
        params: { page, limit: 12, status: statusFilter || undefined, q: searchTerm || undefined }
      });
      setOrders(response.data.orders);
      setTotalPages(response.data.pages);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-50 text-green-700 border-green-100';
      case 'pending_payment': return 'bg-yellow-50 text-yellow-700 border-yellow-100';
      case 'preparing': return 'bg-purple-50 text-purple-700 border-purple-100';
      case 'shipped': return 'bg-blue-50 text-blue-700 border-blue-100';
      case 'delivered': return 'bg-gray-50 text-gray-700 border-gray-100';
      case 'cancelled': return 'bg-red-50 text-red-700 border-red-100';
      default: return 'bg-gray-50 text-gray-500 border-gray-100';
    }
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      confirmed: 'Confirmado', pending_payment: 'Pago Pendiente', preparing: 'Preparando',
      shipped: 'Enviado', delivered: 'Entregado', cancelled: 'Cancelado'
    };
    return labels[status] || status;
  };

  const formatDate = (dateString?: Date) => {
    if (!dateString) return '-';
    return new Intl.DateTimeFormat('es-AR', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' }).format(new Date(dateString));
  };

  return (
    <div className="space-y-4">
      {/* Header Compacto */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-black text-gray-900 uppercase tracking-tight italic">Pedidos</h1>
          <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Gestión de Ventas</p>
        </div>
      </div>

      {/* Filtros Compactos */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <div className="relative flex-1 group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors" size={14} />
          <input
            type="text" placeholder="Buscar por pedido o email..."
            className="w-full rounded-xl border border-gray-200 bg-white py-2 pl-9 pr-3 text-[11px] font-bold outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50/50 transition-all"
            value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <select 
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-[11px] font-bold text-gray-700 outline-none focus:border-blue-500 transition-all"
        >
          <option value="">Todos los estados</option>
          <option value="pending_payment">Pago Pendiente</option>
          <option value="confirmed">Confirmado</option>
          <option value="preparing">Preparando</option>
          <option value="shipped">Enviado</option>
          <option value="delivered">Entregado</option>
          <option value="cancelled">Cancelado</option>
        </select>
      </div>

      {/* Table con Scroll Horizontal */}
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-gray-200">
          <table className="w-full text-left min-w-[800px]">
            <thead className="border-b bg-gray-50/50">
              <tr>
                <th className="px-4 py-3 text-[9px] font-black uppercase tracking-widest text-gray-400">ID Pedido</th>
                <th className="px-4 py-3 text-[9px] font-black uppercase tracking-widest text-gray-400">Fecha</th>
                <th className="px-4 py-3 text-[9px] font-black uppercase tracking-widest text-gray-400">Cliente</th>
                <th className="px-4 py-3 text-[9px] font-black uppercase tracking-widest text-gray-400">Monto</th>
                <th className="px-4 py-3 text-[9px] font-black uppercase tracking-widest text-gray-400">Estado</th>
                <th className="px-4 py-3 text-[9px] font-black uppercase tracking-widest text-gray-400 text-right">Detalle</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan={6} className="px-4 py-12 text-center"><Loader2 className="animate-spin text-blue-600 mx-auto" size={24} /></td></tr>
              ) : orders.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-12 text-center text-[10px] font-bold text-gray-400 uppercase">Sin pedidos</td></tr>
              ) : (
                orders.map((order) => (
                  <tr key={order._id} className="hover:bg-blue-50/20 transition-all group">
                    <td className="px-4 py-2">
                      <Link to={`/admin/orders/${order._id}`} className="text-[10px] font-mono font-black text-blue-600 hover:underline">
                        #{order.orderNumber}
                      </Link>
                    </td>
                    <td className="px-4 py-2 text-[10px] font-bold text-gray-400 italic">
                      {formatDate(order.createdAt)}
                    </td>
                    <td className="px-4 py-2">
                      <div className="flex flex-col">
                        <span className="text-[11px] font-black text-gray-800 uppercase italic tracking-tighter leading-none">{order.customer.fullName}</span>
                        <span className="text-[9px] text-gray-400 font-bold uppercase truncate max-w-[150px]">{order.customer.email}</span>
                      </div>
                    </td>
                    <td className="px-4 py-2 text-[11px] font-black text-gray-900 italic tracking-tighter">
                      ${order.pricing.total.toLocaleString()}
                    </td>
                    <td className="px-4 py-2">
                      <span className={`inline-flex rounded-md px-2 py-0.5 text-[8px] font-black uppercase tracking-tight border ${getStatusColor(order.status)}`}>
                        {getStatusLabel(order.status)}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-right">
                      <Link to={`/admin/orders/${order._id}`} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg inline-flex transition-all">
                        <Eye size={14} />
                      </Link>
                    </td>
                  </tr>
                ))
              )}
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

export default OrderList;
