import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { CustomerLayout } from './components/customer/CustomerLayout';
import { Login } from './pages/Login';
import { ScrollToTop } from './components/ScrollToTop';
import { useStore } from './store/useStore';

export default function App() {
  const { theme } = useStore();
  
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  return (
    <Router>
      <ScrollToTop />
      <Routes>
        {/* Main Prefix Route */}
        <Route path="logesh-vivasayi">
          <Route path="home" element={<CustomerLayout />} />
          <Route path="product" element={<CustomerLayout />} />
          <Route path="contact" element={<CustomerLayout />} />
          <Route path="login" element={<Login />} />
          <Route path="dashboard" element={<Layout />} />
          <Route path="products" element={<Layout />} />
          <Route path="billing" element={<Layout />} />
          <Route path="inventory" element={<Layout />} />
          <Route path="customers" element={<Layout />} />
          <Route path="reports" element={<Layout />} />
          <Route path="order-history" element={<Layout />} />
          <Route path="orders" element={<Layout />} />
          <Route path="note" element={<Layout />} />
          <Route path="expenses" element={<Layout />} />
          <Route path="settings" element={<Layout />} />
          <Route path="*" element={<Navigate to="home" replace />} />
        </Route>

        <Route path="/" element={<CustomerLayout />} />
        
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}
