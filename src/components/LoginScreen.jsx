import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { User, KeyRound, AlertCircle } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import logoBeaCukai from "../data/logo_beaCukai.png";

const LoginScreen = ({ onLogin }) => {
  const [fullName, setFullName] = useState("");
  const [nip, setNip] = useState("");
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const logoUrl = logoBeaCukai;

  const validateForm = () => {
    const newErrors = {};
    if (!fullName.trim()) {
      newErrors.fullName = "Nama Lengkap wajib diisi.";
    }
    if (!nip) {
      newErrors.nip = "NIP wajib diisi.";
    } else if (!/^\d{1,18}$/.test(nip)) {
      newErrors.nip = "NIP harus berupa angka, maksimal 18 digit.";
    } else if (nip.length > 18) {
      newErrors.nip = "NIP maksimal 18 digit.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      toast({
        title: "Input Tidak Valid",
        description: "Harap periksa kembali input Anda.",
        variant: "destructive",
      });
      return;
    }
    setLoading(true);

    await new Promise((resolve) => setTimeout(resolve, 500));

    onLogin({ fullName: fullName.trim(), nip });
    setLoading(false);
  };

  const handleNipChange = (e) => {
    const value = e.target.value;
    if (/^\d*$/.test(value) && value.length <= 18) {
      setNip(value);
      if (errors.nip) {
        setErrors((prev) => ({ ...prev, nip: null }));
      }
    }
  };

  const handleFullNameChange = (e) => {
    setFullName(e.target.value);
    if (errors.fullName) {
      setErrors((prev) => ({ ...prev, fullName: null }));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-amber-50 to-orange-100 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="border-0 shadow-xl rounded-lg">
          <CardHeader className="space-y-1 text-center">
            <div className="flex justify-center mb-4">
              <img
                src={logoUrl}
                alt="Logo CAT JULUKANA"
                className="w-28 h-28 object-contain rounded-full"
              />
            </div>
            <CardTitle className="text-3xl font-bold text-amber-700">
              Login CAT JULUKANA
            </CardTitle>
            <CardDescription className="text-slate-600">
              Masukkan Nama Lengkap dan NIP Anda.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fullName" className="text-slate-700">
                  Nama Lengkap (Tanpa Gelar)
                </Label>
                <div className="relative">
                  <User className="w-5 h-5 absolute left-3 top-2.5 text-slate-400" />
                  <Input
                    id="fullName"
                    type="text"
                    placeholder="Contoh: Andi Julukana"
                    className={`pl-10 border-slate-300 focus:border-amber-500 focus:ring-amber-500 ${
                      errors.fullName ? "border-red-500" : ""
                    }`}
                    value={fullName}
                    onChange={handleFullNameChange}
                  />
                </div>
                {errors.fullName && (
                  <p className="text-sm text-red-500 flex items-center gap-1">
                    <AlertCircle size={16} />
                    {errors.fullName}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="nip" className="text-slate-700">
                  NIP (Nomor Induk Pegawai)
                </Label>
                <div className="relative">
                  <KeyRound className="w-5 h-5 absolute left-3 top-2.5 text-slate-400" />
                  <Input
                    id="nip"
                    type="text"
                    placeholder="Masukkan 18 digit NIP"
                    className={`pl-10 border-slate-300 focus:border-amber-500 focus:ring-amber-500 ${
                      errors.nip ? "border-red-500" : ""
                    }`}
                    value={nip}
                    onChange={handleNipChange}
                    maxLength="18"
                  />
                </div>
                {errors.nip && (
                  <p className="text-sm text-red-500 flex items-center gap-1">
                    <AlertCircle size={16} />
                    {errors.nip}
                  </p>
                )}
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white py-3 text-lg"
              >
                {loading ? "Masuk..." : "Masuk"}
              </Button>
            </form>
            <p className="text-xs text-center text-slate-500 mt-6">
              Jika mengalami kendala, silakan hubungi panitia atau admin ujian.
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default LoginScreen;
