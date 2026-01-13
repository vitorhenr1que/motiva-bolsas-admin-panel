
import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, 
  Users, 
  UserPlus, 
  RefreshCcw, 
  AlertCircle, 
  Clock, 
  Menu, 
  X,
  LogOut,
  User as UserIcon
} from 'lucide-react';

const SidebarItem: React.FC<{
  to: string;
  icon: React.ReactNode;
  label: string;
  active: boolean;
  onClick?: () => void;
}> = ({ to, icon, label, active, onClick }) => (
  <Link
    to={to}
    onClick={onClick}
    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
      active 
        ? 'bg-blue-600 text-white shadow-md' 
        : 'text-slate-600 hover:bg-slate-100'
    }`}
  >
    {icon}
    <span className="font-medium">{label}</span>
  </Link>
);

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const menuItems = [
    { to: '/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
    { to: '/dashboard/geral', label: 'Lista Geral', icon: <Users size={20} /> },
    { to: '/dashboard/novos', label: 'Novos Alunos', icon: <UserPlus size={20} /> },
    { to: '/dashboard/renovados', label: 'Renovados', icon: <RefreshCcw size={20} /> },
    { to: '/dashboard/renovados-pendentes', label: 'Renovação Pendente', icon: <Clock size={20} /> },
    { to: '/dashboard/novos-pendentes', label: 'Novos Pendentes', icon: <AlertCircle size={20} /> },
  ];

  return (
    <div className="flex min-h-screen">
      {/* Mobile Backdrop */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-200 transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex flex-col h-full">
          <div className="p-6 border-b border-slate-100">
            <h1 className="text-xl font-bold text-blue-700 flex items-center gap-2">
              <span className="bg-blue-600 text-white p-1 rounded italic">M</span>
              Motiva Bolsas
            </h1>
            <p className="text-xs text-slate-400 mt-1 uppercase tracking-wider font-semibold">Relatórios</p>
          </div>

          <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
            {menuItems.map((item) => (
              <SidebarItem
                key={item.to}
                {...item}
                active={location.pathname === item.to}
                onClick={() => setIsSidebarOpen(false)}
              />
            ))}
          </nav>

          <div className="p-4 border-t border-slate-100">
             <button 
               onClick={handleLogout}
               className="flex items-center gap-3 w-full px-4 py-3 rounded-lg text-slate-500 hover:bg-red-50 hover:text-red-600 transition-colors"
             >
               <LogOut size={20} />
               <span className="font-medium">Sair do Sistema</span>
             </button>
          </div>
        </div>
      </aside>

      {/* Content */}
      <main className="flex-1 flex flex-col min-w-0 bg-slate-50">
        <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              className="lg:hidden p-2 hover:bg-slate-100 rounded-md"
              onClick={() => setIsSidebarOpen(true)}
            >
              <Menu size={24} />
            </button>
            <h2 className="text-lg font-semibold text-slate-800">
              {menuItems.find(item => item.to === location.pathname)?.label || 'Painel'}
            </h2>
          </div>
          <div className="flex items-center gap-3">
             <div className="text-right hidden sm:block">
               <p className="text-sm font-medium text-slate-900">{user?.name || 'Administrador'}</p>
               <p className="text-xs text-slate-500">Acesso {user?.role || 'Geral'}</p>
             </div>
             <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 border-2 border-white shadow-sm overflow-hidden">
               {user?.role === 'Master' ? <UserIcon size={20} /> : 'AD'}
             </div>
          </div>
        </header>

        <div className="p-6 overflow-y-auto h-[calc(100vh-73px)]">
          {children}
        </div>
      </main>
    </div>
  );
};
