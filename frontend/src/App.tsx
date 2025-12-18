import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';

// Layouts
import MainLayout from './layouts/MainLayoutDark';

// Auth Pages
import Login from './pages/Login/Login';
import ForgotPassword from './pages/ForgotPassword/ForgotPassword';

// Protected Pages
import Dashboard from './pages/Dashboard/DashboardNew';
import GestionLieux from './pages/GestionLieux/GestionLieux';
import Mariages from './pages/Mariages/Mariages';
import MariageForm from './pages/Mariages/MariageForm';

// Styles
import './index.css';

// Protected Route Component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="loading-overlay">
        <div className="spinner"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

// Public Route Component (redirect if authenticated)
const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="loading-overlay">
        <div className="spinner"></div>
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

// Role-based Route Component
const RoleRoute: React.FC<{
  children: React.ReactNode;
  allowedRoles: string[];
}> = ({ children, allowedRoles }) => {
  const { user } = useAuth();

  if (!user || !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

function AppRoutes() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={
        <PublicRoute>
          <Login />
        </PublicRoute>
      } />
      <Route path="/forgot-password" element={
        <PublicRoute>
          <ForgotPassword />
        </PublicRoute>
      } />

      {/* Protected Routes */}
      <Route path="/" element={
        <ProtectedRoute>
          <MainLayout />
        </ProtectedRoute>
      }>
        {/* Dashboard */}
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />

        {/* Mariages */}
        <Route path="mariages" element={<Mariages />} />
        <Route path="mariages/nouveau" element={<MariageForm />} />
        <Route path="mariages/:id" element={<MariageForm />} />
        <Route path="mariages/:id/modifier" element={<MariageForm />} />

        {/* Gestion Lieux - Villes, Arrondissements, Mairies */}
        <Route path="villes" element={
          <RoleRoute allowedRoles={['super_admin']}>
            <GestionLieux />
          </RoleRoute>
        } />
        <Route path="arrondissements" element={
          <RoleRoute allowedRoles={['super_admin']}>
            <GestionLieux />
          </RoleRoute>
        } />
        <Route path="mairies" element={
          <RoleRoute allowedRoles={['super_admin', 'admin_mairie']}>
            <GestionLieux />
          </RoleRoute>
        } />

        {/* Utilisateurs */}
        <Route path="utilisateurs" element={
          <RoleRoute allowedRoles={['super_admin', 'admin_mairie']}>
            <div className="card"><p className="text-center" style={{ padding: '2rem' }}>Page Utilisateurs - À venir</p></div>
          </RoleRoute>
        } />

        {/* Actes */}
        <Route path="actes" element={
          <div className="card"><p className="text-center" style={{ padding: '2rem' }}>Page Actes de Mariage - À venir</p></div>
        } />

        {/* Paramètres */}
        <Route path="parametres" element={
          <RoleRoute allowedRoles={['super_admin', 'admin_mairie']}>
            <div className="card"><p className="text-center" style={{ padding: '2rem' }}>Page Paramètres - À venir</p></div>
          </RoleRoute>
        } />

        {/* Profil */}
        <Route path="profil" element={
          <div className="card"><p className="text-center" style={{ padding: '2rem' }}>Page Profil - À venir</p></div>
        } />
      </Route>

      {/* 404 */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;
