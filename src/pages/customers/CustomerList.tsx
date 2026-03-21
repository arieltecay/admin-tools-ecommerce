import { useState, useEffect } from 'react';
import api from '../../services/api';
import { Search, User, Mail, Phone, Loader2, ChevronUp, ChevronDown } from 'lucide-react';
import { ICustomer } from '../../types';

const CustomerList = () => {
  const [customers, setCustomers] = useState<ICustomer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      setPage(1);
      fetchCustomers();
    }, 400);
    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  useEffect(() => { fetchCustomers(); }, [page]);

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const response = await api.get<{ customers: ICustomer[], total: number, pages: number }>('/customers', {
        params: { page, limit: 12, email: searchTerm || undefined }
      });
      setCustomers(response.data.customers);
      setTotalPages(response.data.pages);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  const formatDate = (dateString?: Date) => {
    if (!dateString) return 'Nunca';
    return new Intl.DateTimeFormat('es-AR', { day: '2-digit', month: '2-digit', year: '2-digit' }).format(new Date(dateString));
  };

  return (
    <div className="space-y-4">
      {/* Header Compacto */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-black text-gray-900 uppercase tracking-tight">Clientes</h1>
          <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Cartera de Usuarios</p>
        </div>
      </div>

      {/* Búsqueda Compacta */}
      <div className="relative group">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors" size={14} />
        <input
          type="text" placeholder="Buscar por email o nombre..."
          className="w-full rounded-xl border border-gray-200 bg-white py-2 pl-9 pr-3 text-[11px] font-bold outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50/50 transition-all"
          value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-gray-200">
          <table className="w-full text-left min-w-[900px]">
            <thead className="border-b bg-gray-50/50">
              <tr>
                <th className="px-4 py-3 text-[9px] font-black uppercase tracking-widest text-gray-400">Cliente</th>
                <th className="px-4 py-3 text-[9px] font-black uppercase tracking-widest text-gray-400">Contacto</th>
                <th className="px-4 py-3 text-[9px] font-black uppercase tracking-widest text-gray-400 text-center">Órdenes</th>
                <th className="px-4 py-3 text-[9px] font-black uppercase tracking-widest text-gray-400">Inversión Total</th>
                <th className="px-4 py-3 text-[9px] font-black uppercase tracking-widest text-gray-400">Última Actividad</th>
                <th className="px-4 py-3 text-[9px] font-black uppercase tracking-widest text-gray-400 text-right">Origen</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan={6} className="px-4 py-12 text-center"><Loader2 className="animate-spin text-blue-600 mx-auto" size={24} /></td></tr>
              ) : customers.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-12 text-center text-[10px] font-bold text-gray-400 uppercase">Sin clientes</td></tr>
              ) : (
                customers.map((c) => (
                  <tr key={c._id} className="hover:bg-blue-50/20 transition-all group">
                    <td className="px-4 py-2">
                      <div className="flex items-center gap-2">
                        <div className="h-7 w-7 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-400">
                          <User size={14} />
                        </div>
                        <span className="text-[11px] font-black text-gray-800 uppercase tracking-tighter leading-none">{c.fullName}</span>
                      </div>
                    </td>
                    <td className="px-4 py-2">
                      <div className="flex flex-col">
                        <p className="flex items-center gap-1.5 text-[10px] font-bold text-gray-600 leading-none mb-0.5"><Mail size={10} className="text-gray-300" /> {c.email}</p>
                        <p className="flex items-center gap-1.5 text-[9px] font-bold text-gray-400 uppercase tracking-widest leading-none"><Phone size={10} className="text-gray-300" /> {c.phone || 'S/T'}</p>
                      </div>
                    </td>
                    <td className="px-4 py-2 text-center">
                      <span className="text-[10px] font-black text-gray-900 bg-gray-100 px-2 py-0.5 rounded-md">{c.ordersCount}</span>
                    </td>
                    <td className="px-4 py-2">
                      <span className="text-[11px] font-black text-blue-600 tracking-tighter">${c.totalSpent.toLocaleString()}</span>
                    </td>
                    <td className="px-4 py-2 text-[10px] font-bold text-gray-400">
                      {formatDate(c.lastOrderAt)}
                    </td>
                    <td className="px-4 py-2 text-right">
                      <span className={`inline-flex rounded-md px-2 py-0.5 text-[8px] font-black uppercase tracking-tight border ${
                        c.origin === 'online' ? 'bg-green-50 text-green-700 border-green-100' : 'bg-gray-50 text-gray-500 border-gray-100'
                      }`}>
                        {c.origin === 'online' ? 'Online' : 'Manual'}
                      </span>
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

export default CustomerList;
