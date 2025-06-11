
import React, { useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu, X, LayoutDashboard, Users, FileText, BarChart2, LogOut, ChevronDown, ChevronUp, Settings } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const AdminLayout = ({ onAdminLogout, admin }) => { 
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const adminFullName = admin?.fullName || 'Admin'; // Use fullName from localStorage user object
  const logoUrl = "https://storage.googleapis.com/hostinger-horizons-assets-prod/011c2c6d-27ef-4f8d-9fed-8b3e9faf55e0/8ffe6ebc4a34f0f2bae8a9f061210870.png";

  const navItems = [
    { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Manajemen User', path: '/admin/users', icon: Users },
    { name: 'Manajemen Soal', path: '/admin/questions', icon: FileText },
    { name: 'Hasil Ujian', path: '/admin/results', icon: BarChart2 },
    { name: 'Pengaturan Ujian', path: '/admin/settings', icon: Settings },
  ];

  const isActive = (path) => location.pathname === path || (path === '/admin/settings' && location.pathname.startsWith('/admin/settings'));


  const NavLink = ({ item }) => (
    <Link
      to={item.path}
      onClick={() => setIsMobileMenuOpen(false)}
      className={`flex items-center px-4 py-3 rounded-lg transition-all duration-200 ease-in-out
        ${isActive(item.path)
          ? 'bg-amber-500 text-white shadow-lg transform scale-105'
          : 'text-slate-300 hover:bg-slate-700 hover:text-amber-300'
        }`}
    >
      <item.icon className={`w-5 h-5 mr-3 ${isActive(item.path) ? 'text-white' : 'text-slate-400'}`} />
      <span className="font-medium">{item.name}</span>
    </Link>
  );

  return (
    <div className="min-h-screen flex bg-slate-900 text-slate-100">
      <aside className="hidden md:flex md:flex-col w-64 bg-slate-800 p-4 space-y-4 shadow-lg">
        <div className="flex items-center justify-center py-4 mb-4 border-b border-slate-700">
          <img 
            src={logoUrl}
            alt="Admin Logo CAT JULUKANA"
            className="w-12 h-12 mr-2 rounded-full"
          />
          <h1 className="text-xl font-bold text-amber-400">Admin Panel</h1>
        </div>
        <nav className="flex-1 space-y-2">
          {navItems.map((item) => <NavLink key={item.name} item={item} />)}
        </nav>
        <div className="mt-auto">
          <Button
            onClick={onAdminLogout}
            variant="ghost"
            className="w-full justify-start text-slate-300 hover:bg-red-500 hover:text-white"
          >
            <LogOut className="w-5 h-5 mr-3 text-slate-400 group-hover:text-white" />
            Logout
          </Button>
        </div>
      </aside>

      <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
        <SheetTrigger asChild className="md:hidden fixed top-4 left-4 z-50">
          <Button variant="outline" size="icon" className="bg-slate-800 border-slate-700 hover:bg-slate-700">
            <Menu className="h-6 w-6 text-amber-400" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="bg-slate-800 p-0 border-r-slate-700 w-64 md:w-72">
            <div className="flex items-center justify-between p-4 border-b border-slate-700">
                <div className="flex items-center">
                    <img src={logoUrl} alt="Admin Logo CAT JULUKANA" className="w-10 h-10 mr-2 rounded-full"/>
                    <h1 className="text-lg font-bold text-amber-400">Admin Panel</h1>
                </div>
                 <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(false)}>
                    <X className="h-5 w-5 text-slate-400"/>
                </Button>
            </div>
            <nav className="p-4 space-y-2">
              {navItems.map((item) => <NavLink key={item.name} item={item} />)}
            </nav>
            <div className="p-4 mt-auto border-t border-slate-700">
              <Button
                onClick={() => { onAdminLogout(); setIsMobileMenuOpen(false); }}
                variant="ghost"
                className="w-full justify-start text-slate-300 hover:bg-red-500 hover:text-white"
              >
                <LogOut className="w-5 h-5 mr-3 text-slate-400" />
                Logout
              </Button>
            </div>
        </SheetContent>
      </Sheet>

      <div className="flex-1 flex flex-col overflow-hidden">
         <header className="bg-slate-800 shadow-md p-4 flex justify-between items-center md:justify-end">
           <div className="md:hidden"> </div>
            <div className="relative">
                <Button variant="ghost" onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)} className="flex items-center space-x-2 text-slate-300 hover:text-amber-400">
                <img src={`https://ui-avatars.com/api/?name=${adminFullName.charAt(0)}&background=fbbf24&color=78350f`} alt="Admin Avatar" className="w-8 h-8 rounded-full"/>
                <span>{adminFullName}</span>
                {isProfileDropdownOpen ? <ChevronUp className="w-4 h-4"/> : <ChevronDown className="w-4 h-4"/>}
                </Button>
                <AnimatePresence>
                {isProfileDropdownOpen && (
                <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute right-0 mt-2 w-48 bg-slate-700 rounded-md shadow-lg py-1 z-50 border border-slate-600">
                    <button
                    onClick={() => { onAdminLogout(); setIsProfileDropdownOpen(false); }}
                    className="flex items-center w-full px-4 py-2 text-sm text-slate-300 hover:bg-red-500 hover:text-white"
                    >
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                    </button>
                </motion.div>
                )}
                </AnimatePresence>
            </div>
        </header>

        <main className="flex-1 p-6 md:p-8 overflow-y-auto bg-slate-900">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
