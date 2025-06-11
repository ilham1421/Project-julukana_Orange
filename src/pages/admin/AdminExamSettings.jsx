import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch'; // Assuming you have or will create this
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { Save, Settings2, AlertCircle, Info } from 'lucide-react';
import { motion } from 'framer-motion';

const AdminExamSettings = ({ settings: initialSettings, onUpdateSettings }) => {
  const [settings, setSettings] = useState(initialSettings);
  const { toast } = useToast();
  const [errors, setErrors] = useState({});

  useEffect(() => {
    setSettings(initialSettings);
  }, [initialSettings]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' || type === 'switch' ? checked : (type === 'number' ? parseInt(value, 10) : value)
    }));
    if (errors[name]) {
        setErrors(prev => ({...prev, [name]: null}));
    }
  };
  
  // Separate handler for shadcn Switch as it provides value directly
  const handleSwitchChange = (name, checked) => {
    setSettings(prev => ({
      ...prev,
      [name]: checked
    }));
  };

  const validateSettings = () => {
    const newErrors = {};
    if (settings.duration <= 0 || settings.duration > 1440) { // Max 24 hours
        newErrors.duration = "Durasi harus antara 1 dan 1440 menit.";
    }
    if (settings.passingGrade < 0 || settings.passingGrade > 100) {
        newErrors.passingGrade = "Passing grade harus antara 0 dan 100.";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateSettings()) {
        toast({
            title: "Input Tidak Valid",
            description: "Harap perbaiki error pada input sebelum menyimpan.",
            variant: "destructive",
        });
        return;
    }
    onUpdateSettings(settings);
    toast({
      title: "Pengaturan Disimpan",
      description: "Pengaturan ujian berhasil diperbarui.",
      className: "bg-green-500 text-white border-green-600",
      icon: <Save className="h-5 w-5" />
    });
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
        <h1 className="text-3xl font-bold text-sky-400">Pengaturan Ujian CBT</h1>
      </div>

      <Card className="border-slate-700 bg-slate-800 shadow-xl">
        <CardHeader>
          <CardTitle className="text-sky-400">Konfigurasi Global Ujian</CardTitle>
          <CardDescription className="text-slate-400">
            Atur parameter umum untuk semua sesi ujian CBT. Perubahan akan berlaku untuk ujian berikutnya.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Durasi Ujian */}
            <div className="space-y-2">
              <Label htmlFor="duration" className="text-slate-300">Durasi Ujian (menit)</Label>
              <Input
                id="duration"
                name="duration"
                type="number"
                value={settings.duration}
                onChange={handleInputChange}
                className={`bg-slate-700 border-slate-600 placeholder-slate-500 focus:ring-sky-500 focus:border-sky-500 ${errors.duration ? 'border-red-500' : ''}`}
                min="1"
              />
              {errors.duration && <p className="text-sm text-red-400 flex items-center gap-1"><AlertCircle size={16}/>{errors.duration}</p>}
              <p className="text-xs text-slate-500 flex items-center gap-1"><Info size={14}/> Total waktu yang diberikan kepada peserta untuk menyelesaikan ujian.</p>
            </div>

            {/* Passing Grade */}
            <div className="space-y-2">
              <Label htmlFor="passingGrade" className="text-slate-300">Passing Grade (%)</Label>
              <Input
                id="passingGrade"
                name="passingGrade"
                type="number"
                value={settings.passingGrade}
                onChange={handleInputChange}
                className={`bg-slate-700 border-slate-600 placeholder-slate-500 focus:ring-sky-500 focus:border-sky-500 ${errors.passingGrade ? 'border-red-500' : ''}`}
                min="0"
                max="100"
              />
              {errors.passingGrade && <p className="text-sm text-red-400 flex items-center gap-1"><AlertCircle size={16}/>{errors.passingGrade}</p>}
              <p className="text-xs text-slate-500 flex items-center gap-1"><Info size={14}/> Persentase nilai minimum yang dibutuhkan peserta untuk lulus ujian.</p>
            </div>
            
            {/* Acak Soal */}
            <div className="flex items-center justify-between p-3 bg-slate-700/50 rounded-md border border-slate-600">
                <div>
                    <Label htmlFor="shuffleQuestions" className="text-slate-200 font-medium">Acak Urutan Soal</Label>
                    <p className="text-xs text-slate-400 mt-1">Jika aktif, setiap peserta akan mendapatkan urutan soal yang berbeda.</p>
                </div>
              <Switch
                id="shuffleQuestions"
                name="shuffleQuestions"
                checked={settings.shuffleQuestions}
                onCheckedChange={(checked) => handleSwitchChange('shuffleQuestions', checked)}
                className="data-[state=checked]:bg-sky-500 data-[state=unchecked]:bg-slate-600"
              />
            </div>

            {/* Deteksi Pindah Tab */}
            <div className="flex items-center justify-between p-3 bg-slate-700/50 rounded-md border border-slate-600">
              <div>
                <Label htmlFor="antiCheatingDetection" className="text-slate-200 font-medium">Deteksi Pindah Tab (Anti-Contek)</Label>
                <p className="text-xs text-slate-400 mt-1">Jika aktif, ujian akan otomatis selesai jika peserta berpindah tab/window.</p>
              </div>
              <Switch
                id="antiCheatingDetection"
                name="antiCheatingDetection"
                checked={settings.antiCheatingDetection}
                onCheckedChange={(checked) => handleSwitchChange('antiCheatingDetection', checked)}
                className="data-[state=checked]:bg-sky-500 data-[state=unchecked]:bg-slate-600"
              />
            </div>

            <div className="pt-4">
              <Button type="submit" className="w-full bg-sky-600 hover:bg-sky-700 text-white py-3 text-base">
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