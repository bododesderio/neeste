import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Landing from "./pages/Landing";
import Products from "./pages/Products";
import Blog from "./pages/Blog";
import Contact from "./pages/Contact";
import Checkout from "./pages/Checkout";
import AdminLogin from "./pages/AdminLogin";
import AdminLayout from "./components/AdminLayout";
import AdminDashboard from "./pages/AdminDashboard";
import AdminSettings from "./pages/AdminSettings";
import AdminProducts from "./pages/AdminProducts";
import AdminOrders from "./pages/AdminOrders";
import AdminBlog from "./pages/AdminBlog";
import AdminNewsletter from "./pages/AdminNewsletter";
import AdminContacts from "./pages/AdminContacts";
import AdminReports from "./pages/AdminReports";
import NotificationDetail from "./pages/NotificationDetail";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/products" element={<Products />} />
        <Route path="/blog" element={<Blog />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/checkout" element={<Checkout />} />

        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="settings" element={<AdminSettings />} />
          <Route path="products" element={<AdminProducts />} />
          <Route path="orders" element={<AdminOrders />} />
          <Route path="blog" element={<AdminBlog />} />
          <Route path="newsletter" element={<AdminNewsletter />} />
          <Route path="contacts" element={<AdminContacts />} />
          <Route path="reports" element={<AdminReports />} />
          <Route path="notification/:id" element={<NotificationDetail />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
