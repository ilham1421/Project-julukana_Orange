import React, { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import {
  UserPlus,
  Edit2,
  Trash2,
  AlertTriangle,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { motion } from "framer-motion";
import useFetch from "../../hooks/useFetch";
import axiosFetch from "../../lib/axios";

const USERS_PER_PAGE = 10;

const AdminUserManagement = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentUserData, setCurrentUserData] = useState({
    id: null,
    name: "",
    nip: "",
    role: "USER",
  });
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();
  const [deleteUser, setDeleteUser] = useState(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const {
    data: responseData,
    loading: loadingUsers,
    error: errorUsersData,
    refetch: fetchUsers,
  } = useFetch("/api/admin/users?"+new URLSearchParams({
    page : currentPage,
    limit : USERS_PER_PAGE,
    search: searchTerm,
  }));

  const users = responseData?.users ?? [];
  const totalPages = useMemo(() => {
    if (responseData == null) return 0;
    return Math.ceil(responseData.total / USERS_PER_PAGE);
  }, [responseData]);

  useEffect(() => {
    if (errorUsersData) {
      toast({
        title: "Error",
        description: "Gagal memuat data pengguna.",
        variant: "destructive",
      });
    }
  }, [errorUsersData, toast]);

  // Fungsi-fungsi lain tidak ada perubahan...
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === "nip") {
      if (/^\d*$/.test(value) && value.length <= 18) {
        setCurrentUserData((prev) => ({ ...prev, [name]: value }));
      }
    } else {
      setCurrentUserData((prev) => ({ ...prev, [name]: value }));
    }
  };
  const validateUserData = () => {
    if (!currentUserData.name.trim()) {
      toast({
        title: "Error",
        description: "Nama Lengkap wajib diisi.",
        variant: "destructive",
      });
      return false;
    }
    if (!currentUserData.nip) {
      toast({
        title: "Error",
        description: "NIP wajib diisi.",
        variant: "destructive",
      });
      return false;
    }
    if (!/^\d{18}$/.test(currentUserData.nip.trim())) {
      toast({
        title: "Error",
        description: "NIP harus 18 digit angka.",
        variant: "destructive",
      });
      return false;
    }
    return true;
  };
  const handleAddUser = async () => {
    if (!validateUserData()) return;
    try {
      await axiosFetch({
        method: "POST",
        url: "/api/admin/users",
        data: {
          nama: currentUserData.name.trim(),
          nip: currentUserData.nip.trim(),
          role: currentUserData.role,
        },
      });
      toast({
        title: "Sukses",
        description: `Pengguna ${currentUserData.name} berhasil ditambahkan.`,
      });
      setIsModalOpen(false);
      resetForm();
      fetchUsers();
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Terjadi kesalahan.";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };
  const handleUpdateUser = async () => {
    if (!validateUserData()) return;
    try {
      await axiosFetch({
        method: "PUT",
        url: "/api/admin/users/" + currentUserData.id,
        data: {
          nama: currentUserData.name.trim(),
          nip: currentUserData.nip.trim(),
          role: currentUserData.role,
        },
      });
      toast({
        title: "Sukses",
        description: "Data pengguna berhasil diperbarui.",
      });
      setIsModalOpen(false);
      resetForm();
      fetchUsers();
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Terjadi kesalahan.";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };
  const handleDelete = async () => {
    if (!deleteUser) return;
    try {
      await axiosFetch({
        method: "DELETE",
        url: "/api/admin/users/" + deleteUser.id,
      });
      toast({
        title: "Sukses",
        description: `Pengguna ${deleteUser.name} berhasil dihapus.`,
      });
      setIsDeleteDialogOpen(false);
      setDeleteUser(null);
      fetchUsers();
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Terjadi kesalahan.";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };
  const handleSubmit = (e) => {
    e.preventDefault();
    isEditMode ? handleUpdateUser() : handleAddUser();
  };
  const handleEdit = (user) => {
    setIsEditMode(true);
    setCurrentUserData({
      id: user.id,
      name: user.name,
      nip: user.nip,
      role: user.role,
    });
    setIsModalOpen(true);
  };
  const openDeleteDialog = (user) => {
    setDeleteUser(user);
    setIsDeleteDialogOpen(true);
  };
  const resetForm = () => {
    setIsEditMode(false);
    setCurrentUserData({ id: null, name: "", nip: "", role: "USER" });
  };
  const filteredUsers = useMemo(() => {
    if (!Array.isArray(users)) return [];
    console.log(users)
    return users
  }, [users]);

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };
  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {/* Header tidak ada perubahan */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-sky-400">Manajemen Pengguna</h1>
        <div>
          <Button
            onClick={fetchUsers}
            variant="outline"
            className="mr-2 text-sky-400 border-sky-400 hover:bg-sky-400 hover:text-slate-900"
          >
            <RefreshCw
              className={`mr-2 h-4 w-4 ${loadingUsers ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
          <Button
            onClick={() => {
              resetForm();
              setIsModalOpen(true);
            }}
            className="bg-sky-600 hover:bg-sky-700 text-white"
          >
            <UserPlus className="mr-2 h-5 w-5" /> Tambah Pengguna
          </Button>
        </div>
      </div>

      {/* Input search tidak ada perubahan */}
      <Input
        type="text"
        placeholder="Cari di halaman ini (Nama, NIP)..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="max-w-sm bg-slate-700 border-slate-600 text-white placeholder-slate-400 focus:ring-sky-500 focus:border-sky-500"
      />

      <Card className="border-slate-700 bg-slate-800 shadow-xl">
        <CardHeader>
          <CardTitle className="text-sky-400">Daftar Pengguna</CardTitle>
          <CardDescription className="text-slate-400">
            Kelola akun peserta dan admin. Total: {responseData?.total ?? 0} pengguna
            terdaftar.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Logika tabel tidak ada perubahan */}
          {loadingUsers  ? (
            <div className="flex justify-center items-center py-8">
              <RefreshCw className="h-8 w-8 text-sky-400 animate-spin" />
              <p className="ml-2 text-slate-300">Memuat pengguna...</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-slate-700 hover:bg-slate-700/50">
                      <TableHead className="text-slate-300">
                        Nama Lengkap
                      </TableHead>
                      <TableHead className="text-slate-300">NIP</TableHead>
                      <TableHead className="text-slate-300">Role</TableHead>
                      <TableHead className="text-slate-300 text-right">
                        Aksi
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.map((user) => (
                      <TableRow
                        key={user.id}
                        className="border-slate-700 hover:bg-slate-700/50"
                      >
                        <TableCell className="font-medium text-slate-200">
                          {user.name}
                        </TableCell>
                        <TableCell className="text-slate-300">
                          {user.nip}
                        </TableCell>
                        <TableCell>
                          <span
                            className={`px-2 py-1 text-xs font-semibold rounded-full ${
                              user.role === "ADMIN"
                                ? "bg-sky-500 text-white"
                                : "bg-emerald-500 text-white"
                            }`}
                          >
                            {user.role}
                          </span>
                        </TableCell>
                        <TableCell className="text-right space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(user)}
                            className="text-yellow-400 border-yellow-400 hover:bg-yellow-400 hover:text-slate-900"
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openDeleteDialog(user)}
                            className="text-red-400 border-red-400 hover:bg-red-400 hover:text-white"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              {!loadingUsers && filteredUsers.length === 0 && (
                <p className="text-center text-slate-400 py-8">
                  Tidak ada pengguna ditemukan.
                </p>
              )}
            </>
          )}

          {/* ========================================================= */}
          {/* ### KODE PAGINATION BARU DENGAN TEMA BEA CUKAI ### */}
          {/* ========================================================= */}
          {totalPages > 1 && (
            <div className="flex items-center justify-end space-x-6 py-4 mt-4">
              <span className="text-sm text-slate-400">
                Halaman{" "}
                <strong className="font-medium text-slate-100">
                  {currentPage}
                </strong>{" "}
                dari{" "}
                <strong className="font-medium text-slate-100">
                  {totalPages}
                </strong>
              </span>
              <div className="space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePrevPage}
                  disabled={currentPage === 1 || loadingUsers}
                  className="bg-transparent text-amber-400 border-amber-400/40 hover:bg-amber-400 hover:text-slate-900 hover:border-amber-400 disabled:opacity-30 disabled:border-slate-600 disabled:text-slate-600"
                >
                  <ChevronLeft className="h-4 w-4 mr-2" />
                  Sebelumnya
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleNextPage}
                  disabled={currentPage === totalPages || loadingUsers}
                  className="bg-transparent text-amber-400 border-amber-400/40 hover:bg-amber-400 hover:text-slate-900 hover:border-amber-400 disabled:opacity-30 disabled:border-slate-600 disabled:text-slate-600"
                >
                  Selanjutnya
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </div>
          )}
          {/* ========================================================= */}
          {/* ### AKHIR KODE PAGINATION BARU ### */}
          {/* ========================================================= */}
        </CardContent>
      </Card>

      {/* Dialogs tidak ada perubahan */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="bg-slate-800 border-slate-700 text-white">
          <DialogHeader>
            <DialogTitle className="text-sky-400">
              {isEditMode ? "Edit Pengguna" : "Tambah Pengguna Baru"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 py-4">
            <div>
              <Label htmlFor="name" className="text-slate-300">
                Nama Lengkap (Tanpa Gelar)
              </Label>
              <Input
                id="name"
                name="name"
                type="text"
                value={currentUserData.name}
                onChange={handleInputChange}
                required
                className="bg-slate-700 border-slate-600 placeholder-slate-500 focus:ring-sky-500 focus:border-sky-500"
              />
            </div>
            <div>
              <Label htmlFor="nip" className="text-slate-300">
                NIP (Nomor Induk Pegawai)
              </Label>
              <Input
                id="nip"
                name="nip"
                type="text"
                value={currentUserData.nip}
                onChange={handleInputChange}
                required
                maxLength="18"
                className="bg-slate-700 border-slate-600 placeholder-slate-500 focus:ring-sky-500 focus:border-sky-500"
              />
              <p className="text-xs text-slate-400 mt-1">
                NIP harus 18 digit angka.
              </p>
            </div>
            <div>
              <Label htmlFor="role" className="text-slate-300">
                Role
              </Label>
              <select
                id="role"
                name="role"
                value={currentUserData.role}
                onChange={handleInputChange}
                className="w-full p-2 rounded-md bg-slate-700 border-slate-600 text-white focus:ring-sky-500 focus:border-sky-500"
              >
                <option value="USER">USER</option>
                <option value="ADMIN">ADMIN</option>
              </select>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsModalOpen(false)}
                className="text-slate-300 border-slate-600 hover:bg-slate-700"
              >
                Batal
              </Button>
              <Button
                type="submit"
                className="bg-sky-600 hover:bg-sky-700 text-white"
              >
                {isEditMode ? "Simpan Perubahan" : "Tambah Pengguna"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="bg-slate-800 border-slate-700 text-white">
          <DialogHeader>
            <DialogTitle className="text-red-500 flex items-center">
              <AlertTriangle className="mr-2 h-6 w-6 text-red-500" />
              Konfirmasi Hapus
            </DialogTitle>
            <DialogDescription className="text-slate-400">
              Apakah Anda yakin ingin menghapus pengguna{" "}
              <span className="font-semibold text-sky-400">
                {deleteUser?.name}
              </span>
              ? Tindakan ini tidak dapat diurungkan.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4">
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
              className="text-slate-300 border-slate-600 hover:bg-slate-700"
            >
              Batal
            </Button>
            <Button
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Ya, Hapus
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
};

export default AdminUserManagement;
