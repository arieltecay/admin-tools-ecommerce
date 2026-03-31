import { useState, useEffect, useCallback } from 'react';
import api from '../../services/api';
import { IProduct } from '../../types';
import { IHeroSlide } from './types';
import { Plus, Edit2, Trash2, Loader2, Search, Check, X, MoveUp, MoveDown, Palette, Image as ImageIcon, Link as LinkIcon } from 'lucide-react';
import Modal from '../../components/common/Modal';
import ConfirmModal from '../../components/common/ConfirmModal';
import AlertModal from '../../components/common/AlertModal';

const HeroManager = () => {
  const [slides, setSlides] = useState<IHeroSlide[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingSlide, setEditingSlide] = useState<IHeroSlide | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  
  // Product search states
  const [productSearch, setProductSearch] = useState('');
  const [searchResults, setSearchResults] = useState<IProduct[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<IProduct | null>(null);

  // Modal states
  const [confirmDelete, setConfirmDelete] = useState<{ isOpen: boolean, id: string }>({ isOpen: false, id: '' });
  const [alert, setAlert] = useState<{ isOpen: boolean, title: string, message: string, type: 'success' | 'error' | 'info' }>({ 
    isOpen: false, title: '', message: '', type: 'info' 
  });

  const [formData, setFormData] = useState({
    productUuid: '',
    title: '',
    subtitle: '',
    buttonText: 'Ver producto',
    imageUrl: '',
    backgroundColor: '#3B82F6',
    textColor: '#FFFFFF',
    isActive: true,
    sortOrder: 0
  });

  useEffect(() => {
    fetchSlides();
  }, []);

  const fetchSlides = async () => {
    setLoading(true);
    try {
      const response = await api.get<IHeroSlide[]>('/hero-slides');
      setSlides(response.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const searchProducts = useCallback(async (term: string) => {
    if (term.length < 2) {
      setSearchResults([]);
      return;
    }
    setIsSearching(true);
    try {
      const response = await api.get<{ products: IProduct[] }>('/products', {
        params: { search: term, limit: 5 }
      });
      setSearchResults(response.data.products);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSearching(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (productSearch) searchProducts(productSearch);
    }, 500);
    return () => clearTimeout(timer);
  }, [productSearch, searchProducts]);

  const handleEdit = (slide: IHeroSlide) => {
    setEditingSlide(slide);
    setFormData({
      productUuid: slide.productUuid,
      title: slide.title,
      subtitle: slide.subtitle || '',
      buttonText: slide.buttonText,
      imageUrl: slide.imageUrl || '',
      backgroundColor: slide.backgroundColor || '#3B82F6',
      textColor: slide.textColor,
      isActive: slide.isActive,
      sortOrder: slide.sortOrder
    });
    // Find the product to show in selected
    if (slide.productUuid) {
      // In a real app, we might need to fetch the product if it's not in the slide object
      // But here the slide should have some product info
      setSelectedProduct(slide.product as any);
    }
    setIsFormOpen(true);
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/hero-slides/${confirmDelete.id}`);
      fetchSlides();
      setAlert({ isOpen: true, title: 'Éxito', message: 'Banner eliminado correctamente', type: 'success' });
      setConfirmDelete({ isOpen: false, id: '' });
    } catch (err) {
      console.error(err);
      setAlert({ isOpen: true, title: 'Error', message: 'No se pudo eliminar el banner', type: 'error' });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.productUuid) {
      setAlert({ isOpen: true, title: 'Error', message: 'Debes seleccionar un producto', type: 'error' });
      return;
    }

    try {
      if (editingSlide) {
        await api.patch(`/hero-slides/${editingSlide._id}`, formData);
      } else {
        await api.post('/hero-slides', formData);
      }
      setIsFormOpen(false);
      setEditingSlide(null);
      setSelectedProduct(null);
      setProductSearch('');
      fetchSlides();
      setAlert({ 
        isOpen: true, 
        title: 'Éxito', 
        message: `Banner ${editingSlide ? 'actualizado' : 'creado'} correctamente`, 
        type: 'success' 
      });
    } catch (err) {
      console.error(err);
      setAlert({ isOpen: true, title: 'Error', message: 'Error al guardar el banner', type: 'error' });
    }
  };

  const toggleStatus = async (slide: IHeroSlide) => {
    try {
      await api.patch(`/hero-slides/${slide._id}`, { isActive: !slide.isActive });
      fetchSlides();
    } catch (err) {
      console.error(err);
    }
  };

  const selectProduct = (product: IProduct) => {
    setSelectedProduct(product);
    setFormData({ 
      ...formData, 
      productUuid: product.uuid,
      title: formData.title || product.name,
      subtitle: formData.subtitle || product.shortDescription
    });
    setSearchResults([]);
    setProductSearch('');
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-black text-gray-900 uppercase tracking-tight leading-none">Banner Hero (Carrusel)</h1>
          <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-1">Gestión de productos destacados en portada</p>
        </div>
        <button 
          onClick={() => { 
            setEditingSlide(null); 
            setSelectedProduct(null);
            setFormData({ 
              productUuid: '', title: '', subtitle: '', buttonText: 'Ver producto', 
              imageUrl: '', backgroundColor: '#3B82F6', textColor: '#FFFFFF', 
              isActive: true, sortOrder: slides.length 
            }); 
            setIsFormOpen(true); 
          }}
          className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-[10px] font-black text-white uppercase tracking-tight hover:bg-blue-700 transition-all shadow-sm shadow-blue-100"
        >
          <Plus size={14} /> Nuevo Slide
        </button>
      </div>

      <Modal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title={editingSlide ? 'Editar Slide' : 'Nuevo Slide'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Product Selection */}
          <div className="space-y-1 relative">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Producto Vinculado</label>
            {!selectedProduct ? (
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                <input 
                  type="text" value={productSearch} 
                  onChange={(e) => setProductSearch(e.target.value)}
                  className="w-full rounded-lg border border-gray-200 py-2 pl-9 pr-3 text-[11px] font-bold outline-none focus:border-blue-500 transition-all"
                  placeholder="Buscar producto por nombre o SKU..."
                />
                {isSearching && <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-blue-600" size={14} />}
                
                {searchResults.length > 0 && (
                  <div className="absolute z-10 mt-1 w-full bg-white border rounded-lg shadow-xl max-h-48 overflow-y-auto">
                    {searchResults.map(p => (
                      <button
                        key={p._id} type="button"
                        onClick={() => selectProduct(p)}
                        className="w-full text-left px-3 py-2 hover:bg-blue-50 flex items-center gap-2 border-b last:border-0"
                      >
                        <div className="w-8 h-8 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                          {p.images[0] && <img src={p.images[0].url} className="w-full h-full object-cover" alt="" />}
                        </div>
                        <div>
                          <p className="text-[10px] font-black uppercase text-gray-800 leading-none">{p.name}</p>
                          <p className="text-[9px] text-gray-400 font-bold uppercase mt-1">{p.sku}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center justify-between p-2 bg-blue-50 rounded-lg border border-blue-100">
                <div className="flex items-center gap-2">
                  <Check className="text-blue-600" size={14} />
                  <div>
                    <p className="text-[10px] font-black uppercase text-blue-900 leading-none">{selectedProduct.name}</p>
                    <p className="text-[9px] text-blue-400 font-bold uppercase mt-1">SKU: {selectedProduct.sku}</p>
                  </div>
                </div>
                <button 
                  type="button" onClick={() => { setSelectedProduct(null); setFormData({ ...formData, productUuid: '' }); }}
                  className="text-gray-400 hover:text-red-500"
                >
                  <X size={14} />
                </button>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Título (Heading)</label>
              <input 
                type="text" value={formData.title} 
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full rounded-lg border border-gray-200 p-2 text-[11px] font-bold outline-none focus:border-blue-500 transition-all"
                placeholder="Título impactante" required
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Texto Botón</label>
              <input 
                type="text" value={formData.buttonText} 
                onChange={(e) => setFormData({ ...formData, buttonText: e.target.value })}
                className="w-full rounded-lg border border-gray-200 p-2 text-[11px] font-bold outline-none focus:border-blue-500 transition-all"
                placeholder="Ej: Ver Oferta" required
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Subtítulo / Descripción</label>
            <textarea 
              value={formData.subtitle} 
              onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
              className="w-full rounded-lg border border-gray-200 p-2 text-[11px] font-bold outline-none focus:border-blue-500 transition-all h-20"
              placeholder="Descripción breve que motive la compra..."
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1">
                <Palette size={10} /> Fondo
              </label>
              <div className="flex gap-2 items-center">
                <input 
                  type="color" value={formData.backgroundColor} 
                  onChange={(e) => setFormData({ ...formData, backgroundColor: e.target.value })}
                  className="h-8 w-8 rounded cursor-pointer border-0 p-0"
                />
                <span className="text-[10px] font-mono font-bold text-gray-500">{formData.backgroundColor}</span>
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1">
                <Palette size={10} /> Texto
              </label>
              <div className="flex gap-2 items-center">
                <input 
                  type="color" value={formData.textColor} 
                  onChange={(e) => setFormData({ ...formData, textColor: e.target.value })}
                  className="h-8 w-8 rounded cursor-pointer border-0 p-0"
                />
                <span className="text-[10px] font-mono font-bold text-gray-500">{formData.textColor}</span>
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1">
                <MoveUp size={10} /> Orden
              </label>
              <input 
                type="number" value={formData.sortOrder} 
                onChange={(e) => setFormData({ ...formData, sortOrder: parseInt(e.target.value) })}
                className="w-full rounded-lg border border-gray-200 p-2 text-[11px] font-bold outline-none focus:border-blue-500 transition-all"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 pt-2">
            <input 
              type="checkbox" id="isActive" checked={formData.isActive}
              onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 h-4 w-4"
            />
            <label htmlFor="isActive" className="text-[10px] font-black text-gray-600 uppercase tracking-widest cursor-pointer">Activar inmediatamente</label>
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
              {editingSlide ? 'Actualizar' : 'Crear Slide'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmModal
        isOpen={confirmDelete.isOpen}
        onClose={() => setConfirmDelete({ isOpen: false, id: '' })}
        onConfirm={handleDelete}
        title="Eliminar Slide"
        message="¿Estás seguro de que deseas eliminar este banner del carrusel? Esta acción no se puede deshacer."
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
          <table className="w-full text-left min-w-[600px]">
            <thead className="border-b bg-gray-50/50">
              <tr>
                <th className="px-4 py-3 text-[9px] font-black uppercase tracking-widest text-gray-400 w-16 text-center">Orden</th>
                <th className="px-4 py-3 text-[9px] font-black uppercase tracking-widest text-gray-400">Producto & Preview</th>
                <th className="px-4 py-3 text-[9px] font-black uppercase tracking-widest text-gray-400">Wording (Textos)</th>
                <th className="px-4 py-3 text-[9px] font-black uppercase tracking-widest text-gray-400">Estado</th>
                <th className="px-4 py-3 text-[9px] font-black uppercase tracking-widest text-gray-400 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-gray-500">
                    <Loader2 className="animate-spin mx-auto text-blue-600" size={24} />
                    <p className="text-[10px] font-bold uppercase tracking-widest mt-2">Cargando banners...</p>
                  </td>
                </tr>
              ) : slides.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-[10px] font-black text-gray-400 uppercase tracking-widest">No hay banners configurados</td>
                </tr>
              ) : (
                slides.map((slide) => (
                  <tr key={slide._id} className="hover:bg-blue-50/20 transition-all group">
                    <td className="px-4 py-2 text-center">
                      <span className="text-[11px] font-black text-gray-400">{slide.sortOrder}</span>
                    </td>
                    <td className="px-4 py-2">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-12 h-12 rounded-lg border-2 border-white shadow-sm overflow-hidden flex-shrink-0 relative"
                          style={{ backgroundColor: slide.backgroundColor }}
                        >
                          {slide.product?.images[0] && (
                            <img src={slide.product.images[0].url} className="w-full h-full object-contain p-1" alt="" />
                          )}
                        </div>
                        <div>
                          <p className="text-[10px] font-black uppercase text-gray-800 leading-none">{slide.product?.name || 'Producto no encontrado'}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-[8px] font-black uppercase px-1 rounded bg-gray-100 text-gray-500 flex items-center gap-0.5">
                              <Palette size={8} /> {slide.backgroundColor}
                            </span>
                            <span className="text-[8px] font-black uppercase px-1 rounded bg-gray-100 text-gray-500 flex items-center gap-0.5">
                              <ImageIcon size={8} /> {slide.imageUrl ? 'Personalizada' : 'Producto'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-2">
                      <p className="text-[10px] font-black uppercase text-blue-600 leading-none">{slide.title}</p>
                      <p className="text-[9px] text-gray-400 font-bold uppercase mt-1 line-clamp-1">{slide.subtitle}</p>
                    </td>
                    <td className="px-4 py-2">
                      <button 
                        onClick={() => toggleStatus(slide)}
                        className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest transition-all ${
                          slide.isActive 
                          ? 'bg-green-100 text-green-600 hover:bg-green-200' 
                          : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                        }`}
                      >
                        {slide.isActive ? 'Activo' : 'Pausado'}
                      </button>
                    </td>
                    <td className="px-4 py-2 text-right">
                      <div className="flex justify-end gap-1">
                        <button 
                          onClick={() => handleEdit(slide)} 
                          className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button 
                          onClick={() => setConfirmDelete({ isOpen: true, id: slide._id })} 
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

export default HeroManager;
