import React, { useState, useEffect } from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { useToast } from "@/components/ui/use-toast";

import UserCBT from "@/pages/UserCBT";
import LoginScreen from "@/components/LoginScreen";
import AdminLayout from "@/pages/admin/AdminLayout";
import AdminDashboard from "@/pages/admin/AdminDashboard";
import AdminUserManagement from "@/pages/admin/AdminUserManagement";
import AdminQuestionManagement from "@/pages/admin/AdminQuestionManagement";
import AdminResultsView from "@/pages/admin/AdminResultsView";
import AdminExamSettings from "@/pages/admin/AdminExamSettings";
import { questions as initialQuestionsData } from "@/data/questions";
import UserWaitingRoom from "@/pages/UserWaitingRoom";
import axiosFetch from "./lib/axios";
import { generateKeyPair, getPubKeyFromPrivate } from "./lib/elliptic";

function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const { toast } = useToast();
  const navigate = useNavigate();
  const [examSettings, setExamSettings] = useState(() => {
    const savedSettings = localStorage.getItem("examSettings");
    return savedSettings
      ? JSON.parse(savedSettings)
      : {
        exam_name: "Ujian Kompetensi Dasar", // Tambahkan nama ujian default
        duration_minutes: 60,
        passing_grade_percentage: 70,
        shuffle_questions: false,
        detect_tab_switch: true,
      };
  });
  const [loading, setLoading] = useState(true);

  // ... (useEffect dan fungsi lainnya tetap sama) ...
  useEffect(() => {
    document.title = "CAT JULUKANA";
    
    fetchCurrentUser()
    // const savedUser = localStorage.getItem("currentUser");
    // if (savedUser) {
    //   setCurrentUser(JSON.parse(savedUser));
    // }

    // const registeredUsers =
    //   JSON.parse(localStorage.getItem("registeredUsers")) || [];
    // const adminNipDefault = "123456789012345678";
    // if (
    // !registeredUsers.some(
    //     (u) => u.nip === adminNipDefault && u.role === "admin"
    //   )
    // ) {
    //   const initialAdmin = {
    //     id: "admin_default_julukana",
    //     fullName: "Admin CAT JULUKANA",
    //     nip: adminNipDefault,
    //     role: "admin",
    //   };
    //   const otherUsers = registeredUsers.filter(
    //     (u) => !(u.nip === adminNipDefault && u.role === "admin")
    //   );
    //   localStorage.setItem(
    //     "registeredUsers",
    //     JSON.stringify([initialAdmin, ...otherUsers])
    //   );
    // }

    // const cbtQuestions = localStorage.getItem("cbtQuestions");
    // if (!cbtQuestions) {
    //   localStorage.setItem(
    //     "cbtQuestions",
    //     JSON.stringify(initialQuestionsData)
    //   );
    // }

    setLoading(false);
  }, []);

  async function fetchCurrentUser() {
    const feting = await axiosFetch({
      method : "GET",
      url : "/api/auth"
    })

    if(feting.status == 401) {
      console.error("Tidak ada sesi yang ditemukan, silahkan login terlebih dahulu.");
      setCurrentUser(null);
      localStorage.removeItem("token");
      navigate("/");
      return;
    }

    if (feting.status >= 400) {
      console.error("Gagal mengambil data pengguna saat ini:", feting.data);
      return null;
    }
    
    setCurrentUser(feting.data)

  }

  const handleLogin = async (loginData) => {
    const { fullName, nip } = loginData;

    let privateKey = localStorage.getItem("client_secret");
    let publicKey;
    try {
      if (!privateKey) {
        const keyPair = generateKeyPair();
        privateKey = keyPair.privateKey;
        publicKey = keyPair.publicKey;

        localStorage.setItem("client_secret", privateKey);
      } else {
        publicKey = getPubKeyFromPrivate(privateKey);
      }
    } catch (err) {
      console.error("Error generating keys:", err);
      localStorage.removeItem("client_secret");
      toast({
        title: "Kesalahan",
        description: "Gagal membuat session.",
        variant: "destructive",
      });
      return;
    }


    const feting = await axiosFetch({
      method: "POST",
      url: "/api/auth/login",
      data: {
        nama: fullName,
        nip: nip,
        client_secret : publicKey
      }
    }, false)

    console.log(feting.data)

    if (feting.status !== 201) {
      let message = feting.data?.message || "Terjadi kesalahan saat login."
      if (Array.isArray(message)) {
        message = message.join(", ");
      }
      toast({
        title: "Login Gagal",
        description: message,
        variant: "destructive",
      });
      return;
    }

    localStorage.setItem("user_id", feting.data.payload.id);
    localStorage.setItem("token", feting.data.token)
    
    localStorage.removeItem(`cbt-answers-${nip}`);

    console.log("Login berhasil:", feting.data.payload);

    toast({
      title : "Login Berhasil",
      description: `Selamat datang, ${feting.data.payload.name}!`,
    })

    setCurrentUser(feting.data.payload);

    // if (foundUser) {
    //   setCurrentUser(foundUser);
    //   localStorage.setItem("currentUser", JSON.stringify(foundUser));

    //   if (foundUser.role === "admin") {
    //     toast({
    //       title: "Login Admin Berhasil",
    //       description: `Selamat datang, ${foundUser.fullName}!`,
    //     });
    //     navigate("/admin/dashboard");
    //   } else {
    //     toast({
    //       title: "Login Peserta Berhasil",
    //       description: `Selamat datang, ${foundUser.fullName}!`,
    //     });
    //     navigate("/waiting"); // diarahkan ke halaman waiting dulu
    //   }
    // } else {
    //   toast({
    //     title: "Login Gagal",
    //     description:
    //       "Nama Lengkap atau NIP tidak terdaftar/salah. Hubungi admin.",
    //     variant: "destructive",
    //   });
    // }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem("token");

    toast({ title: "Logout Berhasil" });
    navigate("/");
  };

  const updateExamSettings = async (newSettings) => {
    
    const feting = await axiosFetch({
      method: "PUT",
      url : "/api/admin/settings",
      data: {data : newSettings}
    })

    if(feting.status >= 400) {
      let message = feting.data?.message || "Terjadi kesalahan saat memperbarui pengaturan ujian.";
      if (Array.isArray(message)) {
        message = message.join(", ");
      }
      toast({
        title: "Gagal Memperbarui Pengaturan",
        description: message,
        variant: "destructive",
      });
      return;
    }
    
    toast({
      title: "Pengaturan Disimpan",
      description: "Pengaturan ujian berhasil diperbarui.",
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-900 text-white text-xl">
        Memuat Aplikasi CAT JULUKANA...
      </div>
    );
  }

  return (
    <>
      <Routes>
        <Route
          path="/"
          element={
            currentUser ? (
              currentUser.role === "ADMIN" ? (
                <Navigate to="/admin/dashboard" />
              ) : (
                <Navigate to="/waiting" />
              )
            ) : (
              <LoginScreen onLogin={handleLogin} />
            )
          }
        />

        {/* Halaman waiting */}
        <Route
          path="/waiting"
          element={
            currentUser && currentUser.role === "USER" ? (
              <UserWaitingRoom user={currentUser} examSettings={examSettings} refetch={fetchCurrentUser} />
            ) : (
              <Navigate to="/" />
            )
          }
        />

        {/* Halaman CBT */}
        <Route
          path="/cbt"
          element={
            currentUser && currentUser.role === "USER" ? (
              <UserCBT
                user={currentUser}
                onLogout={handleLogout}
                examSettings={examSettings}
              />
            ) : (
              <Navigate to="/" />
            )
          }
        />

        {/* Layout Admin */}
        <Route
          path="/admin"
          element={
            currentUser && currentUser.role === "ADMIN" ? (
              <AdminLayout onAdminLogout={handleLogout} admin={currentUser} />
            ) : (
              <Navigate to="/" />
            )
          }
        >
          <Route
            path="dashboard"
            element={<AdminDashboard adminUser={currentUser} />}
          />
          <Route path="users" element={<AdminUserManagement />} />
          <Route path="questions" element={<AdminQuestionManagement />} />
          <Route path="results" element={<AdminResultsView />} />
          <Route
            path="settings"
            element={
              <AdminExamSettings
                settings={examSettings}
                onUpdateSettings={updateExamSettings}
              />
            }
          />
          <Route index element={<Navigate to="dashboard" />} />
        </Route>

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
      <Toaster />
    </>
  );
}

export default App;
