import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2, Package, Truck, CheckCircle, XCircle, Clock, Save, CreditCard, DollarSign } from 'lucide-react';
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
  const [paymentStatus, setPaymentStatus] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [note, setNote] = useState('');

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
      setPaymentStatus(response.data.payment?.status || 'pending');
      setPaymentMethod(response.data.payment?.method || 'bank_transfer');
      setNote('');
    } catch (err) {
      console.error(err);
      navigate('/admin/orders');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    setLoadingUpdating(true);
    try {
      await api.patch(`/orders/${id}/status`, { 
        status: newStatus, 
        paymentStatus,
        paymentMethod,
        note 
      });
      await fetchOrder();
      setAlert({ isOpen: true, title: 'Éxito', message: 'Pedido actualizado correctamente', type: 'success' });
    } catch (err) {
      console.error(err);
      setAlert({ isOpen: true, title: 'Error', message: 'No se pudo actualizar el pedido', type: 'error' });
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
        <h1 className="text-2xl font-black text-gray-900 uppercase tracking-tighter">Pedido #{order.orderNumber}</h1>
      </div>

      <AlertModal
        isOpen={alert.isOpen}
        onClose={() => setAlert({ ...alert, isOpen: false })}
        title={alert.title}
        message={alert.message}
        type={alert.type}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Items Table */}
          <div className="rounded-3xl bg-white p-8 shadow-sm border border-gray-100">
            <h2 className="text-xs font-black uppercase text-gray-400 mb-6 tracking-widest">Herramientas en el Pedido</h2>
            <div className="divide-y">
              {order.items.map((item, idx) => (
                <div key={idx} className="py-5 flex items-center gap-6 group">
                  <div className="h-20 w-20 bg-gray-50 rounded-2xl border border-gray-100 overflow-hidden p-2 flex-shrink-0 group-hover:scale-105 transition-transform">
                    <img src={item.product.primaryImageUrl} alt="" className="h-full w-full object-contain" />
                  </div>
                  <div className="flex-1">
                    <p className="font-black text-gray-900 text-lg leading-tight">{item.product.name}</p>
                    <p className="text-[10px] font-black text-gray-400 uppercase mt-1">SKU: {item.product.sku}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-bold text-gray-500">{item.quantity} x ${item.unitPrice.toLocaleString()}</p>
                    <p className="font-black text-xl text-gray-900">${item.subtotal.toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-8 pt-6 border-t border-dashed space-y-3">
              <div className="flex justify-between text-sm font-bold text-gray-500">
                <span>Subtotal</span>
                <span>${order.pricing.subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm font-bold text-gray-500">
                <span>Costo de Envío</span>
                <span className="text-green-600">Gratis</span>
              </div>
              <div className="flex justify-between items-center pt-4 border-t-2 border-gray-900">
                <span className="text-lg font-black uppercase text-gray-900">Monto Total</span>
                <span className="text-3xl font-black text-blue-600">${order.pricing.total.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Delivery & Payment Settings */}
          <div className="rounded-3xl bg-white p-8 shadow-sm border border-gray-100">
            <h2 className="text-xs font-black uppercase text-gray-400 mb-6 tracking-widest">Información de Entrega y Cobro</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <div className="space-y-4">
                <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Dirección de Entrega</p>
                <div className="space-y-1">
                  <p className="text-xl font-black text-gray-900 leading-tight">{order.shippingAddress?.street}</p>
                  <p className="text-gray-600 font-bold">{order.shippingAddress?.city}, {order.shippingAddress?.province}</p>
                  <p className="text-gray-400 font-bold">Código Postal: {order.shippingAddress?.postalCode}</p>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-3">Medio de Pago</p>
                  <select 
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-full rounded-xl border-gray-100 bg-gray-50 px-4 py-3 text-sm font-black text-gray-900 outline-none focus:ring-2 focus:ring-blue-500 appearance-none transition-all"
                  >
                    <option value="bank_transfer">TRANSFERENCIA BANCARIA</option>
                    <option value="card">TARJETA CRÉDITO/DÉBITO</option>
                  </select>
                </div>

                <div>
                  <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-3">Estado del Pago</p>
                  <select 
                    value={paymentStatus}
                    onChange={(e) => setPaymentStatus(e.target.value)}
                    className={`w-full rounded-xl border-none px-4 py-3 text-sm font-black outline-none focus:ring-2 focus:ring-blue-500 appearance-none transition-all ${
                      paymentStatus === 'confirmed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    }`}
                  >
                    <option value="pending">PENDIENTE DE PAGO</option>
                    <option value="confirmed">PAGADO / CONFIRMADO</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Status & Sidebar */}
        <div className="space-y-6">
          <div className="rounded-3xl bg-white p-8 shadow-sm border border-gray-100">
            <h2 className="text-xs font-black uppercase text-gray-400 mb-6 tracking-widest flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
              Gestión del Pedido
            </h2>
            <div className="space-y-5">
              <div>
                <label className="text-[10px] font-black uppercase text-gray-400 ml-1">Estado Logístico</label>
                <select 
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full mt-1 rounded-xl border-gray-100 bg-gray-50 px-4 py-3 text-sm font-black text-gray-900 outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="pending_payment">ESPERANDO PAGO</option>
                  <option value="confirmed">CONFIRMADO</option>
                  <option value="preparing">EN PREPARACIÓN</option>
                  <option value="shipped">ENVIADO / EN TRÁNSITO</option>
                  <option value="delivered">ENTREGADO</option>
                  <option value="cancelled">CANCELADO</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] font-black uppercase text-gray-400 ml-1">Nota del Administrador</label>
                <textarea 
                  value={note}
                  placeholder="Ej: Pago verificado por CBU..."
                  onChange={(e) => setNote(e.target.value)}
                  className="w-full mt-1 rounded-xl border-gray-100 bg-gray-50 px-4 py-3 text-sm font-bold text-gray-900 outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                />
              </div>
              <button 
                onClick={handleUpdate}
                disabled={updating}
                className="w-full flex items-center justify-center gap-2 rounded-2xl bg-gray-900 py-4 font-black uppercase text-xs tracking-widest text-white transition-all hover:bg-black hover:shadow-xl hover:-translate-y-1 disabled:bg-gray-200"
              >
                {updating ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                Guardar Cambios
              </button>
            </div>
          </div>

          <div className="rounded-3xl bg-white p-8 shadow-sm border border-gray-100">
            <h2 className="text-xs font-black uppercase text-gray-400 mb-6 tracking-widest">Perfil del Cliente</h2>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 font-black">
                  {order.customer.fullName.charAt(0)}
                </div>
                <div>
                  <p className="font-black text-gray-900 leading-tight">{order.customer.fullName}</p>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-tighter">ID: {order.customer.idNumber || 'N/A'}</p>
                </div>
              </div>
              <div className="space-y-2 pt-4 border-t border-gray-50">
                <p className="text-sm font-bold text-gray-600 flex items-center gap-2">
                  <div className="w-1 h-1 rounded-full bg-gray-300" /> {order.customer.email}
                </p>
                <p className="text-sm font-bold text-gray-600 flex items-center gap-2">
                  <div className="w-1 h-1 rounded-full bg-gray-300" /> {order.customer.phone}
                </p>
              </div>
              {order.whatsappConsent && (
                <div className="mt-4 flex items-center gap-2 rounded-xl bg-green-50 px-3 py-2 text-[10px] font-black uppercase text-green-700">
                  <CheckCircle size={14} /> WhatsApp Autorizado
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetail;
