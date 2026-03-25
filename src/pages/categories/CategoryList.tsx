import { useState, useEffect } from 'react';
import api from '../../services/api';
import { ICategory } from '../../types';
import { Plus, Edit2, Trash2, Loader2, Search } from 'lucide-react';
import Modal from '../../components/common/Modal';
import ConfirmModal from '../../components/common/ConfirmModal';
import AlertModal from '../../components/common/AlertModal';

const CategoryList = () => {
  const [categories, setCategories] = useState<ICategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingCategory, setEditingCategory] = useState<ICategory | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal states
  const [confirmDelete, setConfirmDelete] = useState<{ isOpen: boolean, uuid: string }>({ isOpen: false, uuid: '' });
  const [alert, setAlert] = useState<{ isOpen: boolean, title: string, message: string, type: 'success' | 'error' | 'info' }>({ 
    isOpen: false, title: '', message: '', type: 'info' 
  });

  const [formData, setFormData] = useState({
    name: '',
    slug: ''
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const response = await api.get<ICategory[]>('/categories');
      setCategories(response.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (cat: ICategory) => {
    setEditingCategory(cat);
    setFormData({ name: cat.name, slug: cat.slug });
    setIsFormOpen(true);
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/categories/${confirmDelete.uuid}`);
      fetchCategories();
      setAlert({ isOpen: true, title: 'Éxito', message: 'Categoría eliminada correctamente', type: 'success' });
      setConfirmDelete({ isOpen: false, uuid: '' });
    } catch (err) {
      console.error(err);
      setAlert({ isOpen: true, title: 'Error', message: 'No se pudo eliminar la categoría', type: 'error' });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingCategory) {
        await api.patch(`/categories/${editingCategory.uuid}`, formData);
      } else {
        await api.post('/categories', formData);
      }
      setIsFormOpen(false);
      setEditingCategory(null);
      setFormData({ name: '', slug: '' });
      fetchCategories();
      setAlert({ 
        isOpen: true, 
        title: 'Éxito', 
        message: `Categoría ${editingCategory ? 'actualizada' : 'creada'} correctamente`, 
        type: 'success' 
      });
    } catch (err) {
      console.error(err);
      setAlert({ isOpen: true, title: 'Error', message: 'Error al guardar la categoría', type: 'error' });
    }
  };

  const filteredCategories = categories.filter(cat => 
    cat.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cat.slug.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-4">
      {/* Header Compacto */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-black text-gray-900 uppercase tracking-tight leading-none">Categorías</h1>
          <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-1">Organización de Productos</p>
        </div>
        <button 
          onClick={() => { setEditingCategory(null); setFormData({ name: '', slug: '' }); setIsFormOpen(true); }}
          className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-[10px] font-black text-white uppercase tracking-tight hover:bg-blue-700 transition-all shadow-sm shadow-blue-100"
        >
          <Plus size={14} /> Nueva Categoría
        </button>
      </div>

      {/* Búsqueda Compacta */}
      <div className="relative group">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors" size={14} />
        <input
          type="text" placeholder="Buscar categoría..."
          className="w-full rounded-xl border border-gray-200 bg-white py-2 pl-9 pr-3 text-[11px] font-bold outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50/50 transition-all"
          value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <Modal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title={editingCategory ? 'Editar Categoría' : 'Nueva Categoría'}
      >
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="space-y-1">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Nombre</label>
            <input 
              type="text" value={formData.name} 
              onChange={(e) => setFormData({ ...formData, name: e.target.value, slug: e.target.value.toLowerCase().replace(/ /g, '-') })}
              className="w-full rounded-lg border border-gray-200 p-2 text-[11px] font-bold outline-none focus:border-blue-500 transition-all"
              placeholder="Ej: Herramientas Eléctricas"
              required
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Slug (URL)</label>
            <input 
              type="text" value={formData.slug} 
              onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
              className="w-full rounded-lg border border-gray-200 p-2 text-[11px] font-bold outline-none focus:border-blue-500 transition-all"
              placeholder="ej: herramientas-electricas"
              required
            />
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <button 
              type="button" onClick={() => setIsFormOpen(false)}
              className="px-3 py-1.5 text-[10px] font-black text-gray-400 uppercase tracking-tight hover:bg-gray-100 rounded-lg transition-all"
            >
              Cancelar
            </button>
            <button 
              type="submit"
              className="px-4 py-1.5 bg-blue-600 text-white rounded-lg text-[10px] font-black uppercase tracking-tight hover:bg-blue-700 transition-all shadow-md shadow-blue-100"
            >
              {editingCategory ? 'Actualizar' : 'Crear Categoría'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmModal
        isOpen={confirmDelete.isOpen}
        onClose={() => setConfirmDelete({ isOpen: false, uuid: '' })}
        onConfirm={handleDelete}
        title="Eliminar Categoría"
        message="¿Estás seguro de que deseas eliminar esta categoría? Esta acción no se puede deshacer."
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

      <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[500px]">
            <thead className="border-b bg-gray-50/50">
              <tr>
                <th className="px-4 py-3 text-[9px] font-black uppercase tracking-widest text-gray-400">Nombre de Categoría</th>
                <th className="px-4 py-3 text-[9px] font-black uppercase tracking-widest text-gray-400">Identificador (Slug)</th>
                <th className="px-4 py-3 text-[9px] font-black uppercase tracking-widest text-gray-400 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={3} className="px-4 py-12 text-center text-gray-500">
                    <Loader2 className="animate-spin mx-auto text-blue-600" size={24} />
                    <p className="text-[10px] font-bold uppercase tracking-widest mt-2">Cargando categorías...</p>
                  </td>
                </tr>
              ) : filteredCategories.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-4 py-12 text-center text-[10px] font-black text-gray-400 uppercase tracking-widest">No se encontraron categorías</td>
                </tr>
              ) : (
                filteredCategories.map((cat) => (
                  <tr key={cat._id} className="hover:bg-blue-50/20 transition-all group">
                    <td className="px-4 py-2">
                      <span className="text-[11px] font-black text-gray-800 uppercase tracking-tighter leading-none">{cat.name}</span>
                    </td>
                    <td className="px-4 py-2">
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">{cat.slug}</span>
                    </td>
                    <td className="px-4 py-2 text-right">
                      <div className="flex justify-end gap-1">
                        <button 
                          onClick={() => handleEdit(cat)} 
                          className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button 
                          onClick={() => setConfirmDelete({ isOpen: true, uuid: cat.uuid })} 
                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                        >
                          <Trash2 size={14} />
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
    </div>
  );
};

export default CategoryList;
