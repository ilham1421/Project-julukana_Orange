import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Save, Settings2, AlertCircle, Info, Type } from "lucide-react";
import { motion } from "framer-motion";
import useFetch from "../../hooks/useFetch";

const AdminExamSettings = ({ settings: initialSettings, onUpdateSettings }) => {
  const [errors, setErrors] = useState({});

  const [settings, setSettings] = useState({
    exam_name:  "",
    duration_minutes:  60,
    passing_grade_percentage:  70,
    shuffle_questions:  false,
    detect_tab_switch:  true,
  })

  const {
    data : settingsBE, 
    fetchData : refetch
  } = useFetch("/api/admin/settings")

  useEffect(() => {
    if(settingsBE == null) return 
    setSettings({
      exam_name: settingsBE.exam_name || "",
      duration_minutes:  settingsBE.duration_minutes != null ? parseInt(settingsBE.duration_minutes) : 60,
      passing_grade_percentage: settingsBE.passing_grade_percentage != null ? parseInt(settingsBE.passing_grade_percentage) : 70,
      shuffle_questions: settingsBE.shuffle_questions == "true",
      detect_tab_switch: settingsBE.detect_tab_switch == "true",
    });
  }, [settingsBE])


  const handleInputChange = (e) => {
    const { name, value, type } = e.target;

    // Validasi dan bersihkan error saat pengguna mengetik
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }

    setSettings((prev) => ({
      ...prev,
      [name]:
        type === "number" ? (value === "" ? "" : parseInt(value, 10)) : value,
    }));
  };

  const handleSwitchChange = (name, checked) => {
    setSettings((prev) => ({
      ...prev,
      [name]: checked,
    }));
  };

  const validateSettings = () => {
    const newErrors = {};
    if (!settings.exam_name || settings.exam_name.trim() === "") {
      newErrors.exam_name = "Nama ujian tidak boleh kosong.";
    }
    if (settings.duration_minutes <= 0 || settings.duration_minutes > 1440) {
      newErrors.duration_minutes = "Durasi harus antara 1 dan 1440 menit.";
    }
    if (
      settings.passing_grade_percentage < 0 ||
      settings.passing_grade_percentage > 100
    ) {
      newErrors.passing_grade_percentage =
        "Passing grade harus antara 0 dan 100.";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateSettings()) {
      // Tidak perlu toast di sini, error message sudah cukup jelas
      return;
    }

    onUpdateSettings(settings);
    // Toast dipindahkan ke App.jsx agar lebih konsisten
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-8 max-w-2xl mx-auto"
    >
      <div className="flex items-center space-x-3">
        <Settings2 className="h-10 w-10 text-sky-400" />
        <h1 className="text-3xl font-bold text-sky-400">
          Pengaturan Ujian CBT
        </h1>
      </div>

      <Card className="border-slate-700 bg-slate-800 shadow-xl">
        <CardHeader>
          <CardTitle className="text-sky-400">
            Konfigurasi Global Ujian
          </CardTitle>
          <CardDescription className="text-slate-400">
            Atur parameter umum untuk semua sesi ujian. Perubahan akan berlaku
            untuk ujian berikutnya.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* ✅ Nama Ujian */}
            <div className="space-y-2">
              <Label htmlFor="exam_name" className="text-slate-300">
                Nama Ujian
              </Label>
              <Input
                id="exam_name"
                name="exam_name"
                type="text"
                value={settings.exam_name || ""}
                onChange={handleInputChange}
                className={`bg-slate-700 border-slate-600 placeholder-slate-500 focus:ring-sky-500 focus:border-sky-500 ${
                  errors.exam_name ? "border-red-500" : ""
                }`}
                placeholder="cth: Ujian Kompetensi Dasar"
              />
              {errors.exam_name && (
                <p className="text-sm text-red-400 flex items-center gap-1">
                  <AlertCircle size={16} />
                  {errors.exam_name}
                </p>
              )}
              <p className="text-xs text-slate-500 flex items-center gap-1">
                <Type size={14} /> Nama ini akan ditampilkan di halaman ruang
                tunggu peserta.
              </p>
            </div>

            {/* Durasi Ujian */}
            <div className="space-y-2">
              <Label htmlFor="duration_minutes" className="text-slate-300">
                Durasi Ujian (menit)
              </Label>
              <Input
                id="duration_minutes"
                name="duration_minutes"
                type="number"
                value={settings.duration_minutes}
                onChange={handleInputChange}
                className={`bg-slate-700 border-slate-600 placeholder-slate-500 focus:ring-sky-500 focus:border-sky-500 ${
                  errors.duration_minutes ? "border-red-500" : ""
                }`}
                min="1"
              />
              {errors.duration_minutes && (
                <p className="text-sm text-red-400 flex items-center gap-1">
                  <AlertCircle size={16} />
                  {errors.duration_minutes}
                </p>
              )}
              <p className="text-xs text-slate-500 flex items-center gap-1">
                <Info size={14} /> Total waktu yang diberikan kepada peserta
                untuk menyelesaikan ujian.
              </p>
            </div>

            {/* Passing Grade */}
            <div className="space-y-2">
              <Label
                htmlFor="passing_grade_percentage"
                className="text-slate-300"
              >
                Passing Grade (%)
              </Label>
              <Input
                id="passing_grade_percentage"
                name="passing_grade_percentage"
                type="number"
                value={settings.passing_grade_percentage}
                onChange={handleInputChange}
                className={`bg-slate-700 border-slate-600 placeholder-slate-500 focus:ring-sky-500 focus:border-sky-500 ${
                  errors.passing_grade_percentage ? "border-red-500" : ""
                }`}
                min="0"
                max="100"
              />
              {errors.passing_grade_percentage && (
                <p className="text-sm text-red-400 flex items-center gap-1">
                  <AlertCircle size={16} />
                  {errors.passing_grade_percentage}
                </p>
              )}
              <p className="text-xs text-slate-500 flex items-center gap-1">
                <Info size={14} /> Persentase nilai minimum yang dibutuhkan
                peserta untuk lulus.
              </p>
            </div>

            {/* Acak Soal */}
            <div className="flex items-center justify-between p-3 bg-slate-700/50 rounded-md border border-slate-600">
              <div>
                <Label
                  htmlFor="shuffle_questions"
                  className="text-slate-200 font-medium"
                >
                  Acak Urutan Soal
                </Label>
                <p className="text-xs text-slate-400 mt-1">
                  Jika aktif, setiap peserta akan mendapatkan urutan soal yang
                  berbeda.
                </p>
              </div>
              <Switch
                id="shuffle_questions"
                name="shuffle_questions"
                checked={settings.shuffle_questions}
                onCheckedChange={(checked) =>
                  handleSwitchChange("shuffle_questions", checked)
                }
                className="data-[state=checked]:bg-sky-500 data-[state=unchecked]:bg-slate-600"
              />
            </div>

            {/* Deteksi Pindah Tab */}
            <div className="flex items-center justify-between p-3 bg-slate-700/50 rounded-md border border-slate-600">
              <div>
                <Label
                  htmlFor="detect_tab_switch"
                  className="text-slate-200 font-medium"
                >
                  Deteksi Kecurangan (Anti-Contek)
                </Label>
                <p className="text-xs text-slate-400 mt-1">
                  Jika aktif, ujian akan dihentikan jika peserta keluar
                  fullscreen atau pindah tab.
                </p>
              </div>
              <Switch
                id="detect_tab_switch"
                name="detect_tab_switch"
                checked={settings.detect_tab_switch}
                onCheckedChange={(checked) =>
                  handleSwitchChange("detect_tab_switch", checked)
                }
                className="data-[state=checked]:bg-sky-500 data-[state=unchecked]:bg-slate-600"
              />
            </div>

            <div className="pt-4">
              <Button
                type="submit"
                className="w-full bg-sky-600 hover:bg-sky-700 text-white py-3 text-base"
              >
                <Save className="mr-2 h-5 w-5" /> Simpan Pengaturan
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default AdminExamSettings;
