import { useState, useEffect } from 'react';
import api from '../../services/api';
import { Search, User, Mail, Phone, Calendar, Loader2 } from 'lucide-react';
import { ICustomer } from '../../types';

const CustomerList = () => {
  const [customers, setCustomers] = useState<ICustomer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => {
    fetchCustomers();
  }, [page, searchTerm]);

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const response = await api.get<{ customers: ICustomer[], total: number, pages: number }>('/customers', {
        params: {
          page,
          limit: 10,
          email: searchTerm || undefined
        }
      });
      setCustomers(response.data.customers);
      setTotalPages(response.data.pages);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString?: Date) => {
    if (!dateString) return 'Nunca';
    return new Intl.DateTimeFormat('es-AR').format(new Date(dateString));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Clientes</h1>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
        <input
          type="text"
          placeholder="Buscar por email..."
          className="w-full rounded-lg border border-gray-200 bg-white py-2 pl-10 pr-4 outline-none focus:border-blue-500"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="rounded-xl border border-gray-100 bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="border-b bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-sm font-semibold text-gray-600">Cliente</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-600">Contacto</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-600">Pedidos</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-600">Total Gastado</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-600">Última Compra</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-600">Origen</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                    <Loader2 className="animate-spin mx-auto mb-2" size={24} />
                    Cargando clientes...
                  </td>
                </tr>
              ) : customers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">No hay clientes para mostrar.</td>
                </tr>
              ) : (
                customers.map((customer) => (
                  <tr key={customer._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                          <User size={20} />
                        </div>
                        <span className="font-medium text-gray-800">{customer.fullName}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <p className="text-sm text-gray-600 flex items-center gap-1"><Mail size={14} /> {customer.email}</p>
                        <p className="text-sm text-gray-600 flex items-center gap-1"><Phone size={14} /> {customer.phone}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{customer.ordersCount}</td>
                    <td className="px-6 py-4 text-sm font-bold text-gray-900">${customer.totalSpent.toLocaleString()}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{formatDate(customer.lastOrderAt)}</td>
                    <td className="px-6 py-4">
                      <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        customer.origin === 'online' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {customer.origin === 'online' ? 'Online' : 'Manual'}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        <div className="flex items-center justify-between border-t px-6 py-4">
          <span className="text-sm text-gray-600">
            Página {page} de {totalPages || 1}
          </span>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setPage(prev => Math.max(prev - 1, 1))}
              disabled={page === 1}
              className="rounded-lg border px-4 py-1.5 text-sm font-medium hover:bg-gray-50 disabled:opacity-50"
            >
              Anterior
            </button>
            <button 
              onClick={() => setPage(prev => Math.min(prev + 1, totalPages))}
              disabled={page === totalPages || totalPages === 0}
              className="rounded-lg border px-4 py-1.5 text-sm font-medium hover:bg-gray-50 disabled:opacity-50"
            >
              Siguiente
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerList;
