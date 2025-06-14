// src/pages/UserWaitingRoom.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  ShieldCheck,
  Signal,
  MonitorSmartphone,
  Info,
  Clock,
  BookOpen,
} from "lucide-react";
import useFetch from "../hooks/useFetch";
import axiosFetch from "../lib/axios";

// Palet warna yang terinspirasi dari logo
const themeColors = {
  primary: "#1E3A8A", // Biru Tua (text-blue-900)
  accent: "#3B82F6", // Biru Langit (text-blue-500)
  gold: "#FBBF24", // Kuning/Emas (text-amber-400)
};

const UserWaitingRoom = ({ user, refetch }) => {
  const navigate = useNavigate();
  const [isReady, setIsReady] = useState(false);

  const { data: settings } = useFetch("/api/user/settings")
  const examSettings = useMemo(() => {
    if (settings == null) return {
      exam_name: "Ujian Kompetensi Dasar", // Default exam name
      duration_minutes: 60,
      passing_grade_percentage: 70,
      shuffle_questions: false,
      detect_tab_switch: true,
    }

    console.log("Exam settings fetched:", settings);

    return {
      exam_name: settings?.exam_name || "",
      duration_minutes: settings?.duration_minutes != null ? parseInt(settings?.duration_minutes) : 60,
      passing_grade_percentage: settings?.passing_grade_percentage != null ? parseInt(settings?.passing_grade_percentage) : 70,
      shuffle_questions: settings?.shuffle_questions == "true" ,
      detect_tab_switch: settings?.detect_tab_switch == "true",
    }
  }, [settings])

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    if (user.result == null) return

    navigate("/cbt")

    // checkExamStatus();
  }, [user])


  const handleStart = async () => {
    if (!isReady) return alert("Harap konfirmasi bahwa Anda telah membaca dan memahami semua aturan sebelum memulai ujian.");
    const feting = await axiosFetch({
      url : "/api/user/mulai",
      method: "GET",
    })
    if (feting.status >= 400) {
      const errorMessage = feting.data.message || "Gagal memulai ujian";
      alert(errorMessage);
      return
    }

    await refetch();
    
    navigate("/cbt");
  };

  const rules = [
    {
      icon: <Signal className="text-green-500" />,
      text: "Pastikan Anda memiliki koneksi internet yang stabil selama ujian berlangsung.",
    },

    examSettings.detect_tab_switch && {
      icon: <MonitorSmartphone className="text-red-500" />,
      text: "Dilarang keras membuka tab, window, atau aplikasi lain. Pelanggaran akan mengakhiri ujian secara otomatis.",
    },
    {
      icon: <ShieldCheck style={{ color: themeColors.accent }} />,
      text: "Semua jawaban yang telah Anda pilih akan disimpan secara otomatis. Anda dapat meninjau kembali jawaban sebelum mengakhiri ujian.",
    },
    {
      icon: <Info style={{ color: themeColors.gold }} />,
      text: "Jika terjadi kendala teknis (misalnya, mati listrik), segera hubungi pengawas ujian untuk mendapatkan arahan.",
    },
  ].filter(Boolean);

  return (
    // Latar belakang sedikit kebiruan
    <div className="min-h-screen flex items-center justify-center bg-blue-50 p-4 font-sans">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeInOut" }}
        className="bg-white shadow-2xl rounded-2xl p-8 md:p-12 max-w-3xl w-full"
      >
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-blue-900">
            Selamat Datang di Ujian CBT
          </h1>
          <p className="text-gray-600 mt-2">
            Halo,{" "}
            <span className="font-semibold text-blue-700">
              {user?.fullName || "Peserta"}
            </span>
            ! Silakan baca petunjuk di bawah ini dengan saksama.
          </p>
        </div>

        {/* Detail Ujian */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-b border-gray-200 py-6 mb-8">
          <div className="flex items-center space-x-3">
            <BookOpen className="w-6 h-6 text-blue-500" />
            <div>
              <p className="text-sm text-gray-500">Mata Ujian</p>
              <p className="font-semibold text-gray-800">
                {examSettings?.exam_name || "Ujian Umum"}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Clock className="w-6 h-6 text-blue-500" />
            <div>
              <p className="text-sm text-gray-500">Durasi Pengerjaan</p>
              <p className="font-semibold text-gray-800">
                {examSettings?.duration_minutes || "120"} Menit
              </p>
            </div>
          </div>
        </div>

        {/* Aturan dan Tata Cara */}
        <div>
          <h2 className="text-xl font-semibold text-blue-800 mb-4">
            Aturan & Tata Cara Pengerjaan
          </h2>
          <ul className="space-y-4">
            {rules.map((rule, index) => (
              <motion.li
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.2 + index * 0.1 }}
                className="flex items-start space-x-4"
              >
                <div className="flex-shrink-0 mt-1">{rule.icon}</div>
                <p className="text-gray-700">{rule.text}</p>
              </motion.li>
            ))}
          </ul>
        </div>

        {/* Konfirmasi Kesiapan */}
        <div className="mt-10 pt-6 border-t border-gray-200">
          <div className="flex items-center justify-center">
            <input
              type="checkbox"
              id="readiness-check"
              checked={isReady}
              onChange={(e) => setIsReady(e.target.checked)}
              className="h-5 w-5 text-blue-800 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
            />
            <label
              htmlFor="readiness-check"
              className="ml-3 block text-sm font-medium text-gray-800 cursor-pointer"
            >
              Saya telah membaca dan memahami semua aturan di atas.
            </label>
          </div>
        </div>

        {/* Tombol Mulai */}
        <div className="text-center mt-8">
          <Button
            onClick={handleStart}
            className={`px-8 py-3 text-lg font-bold w-full md:w-auto transition-all duration-300 transform
              ${isReady
                ? "bg-blue-900 hover:bg-blue-800 text-white shadow-lg hover:shadow-xl hover:-translate-y-1"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
            disabled={!isReady}
          >
            Mulai Ujian
          </Button>
        </div>
      </motion.div>
    </div>
  );
};

export default UserWaitingRoom;
