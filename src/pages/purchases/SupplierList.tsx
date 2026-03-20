import { useState, useEffect } from 'react';
import api from '../../services/api';
import { Plus, Edit2, Trash2, Loader2, Mail, Phone } from 'lucide-react';
import { ISupplier } from '../../types';
import Modal from '../../components/common/Modal';
import ConfirmModal from '../../components/common/ConfirmModal';
import AlertModal from '../../components/common/AlertModal';

const SupplierList = () => {
  const [suppliers, setSuppliers] = useState<ISupplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<ISupplier | null>(null);

  // Modal states
  const [confirmDelete, setConfirmDelete] = useState<{ isOpen: boolean, id: string, name: string }>({ isOpen: false, id: '', name: '' });
  const [alert, setAlert] = useState<{ isOpen: boolean, title: string, message: string, type: 'success' | 'error' | 'info' }>({ 
    isOpen: false, title: '', message: '', type: 'info' 
  });

  const [formData, setFormData] = useState({
    name: '',
    taxId: '',
    contact: { email: '', phone: '' }
  });

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const fetchSuppliers = async () => {
    setLoading(true);
    try {
      const response = await api.get<ISupplier[]>('/suppliers');
      setSuppliers(response.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (supplier: ISupplier) => {
    setEditingSupplier(supplier);
    setFormData({
      name: supplier.name,
      taxId: supplier.taxId,
      contact: { ...supplier.contact }
    });
    setIsFormOpen(true);
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/suppliers/${confirmDelete.id}`);
      fetchSuppliers();
      setAlert({ isOpen: true, title: 'Éxito', message: 'Proveedor eliminado correctamente', type: 'success' });
    } catch (err) {
      console.error(err);
      setAlert({ isOpen: true, title: 'Error', message: 'No se pudo eliminar el proveedor', type: 'error' });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingSupplier) {
        await api.patch(`/suppliers/${editingSupplier._id}`, formData);
      } else {
        await api.post('/suppliers', formData);
      }
      setIsFormOpen(false);
      fetchSuppliers();
      setAlert({ 
        isOpen: true, 
        title: 'Éxito', 
        message: `Proveedor ${editingSupplier ? 'actualizado' : 'creado'} correctamente`, 
        type: 'success' 
      });
    } catch (err) {
      console.error(err);
      setAlert({ isOpen: true, title: 'Error', message: 'Error al guardar proveedor', type: 'error' });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Proveedores</h1>
        <button 
          onClick={() => { setEditingSupplier(null); setFormData({ name: '', taxId: '', contact: { email: '', phone: '' } }); setIsFormOpen(true); }}
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700 transition-colors"
        >
          <Plus size={18} /> Nuevo Proveedor
        </button>
      </div>

      <Modal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title={editingSupplier ? 'Editar Proveedor' : 'Nuevo Proveedor'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Nombre / Razón Social</label>
            <input 
              type="text" value={formData.name} 
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full rounded-lg border border-gray-200 p-2 outline-none focus:border-blue-500"
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">CUIT</label>
            <input 
              type="text" value={formData.taxId} 
              onChange={(e) => setFormData({ ...formData, taxId: e.target.value })}
              className="w-full rounded-lg border border-gray-200 p-2 outline-none focus:border-blue-500"
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Email de contacto</label>
            <input 
              type="email" value={formData.contact.email} 
              onChange={(e) => setFormData({ ...formData, contact: { ...formData.contact, email: e.target.value } })}
              className="w-full rounded-lg border border-gray-200 p-2 outline-none focus:border-blue-500"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Teléfono</label>
            <input 
              type="tel" value={formData.contact.phone} 
              onChange={(e) => setFormData({ ...formData, contact: { ...formData.contact, phone: e.target.value } })}
              className="w-full rounded-lg border border-gray-200 p-2 outline-none focus:border-blue-500"
            />
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <button type="button" onClick={() => setIsFormOpen(false)} className="px-4 py-2 text-sm text-gray-600">Cancelar</button>
            <button type="submit" className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium">Guardar</button>
          </div>
        </form>
      </Modal>

      <ConfirmModal
        isOpen={confirmDelete.isOpen}
        onClose={() => setConfirmDelete({ isOpen: false, id: '', name: '' })}
        onConfirm={handleDelete}
        title="Eliminar Proveedor"
        message={`¿Estás seguro de que deseas eliminar el proveedor ${confirmDelete.name}?`}
        type="danger"
        confirmText="Eliminar"
      />

      <AlertModal
        isOpen={alert.isOpen}
        onClose={() => setAlert({ ...alert, isOpen: false })}
        title={alert.title}
        message={alert.message}
        type={alert.type as any}
      />

      <div className="rounded-xl border border-gray-100 bg-white shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="border-b bg-gray-50">
            <tr>
              <th className="px-6 py-4 text-sm font-semibold text-gray-600">Proveedor</th>
              <th className="px-6 py-4 text-sm font-semibold text-gray-600">CUIT</th>
              <th className="px-6 py-4 text-sm font-semibold text-gray-600">Contacto</th>
              <th className="px-6 py-4 text-sm font-semibold text-gray-600 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr><td colSpan={4} className="px-6 py-8 text-center text-gray-500">Cargando...</td></tr>
            ) : suppliers.map((s) => (
              <tr key={s._id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 font-medium text-gray-800">{s.name}</td>
                <td className="px-6 py-4 text-sm text-gray-600">{s.taxId}</td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  <p className="flex items-center gap-1"><Mail size={14} /> {s.contact.email}</p>
                  <p className="flex items-center gap-1"><Phone size={14} /> {s.contact.phone}</p>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end gap-2">
                    <button onClick={() => handleEdit(s)} className="p-1 text-gray-400 hover:text-blue-600"><Edit2 size={18} /></button>
                    <button 
                      onClick={() => setConfirmDelete({ isOpen: true, id: s._id, name: s.name })}
                      className="p-1 text-gray-400 hover:text-red-600"
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

export default SupplierList;
