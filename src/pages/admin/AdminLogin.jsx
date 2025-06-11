import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

const AdminLogin = () => {
  const [fullName, setFullName] = useState("");
  const [nip, setNip] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const dummyAdmin = {
    fullName: "Admin",
    nip: "123456789012345678",
  };

  const handleLogin = (e) => {
    e.preventDefault();
    if (fullName === dummyAdmin.fullName && nip === dummyAdmin.nip) {
      localStorage.setItem("admin", JSON.stringify(dummyAdmin));
      navigate("/admin/dashboard");
    } else {
      setError("Nama lengkap atau NIP salah");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Login Admin</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <Label>Nama Lengkap</Label>
              <Input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
            </div>
            <div>
              <Label>NIP</Label>
              <Input
                type="text"
                value={nip}
                onChange={(e) => setNip(e.target.value)}
                required
              />
            </div>
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <Button type="submit" className="w-full">
              Masuk
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminLogin;
