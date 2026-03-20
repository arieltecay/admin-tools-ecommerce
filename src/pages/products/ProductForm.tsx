import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Save, ArrowLeft, Loader2, Plus, Trash2 } from 'lucide-react';
import api from '../../services/api';
import { IProduct, ICategory, IBrand } from '../../types';
import AlertModal from '../../components/common/AlertModal';

interface ProductFormData extends Partial<Omit<IProduct, 'category' | 'brand'>> {
  category: {
    _id: string;
    uuid: string;
    name: string;
    slug: string;
  };
  brand: {
    _id: string;
    name: string;
  };
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

  // Modal state
  const [alert, setAlert] = useState<{ isOpen: boolean, title: string, message: string, type: 'success' | 'error' }>({
    isOpen: false, title: '', message: '', type: 'success'
  });

  const [formData, setFormData] = useState<ProductFormData>({
    sku: '',
    name: '',
    slug: '',
    shortDescription: '',
    longDescription: '',
    category: { _id: '', uuid: '', name: '', slug: '' },
    brand: { _id: '', name: '' },
    price: 0,
    costPrice: 0,
    stock: 0,
    minStock: 5,
    status: 'draft',
    isFeatured: false,
    images: [],
  });

  useEffect(() => {
    fetchData();
    if (isEditing) {
      fetchProduct();
    }
  }, [uuid]);

  const fetchData = async () => {
    try {
      const [catsRes, brandsRes] = await Promise.all([
        api.get<ICategory[]>('/categories'),
        api.get<IBrand[]>('/brands')
      ]);
      setCategories(catsRes.data);
      setBrands(brandsRes.data);
    } catch (err) {
      console.error('Error fetching categories/brands:', err);
    }
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
    } catch (err) {
      console.error('Error fetching product:', err);
      navigate('/admin/products');
    } finally {
      setInitialLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const val = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;

    if (name === 'category._id') {
      const cat = categories.find(c => c._id === value);
      if (cat) {
        setFormData(prev => ({
          ...prev,
          category: { _id: cat._id, uuid: cat.uuid, name: cat.name, slug: cat.slug }
        }));
      }
    } else if (name === 'brand._id') {
      const brand = brands.find(b => b._id === value);
      if (brand) {
        setFormData(prev => ({
          ...prev,
          brand: { _id: brand._id, name: brand.name }
        }));
      }
    } else {
      setFormData(prev => ({ ...prev, [name]: val }));
    }
  };

