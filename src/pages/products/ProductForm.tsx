import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Save, ArrowLeft, Loader2, Plus, Trash2 } from 'lucide-react';
import api from '../../services/api';
import { IProduct, ICategory, IBrand } from '../../types';
import AlertModal from '../../components/common/AlertModal';

interface ProductFormData extends Partial<Omit<IProduct, 'category' | 'brand'>> {
  category: { _id: string; uuid: string; name: string; slug: string; };
  brand: { _id: string; name: string; };
}

const ProductForm = () => {
  const { uuid } = useParams();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isEditing = !!uuid;

  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(isEditing);
  const [categories, setCategories] = useState<ICategory[]>([]);
  const [brands, setBrands] = useState<IBrand[]>([]);

  const [alert, setAlert] = useState<{ isOpen: boolean, title: string, message: string, type: 'success' | 'error' }>({
    isOpen: false, title: '', message: '', type: 'success'
  });

  const [formData, setFormData] = useState<ProductFormData>({
    sku: '', name: '', slug: '', shortDescription: '', longDescription: '',
    category: { _id: '', uuid: '', name: '', slug: '' },
    brand: { _id: '', name: '' },
    price: 0, costPrice: 0, stock: 0, minStock: 5, status: 'draft', isFeatured: false, images: [],
  });

  useEffect(() => {
    fetchData();
    if (isEditing) fetchProduct();
  }, [uuid]);

  const fetchData = async () => {
    try {
      const [catsRes, brandsRes] = await Promise.all([
        api.get<ICategory[]>('/categories'),
        api.get<IBrand[]>('/brands')
      ]);
      setCategories(catsRes.data);
      setBrands(brandsRes.data);
    } catch (err) { console.error(err); }
  };

  const fetchProduct = async () => {
    try {
      const response = await api.get<IProduct>(`/products/${uuid}`);
      const product = response.data;
      setFormData({
        ...product,
        category: product.category || { _id: '', uuid: '', name: '', slug: '' },
        brand: product.brand || { _id: '', name: '' },
      });
    } catch (err) { navigate('/admin/products'); } finally { setInitialLoading(false); }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const val = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;

    if (name === 'category._id') {
      const cat = categories.find(c => c._id === value);
      if (cat) setFormData(prev => ({ ...prev, category: { _id: cat._id, uuid: cat.uuid, name: cat.name, slug: cat.slug } }));
    } else if (name === 'brand._id') {
      const brand = brands.find(b => b._id === value);
      if (brand) setFormData(prev => ({ ...prev, brand: { _id: brand._id, name: brand.name } }));
    } else {
      setFormData(prev => ({ ...prev, [name]: val }));
    }
  };

  const handleUploadImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length || !uuid) return;
    const uploadData = new FormData();
    uploadData.append('image', e.target.files[0]);
    uploadData.append('isPrimary', (formData.images?.length === 0).toString());
    setUploading(true);
    try {
      const res = await api.post<IProduct>(`/products/${uuid}/images`, uploadData, { headers: { 'Content-Type': 'multipart/form-data' } });
      setFormData(prev => ({ ...prev, images: res.data.images }));
    } catch (err) { console.error(err); } finally { setUploading(false); }
  };

  const handleDeleteImage = async (imageUrl: string) => {
    if (!uuid) return;
    try {
      const res = await api.delete<IProduct>(`/products/${uuid}/images/${encodeURIComponent(imageUrl)}`);
      setFormData(prev => ({ ...prev, images: res.data.images }));
    } catch (err) { console.error(err); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isEditing) await api.patch(`/products/${uuid}`, formData);
      else {
        const res = await api.post<IProduct>('/products', formData);
        navigate(`/admin/products/edit/${res.data.uuid}`);
        return;
      }
      setAlert({ isOpen: true, title: 'Éxito', message: 'Guardado', type: 'success' });
      setTimeout(() => navigate('/admin/products'), 1000);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  if (initialLoading) return <div className="flex h-64 items-center justify-center"><Loader2 className="animate-spin text-blue-600" size={32} /></div>;

  const inputClass = "w-full rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-bold outline-none focus:border-blue-500 transition-all bg-gray-50/30 focus:bg-white";
  const labelClass = "text-[10px] font-black uppercase text-gray-400 tracking-widest ml-1";

  return (
    <div className="space-y-4 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button onClick={() => navigate('/admin/products')} className="rounded-full p-1.5 hover:bg-gray-100 transition-colors text-gray-400"><ArrowLeft size={16} /></button>
          <h1 className="text-base font-black text-gray-900 uppercase tracking-tight">{isEditing ? 'Editar Producto' : 'Nuevo'}</h1>
        </div>
        <button onClick={handleSubmit} disabled={loading} className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-1.5 text-[10px] font-black uppercase tracking-widest text-white shadow-md shadow-blue-100 disabled:opacity-50">
          {loading ? <Loader2 className="animate-spin" size={14} /> : <Save size={14} />} Guardar
        </button>
      </div>

      <AlertModal isOpen={alert.isOpen} onClose={() => setAlert({ ...alert, isOpen: false })} title={alert.title} message={alert.message} type={alert.type} />

      <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          <div className="rounded-xl bg-white p-4 shadow-sm border border-gray-100 space-y-3">
            <h2 className="text-[11px] font-black uppercase text-blue-600 tracking-widest border-b border-gray-50 pb-2">Información General</h2>
            <div className="space-y-1">
              <label className={labelClass}>Nombre</label>
              <input type="text" name="name" value={formData.name || ''} onChange={handleChange} required className={inputClass} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className={labelClass}>SKU</label>
                <input type="text" name="sku" value={formData.sku || ''} onChange={handleChange} required className={inputClass} />
              </div>
              <div className="space-y-1">
                <label className={labelClass}>Slug</label>
                <input type="text" name="slug" value={formData.slug || ''} onChange={handleChange} required className={inputClass} />
              </div>
            </div>
            <div className="space-y-1">
              <label className={labelClass}>Descripción Corta</label>
              <textarea name="shortDescription" value={formData.shortDescription || ''} onChange={handleChange} rows={2} className={inputClass} />
            </div>
            <div className="space-y-1">
              <label className={labelClass}>Descripción Larga</label>
              <textarea name="longDescription" value={formData.longDescription || ''} onChange={handleChange} rows={4} className={inputClass} />
            </div>
          </div>

          <div className="rounded-xl bg-white p-4 shadow-sm border border-gray-100 space-y-3">
            <h2 className="text-[11px] font-black uppercase text-blue-600 tracking-widest border-b border-gray-50 pb-2">Precios e Inventario</h2>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className={labelClass}>Precio Venta</label>
                <input type="number" name="price" value={formData.price || 0} onChange={handleChange} required className={inputClass} />
              </div>
              <div className="space-y-1">
                <label className={labelClass}>Precio Costo</label>
                <input type="number" name="costPrice" value={formData.costPrice || 0} onChange={handleChange} required className={inputClass} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className={labelClass}>Stock Actual</label>
                <input type="number" name="stock" value={formData.stock || 0} onChange={handleChange} required className={inputClass} />
              </div>
              <div className="space-y-1">
                <label className={labelClass}>Mínimo</label>
                <input type="number" name="minStock" value={formData.minStock || 0} onChange={handleChange} required className={inputClass} />
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-xl bg-white p-4 shadow-sm border border-gray-100 space-y-3">
            <h2 className="text-[11px] font-black uppercase text-blue-600 tracking-widest border-b border-gray-50 pb-2">Organización</h2>
            <div className="space-y-1">
              <label className={labelClass}>Categoría</label>
              <select name="category._id" value={formData.category._id} onChange={handleChange} required className={inputClass}>
                <option value="">Seleccionar...</option>
                {categories.map(cat => <option key={cat._id} value={cat._id}>{cat.name}</option>)}
              </select>
            </div>
            <div className="space-y-1">
              <label className={labelClass}>Marca</label>
              <select name="brand._id" value={formData.brand._id} onChange={handleChange} required className={inputClass}>
                <option value="">Seleccionar...</option>
                {brands.map(brand => <option key={brand._id} value={brand._id}>{brand.name}</option>)}
              </select>
            </div>
            <div className="space-y-1">
              <label className={labelClass}>Estado</label>
              <select name="status" value={formData.status} onChange={handleChange} className={inputClass}>
                <option value="active">Activo</option>
                <option value="paused">Pausado</option>
                <option value="draft">Borrador</option>
                <option value="out_of_stock">Sin Stock</option>
              </select>
            </div>
            <div className="flex items-center gap-2 pt-1">
              <input type="checkbox" name="isFeatured" checked={formData.isFeatured || false} onChange={(e) => setFormData(prev => ({ ...prev, isFeatured: e.target.checked }))} className="h-3.5 w-3.5 rounded border-gray-300 text-blue-600" />
              <label className="text-[10px] font-bold text-gray-600 uppercase">Destacado</label>
            </div>
          </div>

          <div className="rounded-xl bg-white p-4 shadow-sm border border-gray-100 space-y-3">
            <h2 className="text-[11px] font-black uppercase text-blue-600 tracking-widest border-b border-gray-50 pb-2">Imágenes</h2>
            <div className="grid grid-cols-2 gap-2">
              {formData.images?.map((img, idx) => (
                <div key={idx} className="relative aspect-square rounded-lg bg-gray-50 border border-gray-100 overflow-hidden p-1 group">
                  <img src={img.url} alt="" className="h-full w-full object-contain" />
                  <button type="button" onClick={() => handleDeleteImage(img.url)} className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-md shadow-sm opacity-100 transition-all active:scale-95"><Trash2 size={12} /></button>
                </div>
              ))}
              {isEditing ? (
                <button type="button" onClick={() => fileInputRef.current?.click()} disabled={uploading} className="aspect-square flex flex-col items-center justify-center border-2 border-dashed border-gray-100 rounded-lg text-gray-300 hover:border-blue-500 hover:text-blue-500 transition-all">
                  {uploading ? <Loader2 className="animate-spin" size={16} /> : <><Plus size={16} /><span className="text-[8px] mt-0.5 uppercase font-black">Subir</span></>}
                </button>
              ) : <p className="col-span-2 text-[9px] text-orange-500 font-bold uppercase text-center py-2 bg-orange-50 rounded-lg">Guarda primero para subir fotos</p>}
            </div>
            <input type="file" ref={fileInputRef} onChange={handleUploadImage} className="hidden" accept="image/*" />
          </div>
        </div>
      </form>
    </div>
  );
};

export default ProductForm;
