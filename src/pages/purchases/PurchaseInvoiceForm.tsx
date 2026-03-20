import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Save, ArrowLeft, Loader2, Plus, Trash2, Search } from 'lucide-react';
import api from '../../services/api';
import { ISupplier, IProduct } from '../../types';
import AlertModal from '../../components/common/AlertModal';

const PurchaseInvoiceForm = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [suppliers, setSuppliers] = useState<ISupplier[]>([]);
  const [products, setProducts] = useState<IProduct[]>([]);
  const [productSearch, setProductSearch] = useState('');

  // Modal state
  const [alert, setAlert] = useState<{ isOpen: boolean, title: string, message: string, type: 'success' | 'error' | 'info' }>({
    isOpen: false, title: '', message: '', type: 'info'
  });

  const [formData, setFormData] = useState({
    invoiceNumber: '',
    invoiceDate: new Date().toISOString().split('T')[0],
    supplier: { _id: '', name: '' },
    invoiceType: 'A',
    paymentTerms: 'cash',
    items: [] as any[],
    totalAmount: 0
  });

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      const [suppRes, prodRes] = await Promise.all([
        api.get<ISupplier[]>('/suppliers'),
        api.get<{ products: IProduct[] }>('/products', { params: { limit: 100 } })
      ]);
      setSuppliers(suppRes.data);
      setProducts(prodRes.data.products);
    } catch (err) {
      console.error(err);
    }
  };

  const addItem = (product: IProduct) => {
    const existing = formData.items.find(item => item.product._id === product._id);
    if (existing) return;

    const newItem = {
      product: {
        _id: product._id,
        uuid: product.uuid,
        sku: product.sku,
        name: product.name
      },
      quantity: 1,
      unitCost: product.costPrice || 0,
      subtotal: product.costPrice || 0
    };

    const newItems = [...formData.items, newItem];
    setFormData({ ...formData, items: newItems, totalAmount: calculateTotal(newItems) });
  };

  const removeItem = (index: number) => {
    const newItems = formData.items.filter((_, i) => i !== index);
    setFormData({ ...formData, items: newItems, totalAmount: calculateTotal(newItems) });
  };

  const updateItem = (index: number, field: string, value: any) => {
    const newItems = [...formData.items];
    newItems[index][field] = value;
    if (field === 'quantity' || field === 'unitCost') {
      newItems[index].subtotal = newItems[index].quantity * newItems[index].unitCost;
    }
    setFormData({ ...formData, items: newItems, totalAmount: calculateTotal(newItems) });
  };

  const calculateTotal = (items: any[]) => {
    return items.reduce((sum, item) => sum + item.subtotal, 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.items.length === 0) {
      setAlert({ isOpen: true, title: 'Atención', message: 'Debes agregar al menos un producto', type: 'info' });
      return;
    }
    if (!formData.supplier._id) {
      setAlert({ isOpen: true, title: 'Atención', message: 'Debes seleccionar un proveedor', type: 'info' });
      return;
    }

    setLoading(true);
    try {
      await api.post('/purchase-invoices', formData);
      setAlert({ isOpen: true, title: 'Éxito', message: 'Factura cargada correctamente', type: 'success' });
      setTimeout(() => navigate('/admin/purchases'), 1500);
    } catch (err) {
      console.error(err);
      setAlert({ isOpen: true, title: 'Error', message: 'Error al cargar la factura', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/admin/purchases')} className="rounded-full p-2 hover:bg-gray-100 transition-colors">
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-2xl font-bold text-gray-800">Cargar Factura de Compra</h1>
        </div>
        <button 
          onClick={handleSubmit} disabled={loading}
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-2 font-medium text-white hover:bg-blue-700 disabled:bg-gray-400"
        >
          {loading ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
          Guardar Factura
        </button>
      </div>

      <AlertModal
        isOpen={alert.isOpen}
        onClose={() => setAlert({ ...alert, isOpen: false })}
        title={alert.title}
        message={alert.message}
        type={alert.type as any}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-100 space-y-4">
            <h2 className="text-lg font-semibold">Datos de la Factura</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Nro Factura</label>
                <input 
                  type="text" value={formData.invoiceNumber} 
                  onChange={(e) => setFormData({ ...formData, invoiceNumber: e.target.value })}
                  className="w-full rounded-lg border border-gray-200 p-2" required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Fecha</label>
                <input 
                  type="date" value={formData.invoiceDate} 
                  onChange={(e) => setFormData({ ...formData, invoiceDate: e.target.value })}
                  className="w-full rounded-lg border border-gray-200 p-2" required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Proveedor</label>
                <select 
                  value={formData.supplier._id} 
                  onChange={(e) => {
                    const s = suppliers.find(s => s._id === e.target.value);
                    if (s) setFormData({ ...formData, supplier: { _id: s._id, name: s.name } });
                  }}
                  className="w-full rounded-lg border border-gray-200 p-2" required
                >
                  <option value="">Seleccionar...</option>
                  {suppliers.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Tipo</label>
                <select 
                  value={formData.invoiceType} 
                  onChange={(e) => setFormData({ ...formData, invoiceType: e.target.value })}
                  className="w-full rounded-lg border border-gray-200 p-2"
                >
                  <option value="A">Factura A</option>
                  <option value="B">Factura B</option>
                  <option value="C">Factura C</option>
                  <option value="delivery_note">Remito</option>
                </select>
              </div>
            </div>
          </div>

          <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-100 space-y-4">
            <h2 className="text-lg font-semibold">Ítems / Productos</h2>
            <div className="divide-y">
              {formData.items.map((item, idx) => (
                <div key={idx} className="py-4 grid grid-cols-12 gap-4 items-center">
                  <div className="col-span-5">
                    <p className="font-medium text-gray-800">{item.product.name}</p>
                    <p className="text-xs text-gray-500 uppercase">{item.product.sku}</p>
                  </div>
                  <div className="col-span-2">
                    <label className="text-[10px] text-gray-400 uppercase font-bold">Cant</label>
                    <input 
                      type="number" value={item.quantity} 
                      onChange={(e) => updateItem(idx, 'quantity', Number(e.target.value))}
                      className="w-full border-b focus:border-blue-500 outline-none p-1"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="text-[10px] text-gray-400 uppercase font-bold">Costo U.</label>
                    <input 
                      type="number" value={item.unitCost} 
                      onChange={(e) => updateItem(idx, 'unitCost', Number(e.target.value))}
                      className="w-full border-b focus:border-blue-500 outline-none p-1"
                    />
                  </div>
                  <div className="col-span-2 text-right">
                    <label className="text-[10px] text-gray-400 uppercase font-bold">Subtotal</label>
                    <p className="font-bold">${item.subtotal.toLocaleString()}</p>
                  </div>
                  <div className="col-span-1 text-right">
                    <button onClick={() => removeItem(idx)} className="text-red-400 hover:text-red-600"><Trash2 size={18} /></button>
                  </div>
                </div>
              ))}
            </div>
            {formData.items.length === 0 && <p className="text-center py-8 text-gray-400 italic">No hay productos agregados</p>}
            <div className="pt-4 border-t flex justify-between items-center">
              <span className="text-lg font-bold">Total Factura</span>
              <span className="text-2xl font-bold text-blue-600">${formData.totalAmount.toLocaleString()}</span>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-100 space-y-4">
            <h2 className="text-lg font-semibold">Agregar Producto</h2>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input 
                type="text" placeholder="Buscar por SKU o nombre..."
                value={productSearch} onChange={(e) => setProductSearch(e.target.value)}
                className="w-full rounded-lg border border-gray-200 pl-9 p-2 text-sm"
              />
            </div>
            <div className="max-h-96 overflow-y-auto space-y-2">
              {products.filter(p => p.name.toLowerCase().includes(productSearch.toLowerCase()) || p.sku.toLowerCase().includes(productSearch.toLowerCase()))
                .map(p => (
                  <button 
                    key={p._id} onClick={() => addItem(p)}
                    className="w-full text-left p-3 rounded-lg border hover:border-blue-500 hover:bg-blue-50 transition-colors"
                  >
                    <p className="text-sm font-medium">{p.name}</p>
                    <p className="text-xs text-gray-500 uppercase">{p.sku}</p>
                  </button>
                ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PurchaseInvoiceForm;
