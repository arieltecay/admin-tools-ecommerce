import { useState, useEffect } from 'react';
import api from '../../services/api';
import { IBrand } from '../../types';
import { Plus, Edit2, Trash2, Loader2 } from 'lucide-react';
import Modal from '../../components/common/Modal';
import ConfirmModal from '../../components/common/ConfirmModal';
import AlertModal from '../../components/common/AlertModal';

const BrandList = () => {
  const [brands, setBrands] = useState<IBrand[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingBrand, setEditingBrand] = useState<IBrand | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  
  // Modal states
  const [confirmDelete, setConfirmDelete] = useState<{ isOpen: boolean, name: string }>({ isOpen: false, name: '' });
  const [alert, setAlert] = useState<{ isOpen: boolean, title: string, message: string, type: 'success' | 'error' | 'info' }>({ 
    isOpen: false, title: '', message: '', type: 'info' 
  });

  const [formData, setFormData] = useState({
    name: '',
    logo: ''
  });

  useEffect(() => {
    fetchBrands();
  }, []);

  const fetchBrands = async () => {
    setLoading(true);
    try {
      const response = await api.get<IBrand[]>('/brands');
      setBrands(response.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (brand: IBrand) => {
    setEditingBrand(brand);
    setFormData({ name: brand.name, logo: brand.logo || '' });
    setIsFormOpen(true);
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/brands/${confirmDelete.name}`);
      fetchBrands();
      setAlert({ isOpen: true, title: 'Éxito', message: 'Marca eliminada correctamente', type: 'success' });
    } catch (err) {
      console.error(err);
      setAlert({ isOpen: true, title: 'Error', message: 'No se pudo eliminar la marca', type: 'error' });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingBrand) {
        await api.patch(`/brands/${editingBrand.name}`, formData);
      } else {
        await api.post('/brands', formData);
      }
      setIsFormOpen(false);
      setEditingBrand(null);
      setFormData({ name: '', logo: '' });
      fetchBrands();
      setAlert({ 
        isOpen: true, 
        title: 'Éxito', 
        message: `Marca ${editingBrand ? 'actualizada' : 'creada'} correctamente`, 
        type: 'success' 
      });
    } catch (err) {
      console.error(err);
      setAlert({ isOpen: true, title: 'Error', message: 'Error al guardar la marca', type: 'error' });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Marcas</h1>
        <button 
          onClick={() => { setEditingBrand(null); setFormData({ name: '', logo: '' }); setIsFormOpen(true); }}
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700 transition-colors"
        >
          <Plus size={18} /> Nueva Marca
        </button>
      </div>

      <Modal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title={editingBrand ? 'Editar Marca' : 'Nueva Marca'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Nombre de la Marca</label>
            <input 
              type="text" value={formData.name} 
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full rounded-lg border border-gray-200 p-2 outline-none focus:border-blue-500"
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Logo URL (opcional)</label>
            <input 
              type="text" value={formData.logo} 
              onChange={(e) => setFormData({ ...formData, logo: e.target.value })}
              className="w-full rounded-lg border border-gray-200 p-2 outline-none focus:border-blue-500"
            />
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
        onClose={() => setConfirmDelete({ isOpen: false, name: '' })}
        onConfirm={handleDelete}
        title="Eliminar Marca"
        message={`¿Estás seguro de que deseas eliminar la marca ${confirmDelete.name}?`}
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
              <th className="px-6 py-4 text-sm font-semibold text-gray-600">Marca</th>
              <th className="px-6 py-4 text-sm font-semibold text-gray-600 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr>
                <td colSpan={2} className="px-6 py-8 text-center text-gray-500">
                  <Loader2 className="animate-spin mx-auto mb-2" size={24} />
                  Cargando marcas...
                </td>
              </tr>
            ) : brands.length === 0 ? (
              <tr>
                <td colSpan={2} className="px-6 py-8 text-center text-gray-500">No hay marcas registradas.</td>
              </tr>
            ) : (
              brands.map((brand) => (
                <tr key={brand._id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {brand.logo ? (
                        <img src={brand.logo} alt={brand.name} className="h-8 w-8 object-contain" />
                      ) : (
                        <div className="h-8 w-8 rounded bg-gray-100 flex items-center justify-center text-[10px] text-gray-400 font-bold">
                          LOGO
                        </div>
                      )}
                      <span className="font-medium text-gray-800">{brand.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => handleEdit(brand)} className="p-1 text-gray-400 hover:text-blue-600 transition-colors">
                        <Edit2 size={18} />
                      </button>
                      <button 
                        onClick={() => setConfirmDelete({ isOpen: true, name: brand.name })} 
                        className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default BrandList;
