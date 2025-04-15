import React from 'react';
import { BrowserRouter as Router, Routes, Route, Outlet } from 'react-router-dom';
import { Home } from './pages/Home';
import { Contact } from './pages/Contact';
import { BookingPortal } from './pages/BookingPortal'; // Import BookingPortal
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import AdminLayout from './components/admin/Layout'; // Renamed import for clarity
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminCalendar from './pages/admin/AdminCalendar';
import AdminBookings from './pages/admin/AdminBookings';
import AdminCustomers from './pages/admin/AdminCustomers';
// import AdminStaff from './pages/admin/AdminStaff'; // Removed
// import AdminServices from './pages/admin/AdminServices'; // Removed
import AdminInventory from './pages/admin/AdminInventory'; // Import Inventory page
import AdminMessages from './pages/admin/AdminMessages';
import AdminSettings from './pages/admin/AdminSettings';
import AdminLogin from './pages/Login'; // Renamed admin login import
import CustomerLogin from './pages/CustomerLogin'; // Import customer login
import CustomerRegister from './pages/CustomerRegister'; // Import customer register
import ProtectedRoute from './components/ProtectedRoute'; // Added ProtectedRoute import
import CustomerProtectedRoute from './components/CustomerProtectedRoute'; // Import customer protected route
import { Toaster } from 'react-hot-toast'; // Import Toaster
import './i18n/i18n';

// Component to render Navbar/Footer for non-admin routes
const MainLayout: React.FC = () => (
  <div className="min-h-screen flex flex-col">
    <Navbar />
    <main className="flex-grow">
      <Outlet /> {/* Child routes will render here */}
    </main>
    <Footer />
  </div>
);

// Component for the Admin section layout
const AdminSection: React.FC = () => (
  <AdminLayout>
    <Outlet /> {/* Nested admin routes render here */}
  </AdminLayout>
);

function App() {
  return (
    <Router>
      {/* Add Toaster component here for global notifications */}
      <Toaster position="top-center" reverseOrder={false} />
      <Routes>
        {/* Standalone Auth Routes (No Navbar/Footer) */}
        <Route path="/admin/login" element={<AdminLogin />} /> {/* Renamed Admin Login Route */}
        <Route path="/login" element={<CustomerLogin />} /> {/* Customer Login Route */}
        <Route path="/register" element={<CustomerRegister />} /> {/* Customer Register Route */}

        {/* Public Routes with Navbar and Footer */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/contact" element={<Contact />} />
          {/* Protected Customer Route */}
          <Route element={<CustomerProtectedRoute />}>
            <Route path="/book" element={<BookingPortal />} />
            {/* Add other customer-only routes here later (e.g., /my-bookings) */}
          </Route>
        </Route>

        {/* Protected Admin Routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/admin" element={<AdminSection />}>
            <Route index element={<AdminDashboard />} /> {/* Default admin page */}
            <Route path="calendar" element={<AdminCalendar />} />
          <Route path="bookings" element={<AdminBookings />} />
          <Route path="customers" element={<AdminCustomers />} />
          {/* <Route path="staff" element={<AdminStaff />} /> */} {/* Removed */}
          {/* <Route path="services" element={<AdminServices />} /> */} {/* Removed */}
          <Route path="inventory" element={<AdminInventory />} /> {/* Add Inventory route */}
          <Route path="messages" element={<AdminMessages />} />
            <Route path="settings" element={<AdminSettings />} />
            {/* Add other admin routes here */}
          </Route>
        </Route>

        {/* Optional: Add a 404 Not Found route */}
        {/* <Route path="*" element={<NotFound />} /> */}
      </Routes>
    </Router>
  );
}

export default App;
