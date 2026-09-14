import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Layout from "./components/Layout";
import Login from "./pages/Login";
import VendorRegister from "./pages/VendorRegister";
import VendorDashboard from "./pages/VendorDashboard";
import Dashboard from "./pages/Dashboard";
import Vendors from "./pages/Vendors";
import VendorDetail from "./pages/VendorDetail";
import Leads from "./pages/Leads";
import SalesTeam from "./pages/SalesTeam";
import Customers from "./pages/Customers";
import CustomerDetail from "./pages/CustomerDetail";
import Coupons from "./pages/Coupons";
import Products from "./pages/Products";
import Batteries from "./pages/Batteries";
import Scooters from "./pages/Scooters";
import Quotations from "./pages/Quotations";
import Reports from "./pages/Reports";
import SiteSettings from "./pages/SiteSettings"; // 👈 1. Import SiteSettings component
import BatteriesPublic from "./pages/BatteriesPublic";
import Sales from "./pages/Sales";

import PublicLayout from "./pages/public/PublicLayout";
import Home from "./pages/public/Home";
import About from "./pages/public/About";
import PublicProducts from "./pages/public/Products";
import PublicProductDetail from "./pages/public/ProductDetail";
import Contact from "./pages/public/Contact";
import { Terms, Privacy } from "./pages/public/Legal";

function PrivateRoute({ children, roles }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />;
  return children;
}

function AppRoutes() {
  return (
    <Routes>
      {/* 1. Public E-commerce Website */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/products" element={<PublicProducts />} />
        <Route path="/products/:id" element={<PublicProductDetail />} />
        <Route path="/battery/:id" element={<BatteriesPublic />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/privacy" element={<Privacy />} />
      </Route>

      {/* 2. Authentication & Registration */}
      <Route path="/login" element={<Login />} />
      <Route path="/vendor/register" element={<VendorRegister />} />

      {/* 3. Vendor Portal */}
      <Route
        path="/vendor-dashboard"
        element={
          <PrivateRoute roles={["VENDOR"]}>
            <VendorDashboard />
          </PrivateRoute>
        }
      />

      {/* 4. CRM Admin & Sales Panel */}
      <Route
        path="/crm"
        element={
          <PrivateRoute roles={["ADMIN", "SALES"]}>
            <Layout />
          </PrivateRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="vendors" element={<Vendors />} />
        
        <Route path="vendors/:id" element={<VendorDetail />} />
        <Route path="vendors/:id/edit" element={<VendorDetail />} />
        <Route path="vendors/:id/documents" element={<VendorDetail />} />
        <Route path="vendors/:id/sales" element={<VendorDetail />} />
        <Route path="vendors/:id/batteries" element={<VendorDetail />} />
        <Route path="vendors/:id/customers" element={<VendorDetail />} />
        <Route path="vendors/:id/history" element={<VendorDetail />} />

        <Route path="sales" element={<Sales />} />
        <Route path="leads" element={<Leads />} />
        <Route path="sales-team" element={<SalesTeam />} />
        <Route path="customers" element={<Customers />} />
        <Route path="customers/:id" element={<CustomerDetail />} />
        <Route path="coupons" element={<Coupons />} />
        <Route path="products" element={<Products />} />
        <Route path="batteries" element={<Batteries />} />
        <Route path="scooters" element={<Scooters />} />
        <Route path="quotations" element={<Quotations />} />
        <Route path="reports" element={<Reports />} />
        <Route path="settings" element={<SiteSettings />} /> {/* 👈 2. Added SiteSettings route */}
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}