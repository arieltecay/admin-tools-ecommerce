import { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Trash2, Eye, Filter, Upload, Loader2, ArrowUpDown, ChevronUp, ChevronDown, X } from 'lucide-react';
import api from '../../services/api';
import { Link } from 'react-router-dom';
import { IProduct, ICategory } from '../../types';

type SortConfig = {
  key: 'category' | 'price' | 'stock' | 'status' | 'createdAt';
  direction: 'asc' | 'desc';
};

const ProductList = () => {
  const [products, setProducts] = useState<IProduct[]>([]);
  const [categories, setCategories] = useState<ICategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  
  // Filtros y Orden
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [sort, setSort] = useState<SortConfig>({ key: 'createdAt', direction: 'desc' });
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  // Debounce para búsqueda y cambios de filtros que resetean página
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      setPage(1);
      fetchProducts();
    }, 400);
    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, selectedCategory, selectedStatus, sort]);

  useEffect(() => {
    fetchProducts();
  }, [page]);

  const fetchCategories = async () => {
    try {
      const res = await api.get<ICategory[]>('/categories');
      setCategories(res.data);
    } catch (err) {
      console.error('Error fetching categories', err);
    }
  };

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const sortValue = sort.key === 'createdAt' 
        ? (sort.direction === 'desc' ? 'newest' : 'oldest')
        : `${sort.key}_${sort.direction}`;

      const response = await api.get<{ products: IProduct[], total: number, totalPages: number }>('/products', {
        params: {
          page,
          limit: 10,
          q: searchTerm,
          category: selectedCategory,
          status: selectedStatus,
          sort: sortValue
        },
      });
      
      setProducts(response.data.products || []);
      setTotalPages(response.data.totalPages || 1);
      setTotalProducts(response.data.total || 0);
      setError(null);
    } catch (err: any) {
      setError('Error al cargar productos.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (key: SortConfig['key']) => {
    setSort(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const SortIcon = ({ column }: { column: SortConfig['key'] }) => {
    if (sort.key !== column) return <ArrowUpDown size={14} className="text-gray-300" />;
    return sort.direction === 'asc' ? <ChevronUp size={14} className="text-blue-600" /> : <ChevronDown size={14} className="text-blue-600" />;
  };

  const statusColors = {
    active: 'bg-green-100 text-green-800',
    paused: 'bg-yellow-100 text-yellow-800',
    draft: 'bg-gray-100 text-gray-800',
    out_of_stock: 'bg-red-100 text-red-800',
  };

  const statusLabels = {
    active: 'Activo',
    paused: 'Pausado',
    draft: 'Borrador',
    out_of_stock: 'Sin Stock',
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Productos</h1>
          <p className="text-sm text-gray-500">Total: {totalProducts} herramientas en inventario</p>
        </div>
        <div className="flex gap-2">
          <Link to="/admin/products/import" className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 font-bold text-gray-700 hover:bg-gray-50 transition-all">
            <Upload size={18} /> Importar
          </Link>
          <Link to="/admin/products/new" className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 font-bold text-white hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all">
            <Plus size={20} /> Nuevo Producto
          </Link>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Buscar por nombre o SKU..."
              className="w-full rounded-2xl border border-gray-100 bg-white py-3 pl-12 pr-4 outline-none focus:ring-4 focus:ring-blue-50/50 shadow-sm transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 rounded-2xl px-6 py-3 font-bold transition-all ${showFilters || selectedCategory || selectedStatus ? 'bg-blue-50 text-blue-600 border border-blue-100' : 'bg-white border border-gray-100 text-gray-600 shadow-sm hover:bg-gray-50'}`}
          >
            <Filter size={18} />
            Filtros
            {(selectedCategory || selectedStatus) && <span className="ml-1 w-2 h-2 rounded-full bg-blue-600" />}
          </button>
        </div>

        {/* Expandable Filter Bar */}
        {showFilters && (
          <div className="flex flex-wrap gap-4 p-4 bg-white rounded-2xl border border-gray-100 shadow-sm animate-in fade-in slide-in-from-top-2">
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase text-gray-400 ml-1">Categoría</label>
              <select 
                value={selectedCategory} 
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-48 rounded-xl border-gray-100 bg-gray-50 px-3 py-2 text-sm font-bold text-gray-700 outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Todas</option>
                {categories.map(cat => <option key={cat.uuid} value={cat.slug}>{cat.name}</option>)}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase text-gray-400 ml-1">Estado</label>
              <select 
                value={selectedStatus} 
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-40 rounded-xl border-gray-100 bg-gray-50 px-3 py-2 text-sm font-bold text-gray-700 outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Todos</option>
                {Object.entries(statusLabels).map(([val, label]) => <option key={val} value={val}>{label}</option>)}
              </select>
            </div>
            <button 
              onClick={() => { setSelectedCategory(''); setSelectedStatus(''); setSearchTerm(''); }}
              className="mt-auto mb-1 p-2 text-gray-400 hover:text-red-500"
            >
              <X size={20} />
            </button>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="rounded-3xl border border-gray-100 bg-white shadow-xl shadow-gray-100/50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b bg-gray-50/50">
                <th className="px-6 py-5 text-[11px] font-black uppercase tracking-widest text-gray-400">Producto</th>
                <th className="px-6 py-5 text-[11px] font-black uppercase tracking-widest text-gray-400">SKU</th>
                <th 
                  onClick={() => handleSort('category')}
                  className="px-6 py-5 text-[11px] font-black uppercase tracking-widest text-gray-400 cursor-pointer hover:text-blue-600 transition-colors"
                >
                  <div className="flex items-center gap-2">Categoría <SortIcon column="category" /></div>
                </th>
                <th 
                  onClick={() => handleSort('price')}
                  className="px-6 py-5 text-[11px] font-black uppercase tracking-widest text-gray-400 cursor-pointer hover:text-blue-600 transition-colors"
                >
                  <div className="flex items-center gap-2">Precio <SortIcon column="price" /></div>
                </th>
                <th 
                  onClick={() => handleSort('stock')}
                  className="px-6 py-5 text-[11px] font-black uppercase tracking-widest text-gray-400 cursor-pointer hover:text-blue-600 transition-colors"
                >
                  <div className="flex items-center gap-2">Stock <SortIcon column="stock" /></div>
                </th>
                <th 
                  onClick={() => handleSort('status')}
                  className="px-6 py-5 text-[11px] font-black uppercase tracking-widest text-gray-400 cursor-pointer hover:text-blue-600 transition-colors"
                >
                  <div className="flex items-center gap-2">Estado <SortIcon column="status" /></div>
                </th>
                <th className="px-6 py-5 text-[11px] font-black uppercase tracking-widest text-gray-400 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-20 text-center">
                    <Loader2 className="animate-spin text-blue-600 mx-auto" size={40} />
                  </td>
                </tr>
              ) : products.map((product) => (
                <tr key={product.uuid} className="hover:bg-blue-50/30 transition-all group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-2xl bg-gray-50 overflow-hidden flex-shrink-0 border border-gray-100 p-1">
                        {product.images?.[0]?.url ? <img src={product.images[0].url} className="h-full w-full object-contain" /> : <div className="h-full w-full bg-gray-100" />}
                      </div>
                      <span className="font-bold text-gray-900 line-clamp-1">{product.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-xs font-mono text-gray-500">{product.sku}</td>
                  <td className="px-6 py-4">
                    <span className="text-[10px] font-black uppercase px-2 py-1 bg-gray-100 text-gray-600 rounded-lg">
                      {product.category?.name || 'N/A'}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-black text-gray-900">${product.price.toLocaleString()}</td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1">
                      <span className={`text-sm font-bold ${product.stock <= product.minStock ? 'text-red-600' : 'text-gray-700'}`}>{product.stock} uds</span>
                      <div className="w-12 h-1 bg-gray-100 rounded-full overflow-hidden">
                        <div className={`h-full ${product.stock <= product.minStock ? 'bg-red-500' : 'bg-green-500'}`} style={{ width: `${Math.min((product.stock/50)*100, 100)}%` }} />
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex rounded-full px-3 py-1 text-[9px] font-black uppercase tracking-tighter ${statusColors[product.status]}`}>
                      {statusLabels[product.status]}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-all">
                      <Link to={`/admin/products/edit/${product.uuid}`} className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-xl transition-all">
                        <Edit2 size={18} />
                      </Link>
                      <button className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Improved Pagination */}
        <div className="bg-gray-50 px-6 py-6 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-sm font-bold text-gray-500">
            Página <span className="text-blue-600">{page}</span> de <span className="text-gray-900">{totalPages}</span>
          </div>
          <div className="flex items-center gap-2">
            <button 
              disabled={page === 1} 
              onClick={() => setPage(page - 1)}
              className="px-6 py-2.5 rounded-2xl border border-gray-200 bg-white font-bold text-gray-700 hover:bg-white shadow-sm disabled:opacity-30 transition-all"
            >
              Anterior
            </button>
            <div className="flex gap-1">
              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i+1}
                  onClick={() => setPage(i+1)}
                  className={`w-10 h-10 rounded-xl font-bold transition-all ${page === i+1 ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'text-gray-500 hover:bg-white border border-transparent hover:border-gray-200'}`}
                >
                  {i+1}
                </button>
              )).slice(Math.max(0, page - 2), Math.min(totalPages, page + 1))}
            </div>
            <button 
              disabled={page === totalPages} 
              onClick={() => setPage(page + 1)}
              className="px-6 py-2.5 rounded-2xl border border-gray-200 bg-white font-bold text-gray-700 hover:bg-white shadow-sm disabled:opacity-30 transition-all"
            >
              Siguiente
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductList;
