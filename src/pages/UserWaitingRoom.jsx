// src/pages/UserWaitingRoom.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

const UserWaitingRoom = () => {
  const navigate = useNavigate();

  const handleStart = () => {
    navigate("/cbt");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-100 p-6">
      <div className="bg-white shadow-xl rounded-2xl p-8 max-w-2xl w-full space-y-6">
        <h2 className="text-2xl font-bold text-center text-indigo-700">
          Tata Cara dan Aturan Pengerjaan
        </h2>
        <ul className="list-disc list-inside text-gray-700 space-y-2">
          <li>Pastikan koneksi internet stabil selama ujian.</li>
          <li>Jangan keluar dari tab/browser selama mengerjakan.</li>
          <li>Jawaban tidak dapat diubah setelah disimpan.</li>
          <li>Hubungi pengawas jika mengalami kendala teknis.</li>
        </ul>
        <div className="text-center">
          <Button onClick={handleStart} className="px-6 py-2 text-lg">
            Mulai Mengerjakan
          </Button>
        </div>
      </div>
    </div>
  );
};

export default UserWaitingRoom;
