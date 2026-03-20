import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, ShoppingCart, Package, Users, Settings, LogOut, Menu, Tags, Bookmark, Truck, FileText, Percent, History } from 'lucide-react';
import { useState } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import api from '../services/api';

const AdminLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();
  const logout = useAuthStore((state) => state.logout);
  const user = useAuthStore((state) => state.user);

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      logout();
      navigate('/admin/login');
    }
  };

  const menuItems = [
    { name: 'Dashboard', icon: <LayoutDashboard size={20} />, path: '/admin' },
    { name: 'Pedidos', icon: <ShoppingCart size={20} />, path: '/admin/orders' },
    { name: 'Productos', icon: <Package size={20} />, path: '/admin/products' },
    { name: 'Categorías', icon: <Tags size={20} />, path: '/admin/categories' },
    { name: 'Marcas', icon: <Bookmark size={20} />, path: '/admin/brands' },
    { name: 'Stock Movimientos', icon: <History size={20} />, path: '/admin/inventory/movements' },
    { name: 'Descuentos', icon: <Percent size={20} />, path: '/admin/discounts' },
    { name: 'Facturas de Compra', icon: <FileText size={20} />, path: '/admin/purchases' },
    { name: 'Proveedores', icon: <Truck size={20} />, path: '/admin/suppliers' },
    { name: 'Clientes', icon: <Users size={20} />, path: '/admin/customers' },
    { name: 'Configuración', icon: <Settings size={20} />, path: '/admin/settings' },
  ];

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className={`bg-white shadow-md transition-all ${isSidebarOpen ? 'w-64' : 'w-20'} flex flex-col`}>
        <div className="flex h-16 items-center justify-between border-b px-4">
          <span className={`font-bold text-xl text-blue-600 ${!isSidebarOpen && 'hidden'}`}>Tools Admin</span>
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="rounded p-1 hover:bg-gray-100">
            <Menu size={20} />
          </button>
        </div>
        
        {/* User Info */}
        <div className={`p-4 border-b ${!isSidebarOpen && 'hidden'}`}>
          <p className="text-sm font-semibold text-gray-800">{user?.name}</p>
          <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
        </div>

        <nav className="flex-1 space-y-2 p-4 overflow-y-auto">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-4 rounded-lg px-4 py-2 transition-colors ${
                location.pathname === item.path ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              {item.icon}
              <span className={`${!isSidebarOpen && 'hidden'}`}>{item.name}</span>
            </Link>
          ))}
        </nav>
        <div className="border-t p-4">
          <button 
            onClick={handleLogout}
            className="flex w-full items-center gap-4 rounded-lg px-4 py-2 text-red-600 hover:bg-red-50 transition-colors"
          >
            <LogOut size={20} />
            <span className={`${!isSidebarOpen && 'hidden'}`}>Cerrar sesión</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto p-8">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
