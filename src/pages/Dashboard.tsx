import { useState, useEffect } from 'react';
import api from '../services/api';
import { 
  TrendingUp, TrendingDown, Package, ShoppingCart, 
  DollarSign, Loader2, Calendar, CreditCard, Wallet, 
  Clock, Truck, CheckCircle2, AlertCircle, Eye, LayoutGrid
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { IOrder } from '../types';

// Tipos locales para el Dashboard (Desacoplados del API)
interface TopItem {
  name: string;
  total: number;
  quantity: number;
}

interface PaymentMethodSummary {
  method: 'card' | 'bank_transfer';
  count: number;
  total: number;
}

interface OrderStatusDistribution {
  status: 'pending_payment' | 'confirmed' | 'preparing' | 'shipped' | 'delivered' | 'cancelled' | 'return_requested';
  count: number;
}

interface DashboardStats {
  revenue: number;
  orders: number;
  avgTicket: number;
  revenueGrowth: number;
  ordersGrowth: number;
  avgTicketGrowth: number;
  recentOrders: IOrder[];
  topProducts: TopItem[];
  topCategories: TopItem[];
  topBrands: TopItem[];
  paymentMethods: PaymentMethodSummary[];
  orderStatusDistribution: OrderStatusDistribution[];
}

const Dashboard = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  
  const [dates, setDates] = useState({
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });

  useEffect(() => { fetchDashboardData(); }, [dates]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const response = await api.get<DashboardStats>('/reports/dashboard', {
        params: { startDate: dates.startDate, endDate: dates.endDate }
      });
      setStats(response.data);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      pending_payment: 'Pago Pendiente', confirmed: 'Confirmado', preparing: 'Preparando',
      shipped: 'Enviado', delivered: 'Entregado', cancelled: 'Cancelado'
    };
    return labels[status] || status;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-emerald-50 text-emerald-700 border-emerald-100';
      case 'pending_payment': return 'bg-amber-50 text-amber-700 border-amber-100';
      case 'preparing': return 'bg-purple-50 text-purple-700 border-purple-100';
      case 'shipped': return 'bg-blue-50 text-blue-700 border-blue-100';
      default: return 'bg-gray-50 text-gray-500 border-gray-100';
    }
  };

  if (loading && !stats) {
    return <div className="flex h-[60vh] items-center justify-center"><Loader2 className="animate-spin text-blue-600" size={40} /></div>;
  }

  const transferTotal = stats?.paymentMethods.find(m => m.method === 'bank_transfer')?.total || 0;
  const cardTotal = stats?.paymentMethods.find(m => m.method === 'card')?.total || 0;

  return (
    <div className="space-y-6">
      {/* Top Bar / Caja del Día */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-black text-gray-900 uppercase tracking-tight">Consola de Operaciones</h1>
          <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Control de Caja e Inventario</p>
        </div>

        <div className="flex items-center gap-2 bg-white p-1 rounded-xl border border-gray-200 shadow-sm">
          <button 
            onClick={() => {
              const today = new Date().toISOString().split('T')[0];
              setDates({ startDate: today, endDate: today });
            }}
            className="px-3 py-1.5 text-[9px] font-black uppercase text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
          >
            Hoy
          </button>
          <div className="flex items-center gap-2 px-3 border-l border-gray-100">
            <Calendar size={12} className="text-gray-400" />
            <input 
              type="date" value={dates.startDate} 
              onChange={(e) => setDates({ ...dates, startDate: e.target.value })}
              className="text-[10px] font-black uppercase outline-none bg-transparent"
            />
          </div>
          <div className="flex items-center gap-2 px-3 border-l border-gray-100">
            <input 
              type="date" value={dates.endDate} 
              onChange={(e) => setDates({ ...dates, endDate: e.target.value })}
              className="text-[10px] font-black uppercase outline-none bg-transparent"
            />
          </div>
        </div>
      </div>

      {/* Caja y KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gray-900 rounded-2xl p-4 text-white shadow-xl shadow-blue-900/10">
          <p className="text-[8px] font-black uppercase text-blue-400 tracking-widest mb-1">Total Recaudado</p>
          <p className="text-2xl font-black tracking-tighter italic">${stats?.revenue.toLocaleString()}</p>
          <div className="mt-4 pt-4 border-t border-white/10 space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-[8px] font-bold text-gray-400 uppercase flex items-center gap-1"><Wallet size={10} /> Transf.</span>
              <span className="text-[10px] font-black">${transferTotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[8px] font-bold text-gray-400 uppercase flex items-center gap-1"><CreditCard size={10} /> Tarjeta</span>
              <span className="text-[10px] font-black">${cardTotal.toLocaleString()}</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm flex flex-col justify-center">
          <p className="text-[8px] font-black uppercase text-gray-400 tracking-widest mb-1">Órdenes del Día</p>
          <p className="text-2xl font-black text-gray-900 tracking-tighter">{stats?.orders}</p>
          <p className={`text-[9px] font-black uppercase mt-1 ${stats?.ordersGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {stats?.ordersGrowth >= 0 ? '+' : ''}{stats?.ordersGrowth.toFixed(1)}% vs ayer
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm flex flex-col justify-center">
          <p className="text-[8px] font-black uppercase text-gray-400 tracking-widest mb-1">Ticket Promedio</p>
          <p className="text-2xl font-black text-gray-900 tracking-tighter">${stats?.avgTicket.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
          <p className="text-[9px] font-bold text-gray-400 uppercase mt-1 italic tracking-widest">Valor por Venta</p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm flex flex-col justify-center">
          <p className="text-[8px] font-black uppercase text-gray-400 tracking-widest mb-1">Estado de Pago</p>
          <div className="space-y-2 mt-1">
            <div className="flex justify-between items-end">
              <span className="text-[9px] font-black uppercase text-emerald-600">Cobrado</span>
              <span className="text-[10px] font-black">
                {stats?.orderStatusDistribution.find(s => s.status === 'confirmed' || s.status === 'delivered')?.count || 0}
              </span>
            </div>
            <div className="h-1 w-full bg-gray-50 rounded-full overflow-hidden">
              <div className="h-full bg-emerald-500 rounded-full" style={{ width: '75%' }}></div>
            </div>
          </div>
        </div>
      </div>

      {/* Monitor Operativo y Mix de Ventas */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Monitor Operativo */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-900 mb-6 flex items-center gap-2">
              <Clock size={14} className="text-blue-600" /> Monitor Operativo
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {['pending_payment', 'confirmed', 'preparing', 'shipped'].map(status => {
                const data = stats?.orderStatusDistribution.find(s => s.status === status);
                return (
                  <div key={status} className={`p-3 rounded-xl border ${getStatusColor(status)}`}>
                    <p className="text-[7px] font-black uppercase tracking-widest mb-1 opacity-70">{getStatusLabel(status)}</p>
                    <p className="text-lg font-black tracking-tighter leading-none">{data?.count || 0}</p>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-900 mb-6 flex items-center gap-2">
              <LayoutGrid size={14} className="text-blue-600" /> Desempeño Categorías
            </h3>
            <div className="space-y-4">
              {stats?.topCategories.map((c: TopItem, i: number) => (
                <div key={i} className="space-y-1">
                  <div className="flex justify-between items-end">
                    <p className="text-[10px] font-black uppercase tracking-tighter text-gray-800 truncate max-w-[120px]">{c.name}</p>
                    <p className="text-[9px] font-black text-blue-600 tracking-tighter">${c.total.toLocaleString()}</p>
                  </div>
                  <div className="h-1 w-full bg-gray-50 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-600 rounded-full" style={{ width: `${(c.total / stats.revenue) * 100}%` }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Tablas de Alta Densidad */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm overflow-hidden">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-900 mb-6">Ranking de Artículos (Top Vendidos)</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-gray-50">
                    <th className="pb-3 text-[9px] font-black uppercase tracking-widest text-gray-400">Artículo</th>
                    <th className="pb-3 text-[9px] font-black uppercase tracking-widest text-gray-400 text-center">Cant.</th>
                    <th className="pb-3 text-[9px] font-black uppercase tracking-widest text-gray-400 text-right">Facturado</th>
                    <th className="pb-3 text-[9px] font-black uppercase tracking-widest text-gray-400 text-right">Mix %</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {stats?.topProducts.map((p, i) => (
                    <tr key={i} className="hover:bg-gray-50/50 transition-all">
                      <td className="py-2.5 text-[10px] font-black uppercase text-gray-900 tracking-tighter pr-4">{p.name}</td>
                      <td className="py-2.5 text-[10px] font-mono font-black text-center text-gray-500">x{p.quantity}</td>
                      <td className="py-2.5 text-[10px] font-black text-right text-gray-900 tracking-tighter">${p.total.toLocaleString()}</td>
                      <td className="py-2.5 text-right">
                        <span className="text-[9px] font-black text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">
                          {((p.total / stats.revenue) * 100).toFixed(1)}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm overflow-hidden">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-900 mb-6">Últimas Operaciones</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-gray-50">
                    <th className="pb-3 text-[9px] font-black uppercase tracking-widest text-gray-400">Orden</th>
                    <th className="pb-3 text-[9px] font-black uppercase tracking-widest text-gray-400">Cliente</th>
                    <th className="pb-3 text-[9px] font-black uppercase tracking-widest text-gray-400 text-center">Estado</th>
                    <th className="pb-3 text-[9px] font-black uppercase tracking-widest text-gray-400 text-right">Monto</th>
                    <th className="pb-3 text-[9px] font-black uppercase tracking-widest text-gray-400 text-right"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {stats?.recentOrders.map((o: IOrder, i: number) => (
                    <tr key={i} className="hover:bg-gray-50/50 transition-all">
                      <td className="py-2 text-[10px] font-mono font-black text-blue-600">#{o.orderNumber.split('-').pop()}</td>
                      <td className="py-2">
                        <p className="text-[10px] font-black uppercase text-gray-800 leading-none">{o.customer.fullName}</p>
                        <p className="text-[8px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">{o.payment.method === 'card' ? 'Tarjeta' : 'Transf.'}</p>
                      </td>
                      <td className="py-2 text-center">
                        <span className={`px-2 py-0.5 rounded-md text-[8px] font-black uppercase border ${getStatusColor(o.status)}`}>
                          {getStatusLabel(o.status)}
                        </span>
                      </td>
                      <td className="py-2 text-[10px] font-black text-right text-gray-900 tracking-tighter">${o.pricing.total.toLocaleString()}</td>
                      <td className="py-2 text-right">
                        <Link to={`/admin/orders/${o._id}`} className="p-1.5 text-gray-400 hover:text-blue-600 inline-block transition-all">
                          <Eye size={14} />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
