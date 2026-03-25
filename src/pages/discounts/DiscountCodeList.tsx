import { useState, useEffect } from 'react';
import api from '../../services/api';
import { IDiscountCode } from '../../types';
import { Plus, Edit2, Trash2, Loader2 } from 'lucide-react';
import Modal from '../../components/common/Modal';
import ConfirmModal from '../../components/common/ConfirmModal';
import AlertModal from '../../components/common/AlertModal';

const DiscountCodeList = () => {
  const [codes, setCodes] = useState<IDiscountCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCode, setEditingCode] = useState<IDiscountCode | null>(null);

  // Modal states
  const [confirmDelete, setConfirmDelete] = useState<{ isOpen: boolean, id: string, code: string }>({ isOpen: false, id: '', code: '' });
  const [alert, setAlert] = useState<{ isOpen: boolean, title: string, message: string, type: 'success' | 'error' }>({ 
    isOpen: false, title: '', message: '', type: 'success' 
  });

  const [formData, setFormData] = useState<Partial<IDiscountCode>>({
    code: '',
    type: 'percentage',
    value: 0,
    minOrderAmount: undefined,
    isActive: true
  });

  useEffect(() => {
    fetchCodes();
  }, []);

  const fetchCodes = async () => {
    setLoading(true);
    try {
      const response = await api.get<IDiscountCode[]>('/discount-codes');
      setCodes(response.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/discount-codes/${confirmDelete.id}`);
      fetchCodes();
      setAlert({ isOpen: true, title: 'Éxito', message: 'Código de descuento eliminado', type: 'success' });
    } catch (err) {
      console.error(err);
      setAlert({ isOpen: true, title: 'Error', message: 'No se pudo eliminar el código', type: 'error' });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingCode) {
        await api.patch(`/discount-codes/${editingCode._id}`, formData);
      } else {
        await api.post('/discount-codes', formData);
      }
      setIsFormOpen(false);
      fetchCodes();
      setAlert({ 
        isOpen: true, 
        title: 'Éxito', 
        message: `Código ${editingCode ? 'actualizado' : 'creado'} correctamente`, 
        type: 'success' 
      });
    } catch (err) {
      console.error(err);
      setAlert({ isOpen: true, title: 'Error', message: 'Error al guardar el código', type: 'error' });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Códigos de Descuento</h1>
        <button 
          onClick={() => { setEditingCode(null); setFormData({ code: '', type: 'percentage', value: 0, minOrderAmount: undefined, isActive: true }); setIsFormOpen(true); }}
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700 transition-colors"
        >
          <Plus size={18} /> Nuevo Código
        </button>
      </div>

      <Modal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title={editingCode ? 'Editar Código' : 'Nuevo Código'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Código</label>
            <input 
              type="text" value={formData.code} 
              onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })} 
              className="w-full rounded-lg border border-gray-200 p-2 outline-none focus:border-blue-500 uppercase" 
              required 
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Tipo</label>
              <select 
                value={formData.type} 
                onChange={(e) => setFormData({ ...formData, type: e.target.value as IDiscountCode['type'] })} 
                className="w-full rounded-lg border border-gray-200 p-2 outline-none focus:border-blue-500"
              >
                <option value="percentage">Porcentaje (%)</option>
                <option value="fixed">Monto Fijo ($)</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Valor</label>
              <input 
                type="number" value={formData.value} 
                onChange={(e) => setFormData({ ...formData, value: Number(e.target.value) })} 
                className="w-full rounded-lg border border-gray-200 p-2 outline-none focus:border-blue-500" 
                required 
              />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <button 
              type="button" onClick={() => setIsFormOpen(false)}
              className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg"
            >
              Cancelar
            </button>
            <button 
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
            >
              Guardar
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmModal
        isOpen={confirmDelete.isOpen}
        onClose={() => setConfirmDelete({ isOpen: false, id: '', code: '' })}
        onConfirm={handleDelete}
        title="Eliminar Código"
        message={`¿Estás seguro de que deseas eliminar el código ${confirmDelete.code}?`}
        type="danger"
        confirmText="Eliminar"
      />

      <AlertModal
        isOpen={alert.isOpen}
        onClose={() => setAlert({ ...alert, isOpen: false })}
        title={alert.title}
        message={alert.message}
        type={alert.type}
      />

      <div className="rounded-xl border border-gray-100 bg-white shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="border-b bg-gray-50">
            <tr>
              <th className="px-6 py-4 text-sm font-semibold">Código</th>
              <th className="px-6 py-4 text-sm font-semibold">Descuento</th>
              <th className="px-6 py-4 text-sm font-semibold">Usos</th>
              <th className="px-6 py-4 text-sm font-semibold">Estado</th>
              <th className="px-6 py-4 text-sm font-semibold text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr><td colSpan={5} className="px-6 py-8 text-center"><Loader2 className="animate-spin mx-auto" /></td></tr>
            ) : codes.map((c) => (
              <tr key={c._id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 font-bold text-blue-600">{c.code}</td>
                <td className="px-6 py-4">{c.type === 'percentage' ? `${c.value}%` : `$${c.value}`}</td>
                <td className="px-6 py-4 text-gray-600">{c.usageCount}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${c.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {c.isActive ? 'Activo' : 'Pausado'}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end gap-2">
                    <button 
                      onClick={() => { setEditingCode(c); setFormData({ ...c }); setIsFormOpen(true); }} 
                      className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                    >
                      <Edit2 size={18} />
                    </button>
                    <button 
                      onClick={() => setConfirmDelete({ isOpen: true, id: c._id, code: c.code })} 
                      className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DiscountCodeList;
