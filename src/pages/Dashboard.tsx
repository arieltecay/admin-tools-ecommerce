import { useState, useEffect } from 'react';
import api from '../services/api';
import { Loader2, ShoppingBag, Users, AlertTriangle, DollarSign } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, BarChart, Bar, Cell, PieChart, Pie } from 'recharts';

interface Stats {
  revenue: number;
  orders: number;
  avgTicket: number;
  newCustomers: number;
  lowStockAlerts: number;
  recentOrders: any[];
  salesByDay: { date: string; total: number; count: number }[];
  topCategories: { name: string; total: number; quantity: number }[];
}

const Dashboard = () => {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const response = await api.get<Stats>('/reports/dashboard');
      setStats(response.data);
      setError(null);
    } catch (err: any) {
      setError('Error al cargar estadísticas');
      console.error('Error fetching dashboard stats:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('es-AR', {
      day: '2-digit',
      month: 'short',
    }).format(date);
  };

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'hace unos segundos';
    if (diffInSeconds < 3600) return `hace ${Math.floor(diffInSeconds / 60)} min`;
    if (diffInSeconds < 86400) return `hace ${Math.floor(diffInSeconds / 3600)} horas`;
    return new Intl.DateTimeFormat('es-AR').format(date);
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="animate-spin text-blue-600" size={40} />
      </div>
    );
  }

  const statCards = [
    { 
      name: 'Ventas Totales', 
      value: `$${stats?.revenue.toLocaleString()}`, 
      icon: <DollarSign className="text-blue-600" size={20} />,
      color: 'bg-blue-50'
    },
    { 
      name: 'Pedidos', 
      value: stats?.orders.toString(), 
      icon: <ShoppingBag className="text-green-600" size={20} />,
      color: 'bg-green-50'
    },
    { 
      name: 'Clientes Nuevos', 
      value: stats?.newCustomers.toString(), 
      icon: <Users className="text-purple-600" size={20} />,
      color: 'bg-purple-50'
    },
    { 
      name: 'Stock Bajo', 
      value: stats?.lowStockAlerts.toString(), 
      icon: <AlertTriangle className="text-red-600" size={20} />,
      color: 'bg-red-50'
    },
  ];

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
        <button 
          onClick={fetchStats}
          className="text-sm text-blue-600 hover:underline"
        >
          Actualizar datos
        </button>
      </div>
      
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <div key={stat.name} className="rounded-xl bg-white p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-gray-500">{stat.name}</p>
              <div className={`rounded-lg p-2 ${stat.color}`}>
                {stat.icon}
              </div>
            </div>
            <div className="mt-2">
              <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Sales Area Chart */}
        <div className="lg:col-span-2 rounded-xl bg-white p-6 shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-800 mb-6">Ventas por día</h2>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats?.salesByDay}>
                <defs>
                  <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={formatDate}
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: '#9ca3af' }}
                />
                <YAxis 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: '#9ca3af' }}
                  tickFormatter={(value) => `$${value}`}
                />
                <Tooltip 
                  labelFormatter={formatDate}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Area type="monotone" dataKey="total" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorTotal)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Categories Chart */}
        <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-800 mb-6">Categorías más vendidas</h2>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats?.topCategories} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f3f4f6" />
                <XAxis type="number" hide />
                <YAxis 
                  dataKey="name" 
                  type="category" 
                  axisLine={false} 
                  tickLine={false}
                  tick={{ fontSize: 11, fill: '#4b5563' }}
                  width={100}
                />
                <Tooltip 
                  cursor={{ fill: 'transparent' }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="total" radius={[0, 4, 4, 0]}>
                  {stats?.topCategories.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Orders Table */}
      <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-100">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Últimos Pedidos</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="border-b bg-gray-50/50">
              <tr>
                <th className="px-4 py-3 text-xs font-bold text-gray-500 uppercase">Pedido</th>
                <th className="px-4 py-3 text-xs font-bold text-gray-500 uppercase">Cliente</th>
                <th className="px-4 py-3 text-xs font-bold text-gray-500 uppercase">Total</th>
                <th className="px-4 py-3 text-xs font-bold text-gray-500 uppercase">Estado</th>
                <th className="px-4 py-3 text-xs font-bold text-gray-500 uppercase">Fecha</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {stats?.recentOrders.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-8 text-gray-500 italic">No hay pedidos recientes</td>
                </tr>
              ) : (
                stats?.recentOrders.map((order) => (
                  <tr key={order._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-4 font-bold text-blue-600">#{order.orderNumber}</td>
                    <td className="px-4 py-4 text-sm text-gray-700">{order.customer.fullName}</td>
                    <td className="px-4 py-4 font-bold text-gray-900">${order.pricing.total.toLocaleString()}</td>
                    <td className="px-4 py-4">
                      <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800 uppercase">
                        {order.status}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-xs text-gray-500">{getTimeAgo(order.createdAt)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
