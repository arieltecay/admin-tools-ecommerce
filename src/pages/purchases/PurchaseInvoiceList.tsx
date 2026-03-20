import { useState, useEffect } from 'react';
import api from '../../services/api';
import { Plus, Eye, Loader2, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';
import { IPurchaseInvoice } from '../../types';

const PurchaseInvoiceList = () => {
  const [invoices, setInvoices] = useState<IPurchaseInvoice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    setLoading(true);
    try {
      const response = await api.get<{ invoices: IPurchaseInvoice[], total: number }>('/purchase-invoices');
      setInvoices(response.data.invoices);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString?: Date) => {
    if (!dateString) return '-';
    return new Intl.DateTimeFormat('es-AR').format(new Date(dateString));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Facturas de Compra</h1>
        <Link 
          to="/admin/purchases/new"
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700 transition-colors"
        >
          <Plus size={18} /> Cargar Factura
        </Link>
      </div>

      <div className="rounded-xl border border-gray-100 bg-white shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="border-b bg-gray-50">
            <tr>
              <th className="px-6 py-4 text-sm font-semibold text-gray-600">Nro Factura</th>
              <th className="px-6 py-4 text-sm font-semibold text-gray-600">Fecha</th>
              <th className="px-6 py-4 text-sm font-semibold text-gray-600">Proveedor</th>
              <th className="px-6 py-4 text-sm font-semibold text-gray-600">Tipo</th>
              <th className="px-6 py-4 text-sm font-semibold text-gray-600">Total</th>
              <th className="px-6 py-4 text-sm font-semibold text-gray-600 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr><td colSpan={6} className="px-6 py-8 text-center text-gray-500">Cargando...</td></tr>
            ) : invoices.length === 0 ? (
              <tr><td colSpan={6} className="px-6 py-8 text-center text-gray-500">No hay facturas cargadas.</td></tr>
            ) : invoices.map((inv) => (
              <tr key={inv._id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 font-medium text-gray-800">{inv.invoiceNumber}</td>
                <td className="px-6 py-4 text-sm text-gray-600">{formatDate(inv.invoiceDate)}</td>
                <td className="px-6 py-4 text-sm text-gray-800">{inv.supplier.name}</td>
                <td className="px-6 py-4 text-sm text-gray-600">Tipo {inv.invoiceType}</td>
                <td className="px-6 py-4 text-sm font-bold text-gray-900">${inv.totalAmount.toLocaleString()}</td>
                <td className="px-6 py-4 text-right">
                  <Link to={`/admin/purchases/${inv._id}`} className="text-blue-600 hover:underline">
                    <Eye size={18} />
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PurchaseInvoiceList;
