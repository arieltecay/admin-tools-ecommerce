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
  const [paymentStatus, setPaymentStatus] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [note, setNote] = useState('');

  const [alert, setAlert] = useState<{ isOpen: boolean, title: string, message: string, type: 'success' | 'error' }>({
    isOpen: false, title: '', message: '', type: 'success'
  });

  useEffect(() => { fetchOrder(); }, [id]);

  const fetchOrder = async () => {
    setLoading(true);
    try {
      const response = await api.get<IOrder>(`/orders/${id}`);
      setOrder(response.data);
      setNewStatus(response.data.status);
      setPaymentStatus(response.data.payment?.status || 'pending');
      setPaymentMethod(response.data.payment?.method || 'bank_transfer');
      setNote('');
    } catch (err) { navigate('/admin/orders'); } finally { setLoading(false); }
  };

  const handleUpdate = async () => {
    setLoadingUpdating(true);
    try {
      await api.patch(`/orders/${id}/status`, { status: newStatus, paymentStatus, paymentMethod, note });
      await fetchOrder();
      setAlert({ isOpen: true, title: 'Éxito', message: 'Actualizado', type: 'success' });
    } catch (err) { setAlert({ isOpen: true, title: 'Error', message: 'No se pudo actualizar', type: 'error' }); } finally { setLoadingUpdating(false); }
  };

  if (loading || !order) return <div className="flex h-64 items-center justify-center"><Loader2 className="animate-spin text-blue-600" size={32} /></div>;

  const inputClass = "w-full rounded-lg border border-gray-100 bg-gray-50 px-3 py-2 text-xs font-bold outline-none focus:ring-1 focus:ring-blue-500 transition-all";
  const labelClass = "text-[9px] font-black uppercase text-gray-400 tracking-widest ml-1";

  return (
    <div className="space-y-4 max-w-6xl mx-auto">
      <div className="flex items-center gap-2">
        <button onClick={() => navigate('/admin/orders')} className="rounded-full p-1.5 hover:bg-gray-100 text-gray-400"><ArrowLeft size={16} /></button>
        <h1 className="text-base font-black text-gray-900 uppercase tracking-tight italic">Pedido #{order.orderNumber}</h1>
      </div>

      <AlertModal isOpen={alert.isOpen} onClose={() => setAlert({ ...alert, isOpen: false })} title={alert.title} message={alert.message} type={alert.type} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-4">
          <div className="rounded-xl bg-white p-5 shadow-sm border border-gray-100">
            <h2 className="text-[9px] font-black uppercase text-blue-600 mb-4 tracking-widest border-b border-gray-50 pb-2">Herramientas en el Pedido</h2>
            <div className="divide-y divide-gray-50">
              {order.items.map((item, idx) => (
                <div key={idx} className="py-3 flex items-center gap-4">
                  <div className="h-12 w-12 bg-gray-50 rounded-lg border border-gray-100 overflow-hidden p-1 flex-shrink-0">
                    <img src={item.product.primaryImageUrl} alt="" className="h-full w-full object-contain" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-gray-900 text-xs leading-tight line-clamp-1 uppercase italic tracking-tighter">{item.product.name}</p>
                    <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">SKU: {item.product.sku}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-[9px] font-bold text-gray-400">{item.quantity} x ${item.unitPrice.toLocaleString()}</p>
                    <p className="font-black text-xs text-gray-900 italic tracking-tighter">${item.subtotal.toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-4 pt-4 border-t border-dashed space-y-2">
              <div className="flex justify-between text-[11px] font-bold text-gray-500">
                <span className="uppercase tracking-widest">Subtotal</span>
                <span>${order.pricing.subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-[11px] font-bold text-gray-500">
                <span className="uppercase tracking-widest">Envío</span>
                <span className="text-green-600 font-black italic">GRATIS</span>
              </div>
              <div className="flex justify-between items-center pt-3 border-t border-gray-900">
                <span className="text-[11px] font-black uppercase text-gray-900 italic tracking-tighter">Monto Total</span>
                <span className="text-xl font-black text-blue-600 italic tracking-tighter">${order.pricing.total.toLocaleString()}</span>
              </div>
            </div>
          </div>

          <div className="rounded-xl bg-white p-5 shadow-sm border border-gray-100">
            <h2 className="text-[9px] font-black uppercase text-blue-600 mb-4 tracking-widest border-b border-gray-50 pb-2">Entrega y Cobro</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Dirección de Entrega</p>
                <div className="space-y-0.5">
                  <p className="text-sm font-black text-gray-900 uppercase italic tracking-tighter leading-none">{order.shippingAddress?.street}</p>
                  <p className="text-[11px] text-gray-600 font-bold uppercase">{order.shippingAddress?.city}, {order.shippingAddress?.province}</p>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">CP: {order.shippingAddress?.postalCode}</p>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <label className={labelClass}>Medio de Pago</label>
                  <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)} className={inputClass}>
                    <option value="bank_transfer">TRANSFERENCIA BANCARIA</option>
                    <option value="card">TARJETA CRÉDITO/DÉBITO</option>
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Estado del Pago</label>
                  <select value={paymentStatus} onChange={(e) => setPaymentStatus(e.target.value)} className={`${inputClass} ${paymentStatus === 'confirmed' ? 'bg-green-50 text-green-700' : 'bg-yellow-50 text-yellow-700'}`}>
                    <option value="pending">PENDIENTE DE PAGO</option>
                    <option value="confirmed">PAGADO / CONFIRMADO</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-xl bg-white p-5 shadow-sm border border-gray-100 space-y-4">
            <h2 className="text-[9px] font-black uppercase text-blue-600 tracking-widest border-b border-gray-50 pb-2 flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" /> Gestión</h2>
            <div className="space-y-4">
              <div>
                <label className={labelClass}>Logística</label>
                <select value={newStatus} onChange={(e) => setNewStatus(e.target.value)} className={inputClass}>
                  <option value="pending_payment">ESPERANDO PAGO</option>
                  <option value="confirmed">CONFIRMADO</option>
                  <option value="preparing">EN PREPARACIÓN</option>
                  <option value="shipped">EN TRÁNSITO</option>
                  <option value="delivered">ENTREGADO</option>
                  <option value="cancelled">CANCELADO</option>
                </select>
              </div>
              <div>
                <label className={labelClass}>Nota Interna</label>
                <textarea value={note} placeholder="Notas rápidas..." onChange={(e) => setNote(e.target.value)} className={inputClass} rows={2} />
              </div>
              <button onClick={handleUpdate} disabled={updating} className="w-full py-2.5 rounded-lg bg-gray-900 text-[10px] font-black uppercase tracking-widest text-white transition-all hover:bg-black active:scale-95 disabled:bg-gray-200">
                {updating ? <Loader2 className="animate-spin mx-auto" size={14} /> : 'Guardar Cambios'}
              </button>
            </div>
          </div>

          <div className="rounded-xl bg-white p-5 shadow-sm border border-gray-100">
            <h2 className="text-[9px] font-black uppercase text-blue-600 tracking-widest border-b border-gray-50 pb-2 mb-4">Cliente</h2>
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 font-black text-xs uppercase italic">{order.customer.fullName.charAt(0)}</div>
              <div className="min-w-0">
                <p className="font-black text-gray-900 text-[11px] leading-tight line-clamp-1 uppercase italic tracking-tighter">{order.customer.fullName}</p>
                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest truncate">{order.customer.email}</p>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-50 space-y-1">
              <p className="text-[10px] font-bold text-gray-600 uppercase italic tracking-tighter">📞 {order.customer.phone}</p>
              {order.whatsappConsent && <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-green-50 text-green-700 text-[8px] font-black uppercase tracking-widest">WhatsApp OK</div>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetail;