  const handleUploadImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0 || !uuid) return;
    
    const file = e.target.files[0];
    const uploadData = new FormData();
    uploadData.append('image', file);
    uploadData.append('isPrimary', (formData.images?.length === 0).toString());

    setUploading(true);
    try {
      const response = await api.post<IProduct>(`/products/${uuid}/images`, uploadData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setFormData(prev => ({ ...prev, images: response.data.images }));
      setAlert({ isOpen: true, title: 'Éxito', message: 'Imagen subida correctamente', type: 'success' });
    } catch (err) {
      console.error('Error uploading image:', err);
      setAlert({ isOpen: true, title: 'Error', message: 'Error al subir la imagen', type: 'error' });
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isEditing) {
        await api.patch(`/products/${uuid}`, formData);
      } else {
        const res = await api.post<IProduct>('/products', formData);
        navigate(`/admin/products/edit/${res.data.uuid}`);
        return;
      }
      setAlert({ isOpen: true, title: 'Éxito', message: 'Producto guardado correctamente', type: 'success' });
      setTimeout(() => navigate('/admin/products'), 1500);
    } catch (err) {
      console.error('Error saving product:', err);
      setAlert({ isOpen: true, title: 'Error', message: 'Error al guardar el producto', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="animate-spin text-blue-600" size={40} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/admin/products')} className="rounded-full p-2 hover:bg-gray-100 transition-colors">
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-2xl font-bold text-gray-800">
            {isEditing ? 'Editar Producto' : 'Nuevo Producto'}
          </h1>
        </div>
        <button 
          onClick={handleSubmit}
          disabled={loading}
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-2 font-medium text-white transition-colors hover:bg-blue-700 disabled:bg-blue-400"
        >
          {loading ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
          Guardar Producto
        </button>
      </div>

      <AlertModal
        isOpen={alert.isOpen}
        onClose={() => setAlert({ ...alert, isOpen: false })}
        title={alert.title}
        message={alert.message}
        type={alert.type}
      />

      <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left Column: Info General */}
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-100 space-y-4">
            <h2 className="text-lg font-semibold text-gray-800">Información General</h2>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Nombre del Producto</label>
              <input 
                type="text" name="name" value={formData.name || ''} onChange={handleChange} required
                className="w-full rounded-lg border border-gray-200 p-2 outline-none focus:border-blue-500"
                placeholder="Ej: Taladro Inalámbrico 20V"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">SKU</label>
                <input 
                  type="text" name="sku" value={formData.sku || ''} onChange={handleChange} required
                  className="w-full rounded-lg border border-gray-200 p-2 outline-none focus:border-blue-500"
                  placeholder="DRILL-20V"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Slug (URL)</label>
                <input 
                  type="text" name="slug" value={formData.slug || ''} onChange={handleChange} required
                  className="w-full rounded-lg border border-gray-200 p-2 outline-none focus:border-blue-500"
                  placeholder="taladro-inalambrico-20v"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Descripción Corta</label>
              <textarea 
                name="shortDescription" value={formData.shortDescription || ''} onChange={handleChange} rows={2}
                className="w-full rounded-lg border border-gray-200 p-2 outline-none focus:border-blue-500"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Descripción Larga (Markdown/HTML)</label>
              <textarea 
                name="longDescription" value={formData.longDescription || ''} onChange={handleChange} rows={6}
                className="w-full rounded-lg border border-gray-200 p-2 outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-100 space-y-4">
            <h2 className="text-lg font-semibold text-gray-800">Precios e Inventario</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Precio de Venta</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                  <input 
                    type="number" name="price" value={formData.price || 0} onChange={handleChange} required
                    className="w-full rounded-lg border border-gray-200 p-2 pl-7 outline-none focus:border-blue-500"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Precio de Costo</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                  <input 
                    type="number" name="costPrice" value={formData.costPrice || 0} onChange={handleChange} required
                    className="w-full rounded-lg border border-gray-200 p-2 pl-7 outline-none focus:border-blue-500"
                  />
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Stock Actual</label>
                <input 
                  type="number" name="stock" value={formData.stock || 0} onChange={handleChange} required
                  className="w-full rounded-lg border border-gray-200 p-2 outline-none focus:border-blue-500"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Stock Mínimo (Alerta)</label>
                <input 
                  type="number" name="minStock" value={formData.minStock || 0} onChange={handleChange} required
                  className="w-full rounded-lg border border-gray-200 p-2 outline-none focus:border-blue-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Categorization & Status */}
        <div className="space-y-6">
          <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-100 space-y-4">
            <h2 className="text-lg font-semibold text-gray-800">Organización</h2>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Categoría</label>
              <select 
                name="category._id" value={formData.category._id} onChange={handleChange} required
                className="w-full rounded-lg border border-gray-200 p-2 outline-none focus:border-blue-500"
              >
                <option value="">Seleccionar categoría</option>
                {categories.map(cat => (
                  <option key={cat._id} value={cat._id}>{cat.name}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Marca</label>
              <select 
                name="brand._id" value={formData.brand._id} onChange={handleChange} required
                className="w-full rounded-lg border border-gray-200 p-2 outline-none focus:border-blue-500"
              >
                <option value="">Seleccionar marca</option>
                {brands.map(brand => (
                  <option key={brand._id} value={brand._id}>{brand.name}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Estado</label>
              <select 
                name="status" value={formData.status} onChange={handleChange}
                className="w-full rounded-lg border border-gray-200 p-2 outline-none focus:border-blue-500"
              >
                <option value="active">Activo</option>
                <option value="paused">Pausado</option>
                <option value="draft">Borrador</option>
                <option value="out_of_stock">Sin Stock</option>
              </select>
            </div>
            <div className="flex items-center gap-2 pt-2">
              <input 
                type="checkbox" name="isFeatured" checked={formData.isFeatured || false} 
                onChange={(e) => setFormData(prev => ({ ...prev, isFeatured: e.target.checked }))}
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label className="text-sm font-medium text-gray-700">Producto Destacado</label>
            </div>
          </div>

          <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-100 space-y-4">
            <h2 className="text-lg font-semibold text-gray-800">Imágenes</h2>
            
            <div className="grid grid-cols-2 gap-4">
              {formData.images?.map((img, idx) => (
                <div key={idx} className="relative aspect-square rounded-lg bg-gray-50 border overflow-hidden group p-2">
                  <img src={img.url} alt="" className="h-full w-full object-contain" />
                  {img.isPrimary && (
                    <span className="absolute top-2 left-2 bg-blue-600 text-white text-[10px] px-2 py-0.5 rounded-full font-bold">Principal</span>
                  )}
                  <button 
                    type="button"
                    className="absolute top-2 right-2 p-1 bg-red-100 text-red-600 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
              
              {isEditing ? (
                <button 
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="aspect-square flex flex-col items-center justify-center border-2 border-dashed border-gray-200 rounded-lg text-gray-400 hover:border-blue-500 hover:text-blue-500 transition-all"
                >
                  {uploading ? <Loader2 className="animate-spin" size={24} /> : (
                    <>
                      <Plus size={24} />
                      <span className="text-[10px] mt-1">Agregar</span>
                    </>
                  )}
                </button>
              ) : (
                <div className="col-span-2 p-4 bg-yellow-50 rounded-lg border border-yellow-100 text-center">
                  <p className="text-xs text-yellow-700">Guarda el producto primero para poder subir imágenes.</p>
                </div>
              )}
            </div>
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleUploadImage} 
              className="hidden" 
              accept="image/*"
            />
          </div>
        </div>
      </form>
    </div>
  );
};

export default ProductForm;
