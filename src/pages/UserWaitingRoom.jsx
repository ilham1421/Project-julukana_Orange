// src/pages/UserWaitingRoom.jsx
import React, { useState } from "react";
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

// Asumsi Anda memiliki cara untuk mendapatkan data user dan examSettings
// Misalnya dari Context, Redux, atau state di komponen induk (App.jsx)
const UserWaitingRoom = ({ user, examSettings }) => {
  const navigate = useNavigate();
  // State untuk checklist kesiapan
  const [isReady, setIsReady] = useState(false);

  const handleStart = () => {
    // Hanya izinkan memulai jika pengguna sudah mencentang checklist
    if (isReady) {
      navigate("/cbt");
    } else {
      // Anda bisa menambahkan toast/notifikasi di sini jika diperlukan
      alert(
        "Harap konfirmasi bahwa Anda telah membaca dan memahami semua aturan."
      );
    }
  };

  // Aturan ujian yang lebih detail
  const rules = [
    {
      icon: <Signal className="text-green-500" />,
      text: "Pastikan Anda memiliki koneksi internet yang stabil selama ujian berlangsung.",
    },
    {
      icon: <MonitorSmartphone className="text-red-500" />,
      text: "Dilarang keras membuka tab, window, atau aplikasi lain. Pelanggaran akan mengakhiri ujian secara otomatis.",
    },
    {
      icon: <ShieldCheck className="text-blue-500" />,
      text: "Semua jawaban yang telah Anda pilih akan disimpan secara otomatis. Anda dapat meninjau kembali jawaban sebelum mengakhiri ujian.",
    },
    {
      icon: <Info className="text-yellow-500" />,
      text: "Jika terjadi kendala teknis (misalnya, mati listrik), segera hubungi pengawas ujian untuk mendapatkan arahan.",
    },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4 font-sans">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeInOut" }}
        className="bg-white shadow-2xl rounded-2xl p-8 md:p-12 max-w-3xl w-full"
      >
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800">
            Selamat Datang di Ujian CBT
          </h1>
          <p className="text-gray-600 mt-2">
            Halo,{" "}
            <span className="font-semibold text-indigo-600">
              {user?.fullName || "Peserta"}
            </span>
            ! Silakan baca petunjuk di bawah ini dengan saksama.
          </p>
        </div>

        {/* Detail Ujian */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-b border-gray-200 py-6 mb-8">
          <div className="flex items-center space-x-3">
            <BookOpen className="w-6 h-6 text-indigo-500" />
            <div>
              <p className="text-sm text-gray-500">Mata Ujian</p>
              <p className="font-semibold text-gray-700">
                {examSettings?.exam_name || "Ujian Umum"}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Clock className="w-6 h-6 text-indigo-500" />
            <div>
              <p className="text-sm text-gray-500">Durasi Pengerjaan</p>
              <p className="font-semibold text-gray-700">
                {examSettings?.duration_minutes || "120"} Menit
              </p>
            </div>
          </div>
        </div>

        {/* Aturan dan Tata Cara */}
        <div>
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
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
                <p className="text-gray-600">{rule.text}</p>
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
              className="h-5 w-5 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500 cursor-pointer"
            />
            <label
              htmlFor="readiness-check"
              className="ml-3 block text-sm font-medium text-gray-700 cursor-pointer"
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
              ${
                isReady
                  ? "bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg hover:shadow-xl hover:-translate-y-1"
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
