
import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { UsersList } from './pages/UsersList';
import { Login } from './pages/Login';
import { UserListType } from './types';
import { AuthProvider, useAuth } from './context/AuthContext';

// Componente para proteger as rotas
const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
          <p className="text-slate-500 text-sm font-medium animate-pulse">Carregando sessao...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Layout>{children}</Layout>;
};

const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      
      {/* Rotas Protegidas */}
      <Route 
        path="/dashboard" 
        element={
          <PrivateRoute>
            <Dashboard />
          </PrivateRoute>
        } 
      />
      <Route 
        path="/dashboard/geral" 
        element={
          <PrivateRoute>
            <UsersList type={UserListType.GENERAL} title="Lista Geral de Alunos" />
          </PrivateRoute>
        } 
      />
      <Route 
        path="/dashboard/novos" 
        element={
          <PrivateRoute>
            <UsersList type={UserListType.NOVOS} title="Novos Alunos" />
          </PrivateRoute>
        } 
      />
      <Route 
        path="/dashboard/renovados" 
        element={
          <PrivateRoute>
            <UsersList type={UserListType.RENOVADOS} title="Alunos Renovados" />
          </PrivateRoute>
        } 
      />
      <Route 
        path="/dashboard/renovados-pendentes" 
        element={
          <PrivateRoute>
            <UsersList type={UserListType.RENOVADOS_PENDENTES} title="Renovações Pendentes" />
          </PrivateRoute>
        } 
      />
      <Route 
        path="/dashboard/novos-pendentes" 
        element={
          <PrivateRoute>
            <UsersList type={UserListType.NOVOS_PENDENTES} title="Novos Pendentes" />
          </PrivateRoute>
        } 
      />

      {/* Fallback */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
};

export default App;
