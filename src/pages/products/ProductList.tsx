import { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Trash2, Eye, Filter, Upload } from 'lucide-react';
import api from '../../services/api';
import { Link } from 'react-router-dom';
import { IProduct } from '../../types';

const ProductList = () => {
  const [products, setProducts] = useState<IProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => {
    fetchProducts();
  }, [page]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await api.get<{ products: IProduct[], total: number, pages: number }>('/products', {
        params: {
          page,
          limit: 10,
        },
      });
      setProducts(response.data.products);
      setTotalPages(response.data.pages);
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
        <h1 className="text-2xl font-bold text-gray-800">Productos</h1>
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
            className="w-full rounded-lg border border-gray-200 bg-white py-2 pl-10 pr-4 outline-none focus:border-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 font-medium text-gray-600 hover:bg-gray-50 transition-colors">
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
                  <td colSpan={7} className="px-6 py-8 text-center text-gray-500">Cargando productos...</td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-red-500">{error}</td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-gray-500">No se encontraron productos.</td>
                </tr>
              ) : (
                products.map((product) => (
                  <tr key={product.uuid} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded bg-gray-100 overflow-hidden">
                          {product.images && product.images.length > 0 ? (
                            <img src={product.images[0].url} alt="" className="h-full w-full object-cover" />
                          ) : null}
                        </div>
                        <span className="font-medium text-gray-800">{product.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{product.sku}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{product.category?.name || 'N/A'}</td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">${product.price.toLocaleString()}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{product.stock}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColors[product.status]}`}>
                        {statusLabels[product.status]}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button className="p-1 text-gray-400 hover:text-blue-600 transition-colors" title="Ver en tienda">
                          <Eye size={18} />
                        </button>
                        <Link 
                          to={`/admin/products/edit/${product.uuid}`}
                          className="p-1 text-gray-400 hover:text-green-600 transition-colors" 
                          title="Editar"
                        >
                          <Edit2 size={18} />
                        </Link>
                        <button className="p-1 text-gray-400 hover:text-red-600 transition-colors" title="Eliminar">
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
        
        <div className="flex items-center justify-between border-t px-6 py-4">
          <span className="text-sm text-gray-600">
            Página {page} de {totalPages || 1}
          </span>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setPage(prev => Math.max(prev - 1, 1))}
              disabled={page === 1}
              className="rounded-lg border px-4 py-1.5 text-sm font-medium hover:bg-gray-50 disabled:opacity-50"
            >
              Anterior
            </button>
            <button 
              onClick={() => setPage(prev => Math.min(prev + 1, totalPages))}
              disabled={page === totalPages || totalPages === 0}
              className="rounded-lg border px-4 py-1.5 text-sm font-medium hover:bg-gray-50 disabled:opacity-50"
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
