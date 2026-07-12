import React from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import PageTransition from './components/PageTransition';

import Home       from './pages/Home';
import Browse     from './pages/Browse';
import CDDetail   from './pages/CDDetail';
import Login      from './pages/Login';
import Signup     from './pages/Signup';
import MyRentals  from './pages/MyRentals';
import Contact    from './pages/Contact';

import AdminLayout    from './pages/admin/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminCDs       from './pages/admin/AdminCDs';
import AdminRentals   from './pages/admin/AdminRentals';
import AdminCalendar  from './pages/admin/AdminCalendar';
import AdminSettings  from './pages/admin/AdminSettings';

function AnimatedRoutes() {
  const location = useLocation();
  return (
    <PageTransition key={location.pathname}>
      <Routes location={location}>
        <Route path="/"        element={<Home />} />
        <Route path="/browse"  element={<Browse />} />
        <Route path="/cd/:id"  element={<CDDetail />} />
        <Route path="/login"   element={<Login />} />
        <Route path="/signup"  element={<Signup />} />
        <Route path="/contact" element={<Contact />} />

        <Route path="/my-rentals" element={
          <ProtectedRoute><MyRentals /></ProtectedRoute>
        } />

        <Route path="/admin" element={
          <ProtectedRoute adminOnly><AdminLayout /></ProtectedRoute>
        }>
          <Route index            element={<AdminDashboard />} />
          <Route path="cds"       element={<AdminCDs />} />
          <Route path="rentals"   element={<AdminRentals />} />
          <Route path="calendar"  element={<AdminCalendar />} />
          <Route path="settings"  element={<AdminSettings />} />
        </Route>
      </Routes>
    </PageTransition>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Navbar />
        <AnimatedRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}
