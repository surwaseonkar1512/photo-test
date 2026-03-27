import React, { useState, useEffect } from 'react';
import { Outlet, Navigate, Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, Image as ImageIcon, Layers, 
  BookOpen, MessageSquare, DollarSign, 
  Settings, LogOut, Users, Menu, X 
} from 'lucide-react';

const AdminSidebar = ({ isOpen, setIsOpen }) => {
  const location = useLocation();
  
  const navItems = [
    { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Media Library', path: '/admin/media', icon: ImageIcon },
    { name: 'Banners', path: '/admin/banners', icon: Layers },
    { name: 'Portfolio', path: '/admin/portfolio', icon: ImageIcon },
    { name: 'Categories', path: '/admin/categories', icon: BookOpen },
    { name: 'Stories', path: '/admin/stories', icon: Users },
    { name: 'Testimonials', path: '/admin/testimonials', icon: MessageSquare },
    { name: 'Pricing', path: '/admin/pricing', icon: DollarSign },
    { name: 'CRM Pipeline', path: '/admin/crm', icon: MessageSquare },
    { name: 'Revenue Analytics', path: '/admin/revenue', icon: DollarSign },
    { name: 'Settings', path: '/admin/settings', icon: Settings },
  ];

  // Close sidebar on mobile when route changes
  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname, setIsOpen]);

  return (
    <>
      {/* Mobile Backdrop */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar Content */}
      <aside 
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-[#0A0A0A] text-gray-300 border-r border-[#1A1A1A] flex-shrink-0 transform transition-transform duration-300 ease-in-out md:static md:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="h-16 flex items-center justify-between px-6 border-b border-[#1A1A1A] bg-black/40">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold tracking-tighter">
              P
            </div>
            <span className="font-serif font-bold text-xl tracking-tight text-white">Studio Admin</span>
          </div>
          <button onClick={() => setIsOpen(false)} className="md:hidden p-1 text-gray-400 hover:text-white">
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <div className="py-6 overflow-y-auto h-[calc(100vh-4rem)] custom-scrollbar">
          <div className="px-4 mb-4">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Management</p>
          </div>
          <nav className="grid gap-1 px-3">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname.startsWith(item.path);
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200 ${
                    isActive 
                      ? 'bg-gradient-to-r from-indigo-500/10 to-purple-500/10 text-white border border-indigo-500/20 shadow-[0_0_15px_rgba(99,102,241,0.05)]' 
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Icon className={`h-4 w-4 ${isActive ? 'text-indigo-400' : 'opacity-70'}`} />
                  {item.name}
                  {isActive && (
                    <div className="ml-auto w-1.5 h-1.5 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.8)]" />
                  )}
                </Link>
              );
            })}
          </nav>
        </div>
      </aside>
    </>
  );
};

const AdminLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const userInfo = JSON.parse(localStorage.getItem('userInfo'));

  if (!userInfo || !userInfo.token) {
    return <Navigate to="/admin/login" replace />;
  }

  const handleLogout = () => {
    localStorage.removeItem('userInfo');
    window.location.href = '/admin/login';
  };

  return (
    <div className="flex bg-muted/10 text-foreground min-h-screen">
      <AdminSidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      
      <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
        {/* Topbar */}
        <header className="h-16 flex items-center justify-between px-6 border-b bg-background/80 backdrop-blur-md sticky top-0 z-30 shadow-sm">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 -ml-2 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground md:hidden transition-colors"
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="hidden sm:flex items-center gap-2 text-sm">
              <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-muted-foreground">Admin Session</span>
            </div>
            
            <div className="h-8 w-px bg-border hidden sm:block" />
            
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                {userInfo.name.charAt(0)}
              </div>
              <span className="text-sm font-medium hidden sm:block">{userInfo.name}</span>
              <button 
                onClick={handleLogout}
                className="flex items-center justify-center h-8 w-8 rounded-full text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors ml-2"
                title="Logout"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          </div>
        </header>
        
        {/* Main Content Area */}
        <main className="flex-1 p-4 md:p-8 overflow-y-auto custom-scrollbar relative">
          {/* Subtle background gradient blob for premium feel */}
          <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-br from-indigo-500/5 via-purple-500/5 to-transparent -z-10 pointer-events-none rounded-b-[100%]" />
          
          <div className="mx-auto max-w-7xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
