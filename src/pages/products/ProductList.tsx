import { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Trash2, Eye, Filter, Upload, Loader2 } from 'lucide-react';
import api from '../../services/api';
import { Link } from 'react-router-dom';
import { IProduct } from '../../types';

const ProductList = () => {
  const [products, setProducts] = useState<IProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (page !== 1) {
        setPage(1); // Resetear a página 1 al buscar
      } else {
        fetchProducts();
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  useEffect(() => {
    fetchProducts();
  }, [page]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await api.get<{ products: IProduct[], total: number, totalPages: number, page: number }>('/products', {
        params: {
          page,
          limit: 10,
          q: searchTerm
        },
      });
      setProducts(response.data.products || []);
      setTotalPages(response.data.totalPages || 1);
      setTotalProducts(response.data.total || 0);
      setError(null);
    } catch (err: any) {
      setError('Error al cargar productos. Por favor, intenta de nuevo.');
      console.error('Error fetching products:', err);
    } finally {
      setLoading(false);
    }
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
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Productos</h1>
          <p className="text-sm text-gray-500">Gestiona tu inventario y catálogo</p>
        </div>
        <div className="flex gap-2">
          <Link 
            to="/admin/products/import"
            className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 font-medium text-gray-600 transition-colors hover:bg-gray-50"
          >
            <Upload size={18} />
            Importar
          </Link>
          <Link 
            to="/admin/products/new"
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 font-medium text-white transition-colors hover:bg-blue-700"
          >
            <Plus size={18} />
            Nuevo Producto
          </Link>
        </div>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Buscar por nombre o SKU..."
            className="w-full rounded-lg border border-gray-200 bg-white py-2.5 pl-10 pr-4 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2.5 font-medium text-gray-600 hover:bg-gray-50 transition-colors">
          <Filter size={18} />
          Filtros
        </button>
      </div>

      <div className="rounded-xl border border-gray-100 bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="border-b bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-sm font-semibold text-gray-600">Producto</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-600">SKU</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-600">Categoría</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-600">Precio</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-600">Stock</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-600">Estado</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-600 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <Loader2 className="animate-spin text-blue-600" size={32} />
                      <span className="text-gray-500 font-medium">Cargando productos...</span>
                    </div>
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-red-500 font-medium">{error}</td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                    {searchTerm ? `No se encontraron resultados para "${searchTerm}"` : "No hay productos registrados."}
                  </td>
                </tr>
              ) : (
                products.map((product) => (
                  <tr key={product.uuid} className="hover:bg-gray-50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0 border border-gray-100">
                          {product.images && product.images.length > 0 ? (
                            <img src={product.images[0].url} alt="" className="h-full w-full object-cover" />
                          ) : (
                            <div className="h-full w-full flex items-center justify-center text-[10px] text-gray-400 font-bold uppercase">Sin foto</div>
                          )}
                        </div>
                        <span className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors">{product.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 font-mono">{product.sku}</td>
                    <td className="px-6 py-4">
                      <span className="text-xs font-semibold text-gray-500 bg-gray-100 px-2 py-1 rounded">
                        {product.category?.name || 'Sin Categoría'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm font-black text-gray-900">${product.price.toLocaleString()}</td>
                    <td className="px-6 py-4 text-sm text-gray-600 font-medium">{product.stock}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider ${statusColors[product.status]}`}>
                        {statusLabels[product.status]}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Link 
                          to={`/products/${product.category?.slug}/${product.slug}`}
                          target="_blank"
                          className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all" 
                          title="Ver en tienda"
                        >
                          <Eye size={18} />
                        </Link>
                        <Link 
                          to={`/admin/products/edit/${product.uuid}`}
                          className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-all" 
                          title="Editar"
                        >
                          <Edit2 size={18} />
                        </Link>
                        <button className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all" title="Eliminar">
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
        
        <div className="flex flex-col sm:flex-row items-center justify-between border-t bg-gray-50 px-6 py-4 gap-4">
          <span className="text-sm text-gray-600 font-medium">
            Mostrando <span className="text-gray-900">{products.length}</span> de <span className="text-gray-900">{totalProducts}</span> productos
            (Página {page} de {totalPages})
          </span>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setPage(prev => Math.max(prev - 1, 1))}
              disabled={page === 1 || loading}
              className="rounded-lg border bg-white px-4 py-2 text-sm font-bold text-gray-700 shadow-sm hover:bg-gray-50 disabled:opacity-50 transition-all"
            >
              Anterior
            </button>
            <div className="flex items-center gap-1 px-2">
              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i + 1}
                  onClick={() => setPage(i + 1)}
                  className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${page === i + 1 ? 'bg-blue-600 text-white' : 'hover:bg-gray-200 text-gray-600'}`}
                >
                  {i + 1}
                </button>
              )).slice(Math.max(0, page - 3), Math.min(totalPages, page + 2))}
            </div>
            <button 
              onClick={() => setPage(prev => Math.min(prev + 1, totalPages))}
              disabled={page === totalPages || totalPages === 0 || loading}
              className="rounded-lg border bg-white px-4 py-2 text-sm font-bold text-gray-700 shadow-sm hover:bg-gray-50 disabled:opacity-50 transition-all"
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
