import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
import {
  Users,
  FileText,
  BarChart2,
  Settings,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button"; // Added import
import logoBeaCukai from "../../data/logo_beaCukai.png";

const AdminDashboard = () => {
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { staggerChildren: 0.1 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 },
  };

  const adminFeatures = [
    {
      title: "Manajemen Pengguna",
      description:
        "Kelola akun peserta dan admin. Tambah, edit, atau hapus pengguna.",
      icon: <Users className="w-10 h-10 text-blue-500" />,
      link: "/admin/users",
      color: "border-blue-500",
      bgColor: "bg-blue-50 hover:bg-blue-100",
    },
    {
      title: "Manajemen Soal",
      description:
        "Buat, edit, dan hapus soal ujian. Atur kategori dan tingkat kesulitan.",
      icon: <FileText className="w-10 h-10 text-green-500" />,
      link: "/admin/questions",
      color: "border-green-500",
      bgColor: "bg-green-50 hover:bg-green-100",
    },
    {
      title: "Lihat Hasil Ujian",
      description:
        "Pantau hasil ujian peserta secara real-time. Analisis skor dan performa.",
      icon: <BarChart2 className="w-10 h-10 text-yellow-500" />,
      link: "/admin/results",
      color: "border-yellow-500",
      bgColor: "bg-yellow-50 hover:bg-yellow-100",
    },
    {
      title: "Pengaturan Ujian",
      description:
        "Konfigurasi durasi ujian, passing grade, dan parameter lainnya.",
      icon: <Settings className="w-10 h-10 text-purple-500" />,
      link: "/admin/settings", // Placeholder, can be implemented later
      color: "border-purple-500",
      bgColor: "bg-purple-50 hover:bg-purple-100",
    },
  ];

  const adminUser = JSON.parse(localStorage.getItem("currentUser"));

  return (
    <div className="container mx-auto p-6 bg-gradient-to-br from-slate-50 to-sky-50 min-h-full">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8 text-center"
      >
        <img
          src={logoBeaCukai}
          alt="Logo Bea Cukai"
          className="w-16 h-16 mx-auto mb-3"
        />

        <h1 className="text-4xl font-bold text-gray-800">Dashboard Admin</h1>
        <p className="text-lg text-gray-600 mt-2">
          Selamat datang, {adminUser?.email || "Admin"}. Kelola sistem CBT
          dengan mudah.
        </p>
      </motion.div>

      <motion.div
        variants={cardVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6"
      >
        {adminFeatures.map((feature) => (
          <motion.div variants={itemVariants} key={feature.title}>
            <Card
              className={`shadow-lg hover:shadow-xl transition-shadow duration-300 rounded-lg border-l-4 ${feature.color} ${feature.bgColor}`}
            >
              <CardHeader className="flex flex-row items-center space-x-4 pb-2">
                {feature.icon}
                <CardTitle className="text-xl font-semibold text-gray-700">
                  {feature.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-gray-600 mb-4">
                  {feature.description}
                </CardDescription>
                <Link to={feature.link}>
                  <Button
                    variant="outline"
                    className={`w-full ${feature.color} text-${
                      feature.color.split("-")[1]
                    }-600 hover:bg-${
                      feature.color.split("-")[1]
                    }-500 hover:text-white`}
                  >
                    Kelola {feature.title.split(" ")[1]}
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.5 }}
        className="mt-12 p-6 bg-white rounded-lg shadow-lg border border-gray-200"
      >
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">
          Statistik Cepat
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-3xl font-bold text-blue-600">
              {
                (JSON.parse(localStorage.getItem("users")) || []).filter(
                  (u) => u.role === "participant"
                ).length
              }
            </p>
            <p className="text-gray-500">Peserta Terdaftar</p>
          </div>
          <div>
            <p className="text-3xl font-bold text-green-600">
              {(JSON.parse(localStorage.getItem("questions")) || []).length}
            </p>
            <p className="text-gray-500">Jumlah Soal</p>
          </div>
          <div>
            <p className="text-3xl font-bold text-yellow-600">
              {(JSON.parse(localStorage.getItem("examResults")) || []).length}
            </p>
            <p className="text-gray-500">Ujian Selesai</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default AdminDashboard;
