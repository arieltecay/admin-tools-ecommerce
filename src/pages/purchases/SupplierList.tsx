import { useState, useEffect } from 'react';
import api from '../../services/api';
import { Plus, Edit2, Trash2, Loader2, Mail, Phone, X } from 'lucide-react';
import { ISupplier } from '../../types';
import Modal from '../../components/common/Modal';
import ConfirmModal from '../../components/common/ConfirmModal';
import AlertModal from '../../components/common/AlertModal';

const SupplierList = () => {
  const [suppliers, setSuppliers] = useState<ISupplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<ISupplier | null>(null);

  const [confirmDelete, setConfirmDelete] = useState<{ isOpen: boolean, id: string, name: string }>({ isOpen: false, id: '', name: '' });
  const [alert, setAlert] = useState<{ isOpen: boolean, title: string, message: string, type: 'success' | 'error' | 'info' }>({ 
    isOpen: false, title: '', message: '', type: 'info' 
  });

  const [formData, setFormData] = useState({ name: '', taxId: '', contact: { email: '', phone: '' } });

  useEffect(() => { fetchSuppliers(); }, []);

  const fetchSuppliers = async () => {
    setLoading(true);
    try {
      const response = await api.get<ISupplier[]>('/suppliers');
      setSuppliers(response.data);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  const handleEdit = (supplier: ISupplier) => {
    setEditingSupplier(supplier);
    setFormData({ name: supplier.name, taxId: supplier.taxId, contact: { ...supplier.contact } });
    setIsFormOpen(true);
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/suppliers/${confirmDelete.id}`);
      fetchSuppliers();
      setAlert({ isOpen: true, title: 'Éxito', message: 'Eliminado', type: 'success' });
      setConfirmDelete({ ...confirmDelete, isOpen: false });
    } catch (err) { setAlert({ isOpen: true, title: 'Error', message: 'Error al eliminar', type: 'error' }); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingSupplier) await api.patch(`/suppliers/${editingSupplier._id}`, formData);
      else await api.post('/suppliers', formData);
      setIsFormOpen(false);
      fetchSuppliers();
      setAlert({ isOpen: true, title: 'Éxito', message: 'Guardado', type: 'success' });
    } catch (err) { setAlert({ isOpen: true, title: 'Error', message: 'Error al guardar', type: 'error' }); }
  };

  const inputClass = "w-full rounded-lg border border-gray-100 bg-gray-50 px-2 py-1.5 text-[11px] font-bold outline-none focus:border-blue-500 transition-all";
  const labelClass = "text-[8px] font-black uppercase text-gray-400 tracking-widest ml-1";

  return (
    <div className="space-y-4">
      {/* Header Compacto */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-black text-gray-900 uppercase tracking-tight">Proveedores</h1>
          <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">{suppliers.length} Registrados</p>
        </div>
        <button 
          onClick={() => { setEditingSupplier(null); setFormData({ name: '', taxId: '', contact: { email: '', phone: '' } }); setIsFormOpen(true); }}
          className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-[9px] font-black uppercase tracking-widest text-white hover:bg-blue-700 shadow-md transition-all"
        >
          <Plus size={14} /> Nuevo
        </button>
      </div>

      <Modal isOpen={isFormOpen} onClose={() => setIsFormOpen(false)} title={editingSupplier ? 'Editar Proveedor' : 'Nuevo Proveedor'}>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="space-y-1">
            <label className={labelClass}>Razón Social</label>
            <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className={inputClass} required />
          </div>
          <div className="space-y-1">
            <label className={labelClass}>CUIT</label>
            <input type="text" value={formData.taxId} onChange={(e) => setFormData({ ...formData, taxId: e.target.value })} className={inputClass} required />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <label className={labelClass}>Email</label>
              <input type="email" value={formData.contact.email} onChange={(e) => setFormData({ ...formData, contact: { ...formData.contact, email: e.target.value } })} className={inputClass} />
            </div>
            <div className="space-y-1">
              <label className={labelClass}>Teléfono</label>
              <input type="tel" value={formData.contact.phone} onChange={(e) => setFormData({ ...formData, contact: { ...formData.contact, phone: e.target.value } })} className={inputClass} />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-3">
            <button type="button" onClick={() => setIsFormOpen(false)} className="text-[10px] font-black uppercase text-gray-400 px-3 py-1.5">Cancelar</button>
            <button type="submit" className="bg-blue-600 text-white rounded-lg px-4 py-1.5 text-[10px] font-black uppercase tracking-widest shadow-md">Guardar</button>
          </div>
        </form>
      </Modal>

      <ConfirmModal isOpen={confirmDelete.isOpen} onClose={() => setConfirmDelete({ ...confirmDelete, isOpen: false })} onConfirm={handleDelete} title="Eliminar" message={`¿Eliminar ${confirmDelete.name}?`} type="danger" confirmText="Borrar" />
      <AlertModal isOpen={alert.isOpen} onClose={() => setAlert({ ...alert, isOpen: false })} title={alert.title} message={alert.message} type={alert.type} />

      {/* Table con Scroll Horizontal Seguro */}
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-gray-200">
          <table className="w-full text-left min-w-[600px]">
            <thead className="border-b bg-gray-50/50">
              <tr>
                <th className="px-4 py-3 text-[9px] font-black uppercase tracking-widest text-gray-400">Proveedor</th>
                <th className="px-4 py-3 text-[9px] font-black uppercase tracking-widest text-gray-400">CUIT</th>
                <th className="px-4 py-3 text-[9px] font-black uppercase tracking-widest text-gray-400">Contacto</th>
                <th className="px-4 py-3 text-[9px] font-black uppercase tracking-widest text-gray-400 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan={4} className="px-4 py-10 text-center"><Loader2 className="animate-spin text-blue-600 mx-auto" size={24} /></td></tr>
              ) : suppliers.map((s) => (
                <tr key={s._id} className="hover:bg-blue-50/20 transition-all group">
                  <td className="px-4 py-2 text-[11px] font-bold text-gray-900 uppercase tracking-tighter">{s.name}</td>
                  <td className="px-4 py-2 text-[10px] font-mono text-gray-400">{s.taxId}</td>
                  <td className="px-4 py-2">
                    <div className="flex flex-col gap-0.5">
                      <p className="flex items-center gap-1.5 text-[10px] font-bold text-gray-600"><Mail size={10} className="text-gray-300" /> {s.contact.email}</p>
                      <p className="flex items-center gap-1.5 text-[10px] font-bold text-gray-600"><Phone size={10} className="text-gray-300" /> {s.contact.phone}</p>
                    </div>
                  </td>
                  <td className="px-4 py-2 text-right">
                    <div className="flex justify-end gap-1">
                      <button onClick={() => handleEdit(s)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-all"><Edit2 size={14} /></button>
                      <button onClick={() => setConfirmDelete({ isOpen: true, id: s._id, name: s.name })} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-all"><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SupplierList;
