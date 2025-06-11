
import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';
import { useToast } from '@/components/ui/use-toast';

import UserCBT from '@/pages/UserCBT';
import LoginScreen from '@/components/LoginScreen';
import AdminLayout from '@/pages/admin/AdminLayout';
import AdminDashboard from '@/pages/admin/AdminDashboard';
import AdminUserManagement from '@/pages/admin/AdminUserManagement';
import AdminQuestionManagement from '@/pages/admin/AdminQuestionManagement';
import AdminResultsView from '@/pages/admin/AdminResultsView';
import AdminExamSettings from '@/pages/admin/AdminExamSettings';
import { questions as initialQuestionsData } from '@/data/questions';


function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const { toast } = useToast();
  const navigate = useNavigate();
  const [examSettings, setExamSettings] = useState(() => {
    const savedSettings = localStorage.getItem('examSettings');
    return savedSettings ? JSON.parse(savedSettings) : {
      duration_minutes: 120,
      passing_grade_percentage: 70,
      shuffle_questions: false,
      detect_tab_switch: false,
    };
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = "CAT JULUKANA";
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      setCurrentUser(JSON.parse(savedUser));
    }

    const registeredUsers = JSON.parse(localStorage.getItem('registeredUsers')) || [];
    const adminNipDefault = "123456789012345678"; 
    if (!registeredUsers.some(u => u.nip === adminNipDefault && u.role === 'admin')) {
      const initialAdmin = { 
        id: 'admin_default_julukana', 
        fullName: 'Admin CAT JULUKANA', 
        nip: adminNipDefault,
        role: 'admin' 
      };
      
      const otherUsers = registeredUsers.filter(u => !(u.nip === adminNipDefault && u.role === 'admin'));
      localStorage.setItem('registeredUsers', JSON.stringify([initialAdmin, ...otherUsers]));
    }
    
    const cbtQuestions = localStorage.getItem('cbtQuestions');
    if (!cbtQuestions) {
        localStorage.setItem('cbtQuestions', JSON.stringify(initialQuestionsData));
    }

    setLoading(false);
  }, []);

  const handleLogin = (loginData) => {
    const { fullName, nip } = loginData;
    const registeredUsers = JSON.parse(localStorage.getItem('registeredUsers')) || [];
    
    const foundUser = registeredUsers.find(
      u => u.fullName.toLowerCase() === fullName.toLowerCase() && u.nip === nip
    );

    if (foundUser) {
      setCurrentUser(foundUser);
      localStorage.setItem('currentUser', JSON.stringify(foundUser));
      
      if (foundUser.role === 'admin') {
        toast({
          title: "Login Admin Berhasil",
          description: `Selamat datang, ${foundUser.fullName}!`,
        });
        navigate('/admin/dashboard');
      } else {
        toast({
          title: "Login Peserta Berhasil",
          description: `Selamat datang, ${foundUser.fullName}!`,
        });
        navigate('/cbt');
      }
    } else {
      toast({
        title: "Login Gagal",
        description: "Nama Lengkap atau NIP tidak terdaftar/salah. Hubungi admin.",
        variant: "destructive",
      });
    }
  };
  
  const handleLogout = () => {
    const userRole = currentUser?.role;
    setCurrentUser(null);
    localStorage.removeItem('currentUser');
    toast({ title: "Logout Berhasil" });
    if (userRole === 'admin') {
      navigate('/');
    } else {
      navigate('/');
    }
  };

  const updateExamSettings = (newSettings) => {
    setExamSettings(newSettings);
    localStorage.setItem('examSettings', JSON.stringify(newSettings));
    toast({ title: "Pengaturan Disimpan", description: "Pengaturan ujian berhasil diperbarui." });
  };

  if (loading) {
    return <div className="flex items-center justify-center h-screen bg-slate-900 text-white text-xl">Memuat Aplikasi CAT JULUKANA...</div>;
  }

  return (
    <>
      <Routes>
        <Route 
          path="/" 
          element={
            currentUser ? (
              currentUser.role === 'admin' ? <Navigate to="/admin/dashboard" /> : <Navigate to="/cbt" />
            ) : (
              <LoginScreen onLogin={handleLogin} />
            )
          } 
        />
        <Route 
          path="/cbt" 
          element={
            currentUser && currentUser.role === 'participant' ? (
              <UserCBT user={currentUser} onLogout={handleLogout} examSettings={examSettings} /> 
            ) : (
              <Navigate to="/" />
            )
          } 
        />
        <Route 
          path="/admin" 
          element={
            currentUser && currentUser.role === 'admin' ? (
              <AdminLayout onAdminLogout={handleLogout} admin={currentUser} />
            ) : (
              <Navigate to="/" />
            )
          }
        >
          <Route path="dashboard" element={<AdminDashboard adminUser={currentUser} />} />
          <Route path="users" element={<AdminUserManagement />} />
          <Route path="questions" element={<AdminQuestionManagement />} />
          <Route path="results" element={<AdminResultsView />} />
          <Route path="settings" element={<AdminExamSettings settings={examSettings} onUpdateSettings={updateExamSettings} />} />
          <Route index element={<Navigate to="dashboard" />} />
        </Route>
        
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
      <Toaster />
    </>
  );
}

export default App;
