import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, ShoppingCart, Package, Users, Settings, LogOut, Menu, Tags, Bookmark, Truck, FileText, Percent, History, ChevronRight } from 'lucide-react';
import { useState } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import api from '../services/api';

const AdminLayout = () => {
  // Sidebar cerrada por defecto como se solicitó
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
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
    { name: 'Dashboard', icon: <LayoutDashboard size={18} />, path: '/admin' },
    { name: 'Pedidos', icon: <ShoppingCart size={18} />, path: '/admin/orders' },
    { name: 'Productos', icon: <Package size={18} />, path: '/admin/products' },
    { name: 'Categorías', icon: <Tags size={18} />, path: '/admin/categories' },
    { name: 'Marcas', icon: <Bookmark size={18} />, path: '/admin/brands' },
    { name: 'Stock Movimientos', icon: <History size={18} />, path: '/admin/inventory/movements' },
    { name: 'Descuentos', icon: <Percent size={18} />, path: '/admin/discounts' },
    { name: 'Facturas de Compra', icon: <FileText size={18} />, path: '/admin/purchases' },
    { name: 'Proveedores', icon: <Truck size={18} />, path: '/admin/suppliers' },
    { name: 'Clientes', icon: <Users size={18} />, path: '/admin/customers' },
    { name: 'Configuración', icon: <Settings size={18} />, path: '/admin/settings' },
  ];

  return (
    <div className="flex h-screen bg-[#F8FAFC] text-gray-700 overflow-hidden">
      {/* Sidebar - Optimized for Data Density */}
      <aside 
        className={`bg-white border-r border-gray-200 transition-all duration-300 ease-in-out shadow-sm flex flex-col ${
          isSidebarOpen ? 'w-56' : 'w-16'
        }`}
      >
        <div className="flex h-14 items-center justify-between border-b px-4">
          <span className={`font-black text-xs text-blue-600 uppercase tracking-tighter italic ${!isSidebarOpen && 'hidden'}`}>
            Tools Admin
          </span>
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)} 
            className="rounded-lg p-1.5 hover:bg-gray-100 text-gray-500 transition-colors"
          >
            <Menu size={18} />
          </button>
        </div>
        
        {/* User Badge - Compact */}
        <div className={`p-3 border-b bg-gray-50/50 ${!isSidebarOpen ? 'flex justify-center' : ''}`}>
          {isSidebarOpen ? (
            <div>
              <p className="text-[10px] font-black uppercase text-gray-800 tracking-tight leading-none">{user?.name}</p>
              <p className="text-[9px] text-gray-400 font-bold uppercase mt-1 tracking-widest">{user?.role}</p>
            </div>
          ) : (
            <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600 text-[10px] font-black">
              {user?.name?.charAt(0)}
            </div>
          )}
        </div>

        <nav className="flex-1 space-y-0.5 p-2 overflow-y-auto">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-all group ${
                  isActive 
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-100' 
                  : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                }`}
                title={!isSidebarOpen ? item.name : ''}
              >
                <span className={`${isActive ? 'text-white' : 'text-gray-400 group-hover:text-gray-600'}`}>
                  {item.icon}
                </span>
                <span className={`text-[11px] font-bold uppercase tracking-tight ${!isSidebarOpen && 'hidden'}`}>
                  {item.name}
                </span>
                {isActive && isSidebarOpen && (
                  <ChevronRight size={12} className="ml-auto opacity-50" />
                )}
              </Link>
            );
          })}
        </nav>

        <div className="border-t p-2">
          <button 
            onClick={handleLogout}
            className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-red-500 hover:bg-red-50 transition-colors ${!isSidebarOpen && 'justify-center'}`}
            title={!isSidebarOpen ? 'Cerrar sesión' : ''}
          >
            <LogOut size={18} />
            <span className={`text-[11px] font-bold uppercase tracking-tight ${!isSidebarOpen && 'hidden'}`}>Salir</span>
          </button>
        </div>
      </aside>

      {/* Main Content - Compact Spacing */}
      <main className="flex-1 overflow-auto bg-[#F8FAFC]">
        <div className="p-4 md:p-6 mx-auto max-w-[1600px]">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
