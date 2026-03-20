import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2, Package, Truck, CheckCircle, XCircle, Clock, Save } from 'lucide-react';
import api from '../../services/api';
import { IOrder } from '../../types';
import AlertModal from '../../components/common/AlertModal';

const OrderDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState<IOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setLoadingUpdating] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [note, setNote] = useState('');

  // Modal state
  const [alert, setAlert] = useState<{ isOpen: boolean, title: string, message: string, type: 'success' | 'error' }>({
    isOpen: false, title: '', message: '', type: 'success'
  });

  useEffect(() => {
    fetchOrder();
  }, [id]);

  const fetchOrder = async () => {
    setLoading(true);
    try {
      const response = await api.get<IOrder>(`/orders/${id}`);
      setOrder(response.data);
      setNewStatus(response.data.status);
      setNote('');
    } catch (err) {
      console.error(err);
      navigate('/admin/orders');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async () => {
    setLoadingUpdating(true);
    try {
      await api.patch(`/orders/${id}/status`, { status: newStatus, note });
      await fetchOrder();
      setAlert({ isOpen: true, title: 'Éxito', message: 'Estado actualizado correctamente', type: 'success' });
    } catch (err) {
      console.error(err);
      setAlert({ isOpen: true, title: 'Error', message: 'No se pudo actualizar el estado', type: 'error' });
    } finally {
      setLoadingUpdating(false);
    }
  };

  if (loading || !order) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="animate-spin text-blue-600" size={40} />
      </div>
    );
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed': return <CheckCircle className="text-green-500" />;
      case 'pending_payment': return <Clock className="text-yellow-500" />;
      case 'preparing': return <Package className="text-purple-500" />;
      case 'shipped': return <Truck className="text-blue-500" />;
      case 'delivered': return <CheckCircle className="text-gray-500" />;
      case 'cancelled': return <XCircle className="text-red-500" />;
      default: return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate('/admin/orders')} className="rounded-full p-2 hover:bg-gray-100">
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-2xl font-bold text-gray-800">Pedido #{order.orderNumber}</h1>
      </div>

      <AlertModal
        isOpen={alert.isOpen}
        onClose={() => setAlert({ ...alert, isOpen: false })}
        title={alert.title}
        message={alert.message}
        type={alert.type}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Order Items & Customer */}
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-100">
            <h2 className="text-lg font-semibold mb-4 border-b pb-2">Productos</h2>
            <div className="divide-y">
              {order.items.map((item, idx) => (
                <div key={idx} className="py-4 flex items-center gap-4">
                  <div className="h-16 w-16 bg-gray-50 rounded border overflow-hidden">
                    <img src={item.product.primaryImageUrl} alt="" className="h-full w-full object-contain" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{item.product.name}</p>
                    <p className="text-xs text-gray-500 uppercase">SKU: {item.product.sku}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">{item.quantity} x ${item.unitPrice.toLocaleString()}</p>
                    <p className="font-bold">${item.subtotal.toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t space-y-2">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span>${order.pricing.subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Envío</span>
                <span>${order.pricing.shippingCost.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-xl font-bold text-gray-900 pt-2 border-t">
                <span>Total</span>
                <span>${order.pricing.total.toLocaleString()}</span>
              </div>
            </div>
          </div>

          <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-100">
            <h2 className="text-lg font-semibold mb-4 border-b pb-2">Envío y Entrega</h2>
            <div className="grid grid-cols-2 gap-8">
              <div className="space-y-2">
                <p className="text-xs font-bold text-gray-400 uppercase">Dirección</p>
                <p className="text-gray-800">{order.shippingAddress.street}</p>
                <p className="text-gray-800">{order.shippingAddress.city}, {order.shippingAddress.province}</p>
                <p className="text-gray-800">CP: {order.shippingAddress.postalCode}</p>
              </div>
              <div className="space-y-2">
                <p className="text-xs font-bold text-gray-400 uppercase">Método</p>
                <p className="text-gray-800">{order.shipping.method || 'Estándar'}</p>
                {order.shipping.trackingNumber && (
                  <p className="text-sm text-blue-600">Seguimiento: {order.shipping.trackingNumber}</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Status & Customer Info */}
        <div className="space-y-6">
          <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-100">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              {getStatusIcon(order.status)}
              Gestión de Estado
            </h2>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">Cambiar estado a:</label>
                <select 
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full rounded-lg border border-gray-200 p-2 outline-none focus:border-blue-500"
                >
                  <option value="pending_payment">Pago Pendiente</option>
                  <option value="confirmed">Confirmado</option>
                  <option value="preparing">En Preparación</option>
                  <option value="shipped">Enviado</option>
                  <option value="delivered">Entregado</option>
                  <option value="cancelled">Cancelado</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">Nota (opcional):</label>
                <textarea 
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="w-full rounded-lg border border-gray-200 p-2 outline-none focus:border-blue-500"
                  rows={2}
                />
              </div>
              <button 
                onClick={handleUpdateStatus}
                disabled={updating || newStatus === order.status}
                className="w-full flex items-center justify-center gap-2 rounded-lg bg-blue-600 py-2 font-medium text-white transition-colors hover:bg-blue-700 disabled:bg-gray-300"
              >
                {updating ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                Actualizar Estado
              </button>
            </div>
          </div>

          <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-100">
            <h2 className="text-lg font-semibold mb-4 border-b pb-2">Información del Cliente</h2>
            <div className="space-y-3">
              <p className="font-bold text-gray-900">{order.customer.fullName}</p>
              <p className="text-sm text-gray-600">{order.customer.email}</p>
              <p className="text-sm text-gray-600">{order.customer.phone}</p>
              {order.whatsappConsent && (
                <span className="inline-flex rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800">
                  WhatsApp Consentido
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetail;
