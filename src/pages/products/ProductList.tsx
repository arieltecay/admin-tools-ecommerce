import { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Trash2, Filter, Upload, Loader2, ArrowUpDown, ChevronUp, ChevronDown, X } from 'lucide-react';
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
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [sort, setSort] = useState<SortConfig>({ key: 'createdAt', direction: 'desc' });
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => { fetchCategories(); }, []);
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => { setPage(1); fetchProducts(); }, 400);
    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, selectedCategory, selectedStatus, sort]);
  useEffect(() => { fetchProducts(); }, [page]);

  const fetchCategories = async () => {
    try {
      const res = await api.get<ICategory[]>('/categories');
      setCategories(res.data);
    } catch (err) { console.error(err); }
  };

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const sortValue = sort.key === 'createdAt' 
        ? (sort.direction === 'desc' ? 'newest' : 'oldest')
        : `${sort.key}_${sort.direction}`;

      const response = await api.get<{ products: IProduct[], total: number, totalPages: number }>('/products', {
        params: { page, limit: 12, q: searchTerm, category: selectedCategory, status: selectedStatus, sort: sortValue },
      });
      
      setProducts(response.data.products || []);
      setTotalPages(response.data.totalPages || 1);
      setTotalProducts(response.data.total || 0);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  const handleSort = (key: SortConfig['key']) => {
    setSort(prev => ({ key, direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc' }));
  };

  const SortIcon = ({ column }: { column: SortConfig['key'] }) => {
    if (sort.key !== column) return <ArrowUpDown size={10} className="text-gray-300" />;
    return sort.direction === 'asc' ? <ChevronUp size={10} className="text-blue-600" /> : <ChevronDown size={10} className="text-blue-600" />;
  };

  const statusColors = {
    active: 'bg-green-50 text-green-700 border-green-100',
    paused: 'bg-yellow-50 text-yellow-700 border-yellow-100',
    draft: 'bg-gray-50 text-gray-700 border-gray-100',
    out_of_stock: 'bg-red-50 text-red-700 border-red-100',
  };

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-base font-black text-gray-900 uppercase tracking-tight">Productos</h1>
          <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">{totalProducts} Herramientas</p>
        </div>
        <div className="flex gap-2">
          <Link to="/admin/products/import" className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-2.5 py-1 text-[9px] font-black uppercase tracking-widest text-gray-600 hover:bg-gray-50 transition-all">
            <Upload size={12} /> Importar
          </Link>
          <Link to="/admin/products/new" className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1 text-[9px] font-black uppercase tracking-widest text-white hover:bg-blue-700 shadow-md shadow-blue-100 transition-all">
            <Plus size={14} /> Nuevo
          </Link>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col gap-2">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <div className="relative flex-1 group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={12} />
            <input
              type="text" placeholder="Buscar..."
              className="w-full rounded-lg border border-gray-200 bg-white py-1.5 pl-8 pr-3 text-[11px] font-bold outline-none focus:border-blue-500 transition-all"
              value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[9px] font-black uppercase tracking-widest transition-all ${showFilters || selectedCategory || selectedStatus ? 'bg-blue-50 text-blue-600 border border-blue-200' : 'bg-white border border-gray-200 text-gray-500'}`}
          >
            <Filter size={12} /> Filtros
          </button>
        </div>

        {showFilters && (
          <div className="flex flex-wrap gap-2 p-2 bg-white rounded-lg border border-gray-200 animate-in fade-in slide-in-from-top-1">
            <div className="space-y-0.5">
              <label className="text-[8px] font-black uppercase text-gray-400 ml-1 tracking-widest">Categoría</label>
              <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)} className="w-32 rounded border-gray-100 bg-gray-50 px-2 py-1 text-[10px] font-bold text-gray-700 outline-none">
                <option value="">Todas</option>
                {categories.map(cat => <option key={cat.uuid} value={cat.slug}>{cat.name}</option>)}
              </select>
            </div>
            <div className="space-y-0.5">
              <label className="text-[8px] font-black uppercase text-gray-400 ml-1 tracking-widest">Estado</label>
              <select value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)} className="w-28 rounded border-gray-100 bg-gray-50 px-2 py-1 text-[10px] font-bold text-gray-700 outline-none">
                <option value="">Todos</option>
                <option value="active">Activo</option>
                <option value="paused">Pausado</option>
                <option value="out_of_stock">Sin Stock</option>
              </select>
            </div>
            <button onClick={() => { setSelectedCategory(''); setSelectedStatus(''); setSearchTerm(''); }} className="mt-auto mb-0.5 p-1 text-gray-400 hover:text-red-500"><X size={14} /></button>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="rounded-lg border border-gray-200 bg-white overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b bg-gray-50/50">
                <th className="px-3 py-2 text-[8px] font-black uppercase tracking-[0.2em] text-gray-400">Producto</th>
                <th className="px-3 py-2 text-[8px] font-black uppercase tracking-[0.2em] text-gray-400">SKU</th>
                <th onClick={() => handleSort('category')} className="px-3 py-2 text-[8px] font-black uppercase tracking-[0.2em] text-gray-400 cursor-pointer hover:text-blue-600">
                  <div className="flex items-center gap-1">Cat <SortIcon column="category" /></div>
                </th>
                <th onClick={() => handleSort('price')} className="px-3 py-2 text-[8px] font-black uppercase tracking-[0.2em] text-gray-400 cursor-pointer hover:text-blue-600">
                  <div className="flex items-center gap-1">Precio <SortIcon column="price" /></div>
                </th>
                <th onClick={() => handleSort('stock')} className="px-3 py-2 text-[8px] font-black uppercase tracking-[0.2em] text-gray-400 cursor-pointer hover:text-blue-600">
                  <div className="flex items-center gap-1">Stock <SortIcon column="stock" /></div>
                </th>
                <th onClick={() => handleSort('status')} className="px-3 py-2 text-[8px] font-black uppercase tracking-[0.2em] text-gray-400 cursor-pointer hover:text-blue-600">
                  <div className="flex items-center gap-1">Estado <SortIcon column="status" /></div>
                </th>
                <th className="px-3 py-2 text-[8px] font-black uppercase tracking-[0.2em] text-gray-400 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan={7} className="px-3 py-10 text-center"><Loader2 className="animate-spin text-blue-600 mx-auto" size={20} /></td></tr>
              ) : products.map((product) => (
                <tr key={product.uuid} className="hover:bg-blue-50/20 transition-all group">
                  <td className="px-3 py-1.5">
                    <div className="flex items-center gap-2">
                      <div className="h-7 w-7 rounded bg-gray-50 border border-gray-100 flex-shrink-0 p-0.5 overflow-hidden">
                        {product.images?.[0]?.url ? <img src={product.images[0].url} className="h-full w-full object-contain" /> : <div className="h-full w-full bg-gray-100" />}
                      </div>
                      <span className="text-[10px] font-bold text-gray-900 line-clamp-1 uppercase tracking-tight">{product.name}</span>
                    </div>
                  </td>
                  <td className="px-3 py-1.5 text-[9px] font-mono text-gray-400 uppercase">{product.sku}</td>
                  <td className="px-3 py-1.5"><span className="text-[8px] font-black uppercase px-1 py-0.5 bg-gray-50 text-gray-400 rounded-sm border border-gray-100">{product.category?.name || 'N/A'}</span></td>
                  <td className="px-3 py-1.5 text-[10px] font-black text-gray-900 tracking-tighter">${product.price.toLocaleString()}</td>
                  <td className="px-3 py-1.5 text-[10px] font-bold tracking-tighter">{product.stock} <span className="text-[8px] font-medium text-gray-400">UDS</span></td>
                  <td className="px-3 py-1.5">
                    <span className={`inline-flex rounded-sm px-1.5 py-0.5 text-[7px] font-black uppercase tracking-tight border ${statusColors[product.status] || 'bg-gray-50 text-gray-500'}`}>
                      {product.status === 'out_of_stock' ? 'Sin Stock' : product.status}
                    </span>
                  </td>
                  <td className="px-3 py-1.5 text-right">
                    <div className="flex items-center justify-end gap-0.5 transition-all">
                      <Link to={`/admin/products/edit/${product.uuid}`} className="p-1 text-blue-600 hover:bg-blue-50 rounded transition-all"><Edit2 size={12} /></Link>
                      <button className="p-1 text-red-600 hover:bg-red-50 rounded transition-all"><Trash2 size={12} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="bg-gray-50 px-3 py-2 border-t border-gray-100 flex items-center justify-between">
          <div className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Pág {page} / {totalPages}</div>
          <div className="flex items-center gap-1">
            <button disabled={page === 1} onClick={() => setPage(page - 1)} className="p-1 rounded border border-gray-200 bg-white text-gray-400 disabled:opacity-30"><ChevronUp className="-rotate-90" size={12} /></button>
            <button disabled={page === totalPages} onClick={() => setPage(page + 1)} className="p-1 rounded border border-gray-200 bg-white text-gray-400 disabled:opacity-30"><ChevronDown className="-rotate-90" size={12} /></button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductList;
