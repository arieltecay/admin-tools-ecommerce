import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import ProductList from './pages/products/ProductList';
import ProductForm from './pages/products/ProductForm';
import ImportProducts from './pages/products/ImportProducts';
import OrderList from './pages/orders/OrderList';
import OrderDetail from './pages/orders/OrderDetail';
import CategoryList from './pages/categories/CategoryList';
import BrandList from './pages/brands/BrandList';
import CustomerList from './pages/customers/CustomerList';
import SupplierList from './pages/purchases/SupplierList';
import PurchaseInvoiceList from './pages/purchases/PurchaseInvoiceList';
import PurchaseInvoiceForm from './pages/purchases/PurchaseInvoiceForm';
import StockMovementList from './pages/inventory/StockMovementList';
import DiscountCodeList from './pages/discounts/DiscountCodeList';
import SettingsPage from './pages/settings/SettingsPage';
import FinancePage from './pages/finance';
import HeroManager from './pages/hero/HeroManager';
import AdminLayout from './layout/AdminLayout';
import { useAuthStore } from './store/useAuthStore';

function App() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return (
    <Routes>
      <Route 
        path="/admin/login" 
        element={!isAuthenticated ? <Login /> : <Navigate to="/admin" />} 
      />
      
      <Route 
        path="/admin" 
        element={isAuthenticated ? <AdminLayout /> : <Navigate to="/admin/login" />}
      >
        <Route index element={<Dashboard />} />
        <Route path="products" element={<ProductList />} />
        <Route path="products/new" element={<ProductForm />} />
        <Route path="products/edit/:uuid" element={<ProductForm />} />
        <Route path="products/import" element={<ImportProducts />} />
        <Route path="categories" element={<CategoryList />} />
        <Route path="brands" element={<BrandList />} />
        <Route path="orders" element={<OrderList />} />
        <Route path="orders/:id" element={<OrderDetail />} />
        <Route path="customers" element={<CustomerList />} />
        <Route path="suppliers" element={<SupplierList />} />
        <Route path="purchases" element={<PurchaseInvoiceList />} />
        <Route path="purchases/new" element={<PurchaseInvoiceForm />} />
        <Route path="inventory/movements" element={<StockMovementList />} />
        <Route path="discounts" element={<DiscountCodeList />} />
        <Route path="finance" element={<FinancePage />} />
        <Route path="settings" element={<SettingsPage />} />
        <Route path="hero" element={<HeroManager />} />
      </Route>

      <Route path="/" element={<Navigate to="/admin" />} />
    </Routes>
  );
}

export default App;
