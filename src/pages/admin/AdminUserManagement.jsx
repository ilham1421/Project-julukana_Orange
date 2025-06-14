import React, { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';
import { UserPlus, Edit2, Trash2, AlertTriangle, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';
import useFetch from '../../hooks/useFetch';
import axiosFetch from '../../lib/axios';

const AdminUserManagement = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentUserData, setCurrentUserData] = useState({ id: null, name: '', nip: '', role: 'USER' });
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();
  const [deleteUser, setDeleteUser] = useState(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const {
    data: users = [],
    loading: loadingUsers,
    error: errorUsersData,
    fetchData: fetchUsers
  } = useFetch("/api/admin/users")

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === "nip") {
      if (/^\d*$/.test(value) && value.length <= 18) {
        setCurrentUserData(prev => ({ ...prev, [name]: value }));
      }
    } else {
      setCurrentUserData(prev => ({ ...prev, [name]: value }));
    }
  };

  const validateUserData = () => {
    if (!currentUserData.name.trim()) {
      toast({ title: "Error", description: "Nama Lengkap wajib diisi.", variant: "destructive" });
      return false;
    }
    if (!currentUserData.nip) {
      toast({ title: "Error", description: "NIP wajib diisi.", variant: "destructive" });
      return false;
    }
    if (!/^\d{18}$/.test(currentUserData.nip)) {
      toast({ title: "Error", description: "NIP harus 18 digit angka.", variant: "destructive" });
      return false;
    }

    return true;
  };


  const handleAddUser = async () => {
    if (!validateUserData()) return;

    console.log(currentUserData.role)

    const newUser = currentUserData

    const feting = await axiosFetch({
      method: "POST",
      url: "/api/admin/users",
      data: {
        nama: newUser.name.trim(),
        nip: newUser.nip,
        role: newUser.role
      }
    })

    if (feting.status >= 400) {
      const errorMessage = feting.data?.message || "Terjadi kesalahan saat menambahkan pengguna.";
      toast({ title: "Error", description: errorMessage, variant: "destructive" });
      return;
    }

    // const updatedUsers = [...users, newUser];
    // localStorage.setItem('registeredUsers', JSON.stringify(updatedUsers));
    // setUsers(updatedUsers);
    toast({ title: "Sukses", description: `Pengguna ${newUser.fullName} berhasil ditambahkan.` });
    setIsModalOpen(false);
    resetForm();
  };

  const handleUpdateUser = async () => {
    if (!validateUserData()) return;

    const feting = await axiosFetch({
      method: "PUT",
      url: "/api/admin/users/" + currentUserData.id,
      data: {
        nama: currentUserData.name.trim(),
        nip: currentUserData.nip,
        role: currentUserData.role
      }
    })

    if (feting.status >= 400) {
      const errorMessage = feting.data?.message || "Terjadi kesalahan saat menambahkan pengguna.";
      toast({ title: "Error", description: errorMessage, variant: "destructive" });
      return;
    }

    toast({ title: "Sukses", description: "Data pengguna berhasil diperbarui." });
    setIsModalOpen(false);
    resetForm();
  };


  const handleSubmit = (e) => {
    e.preventDefault();
    if (isEditMode) {
      handleUpdateUser();
    } else {
      handleAddUser();
    }
  };

  const handleEdit = (user) => {
    setIsEditMode(true);
    setCurrentUserData(user);
    setIsModalOpen(true);
  };

  const openDeleteDialog = (user) => {
    
    setDeleteUser(user);
    setIsDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!deleteUser) return;

    const feting = await axiosFetch({
      method: "DELETE",
      url: "/api/admin/users/" + deleteUser.id
    })


    if (feting.status >= 400) {
      const errorMessage = feting.data?.message || "Terjadi kesalahan saat menambahkan pengguna.";
      toast({ title: "Error", description: errorMessage, variant: "destructive" });
      return;
    }


    toast({ title: "Sukses", description: `Pengguna ${deleteUser.fullName} berhasil dihapus.` });
    setIsDeleteDialogOpen(false);
    setDeleteUser(null);
  };

  const resetForm = () => {
    setIsEditMode(false);
    setCurrentUserData({ id: null, fullName: '', nip: '', role: 'USER' });
  };

  const filteredUsers = useMemo(() => {
    if (users == null) {
      return []
    }
    console.log(users)
    return users.filter(user =>
      (user.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (user.nip?.toLowerCase() || '').includes(searchTerm.toLowerCase())
    );

  }, [users])

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-sky-400">Manajemen Pengguna</h1>
        <div>
          <Button onClick={fetchUsers} variant="outline" className="mr-2 text-sky-400 border-sky-400 hover:bg-sky-400 hover:text-slate-900">
            <RefreshCw className={`mr-2 h-4 w-4 ${loadingUsers ? 'animate-spin' : ''}`} /> Refresh
          </Button>
          <Button onClick={() => { resetForm(); setIsModalOpen(true); }} className="bg-sky-600 hover:bg-sky-700 text-white">
            <UserPlus className="mr-2 h-5 w-5" /> Tambah Pengguna
          </Button>
        </div>
      </div>

      <Input
        type="text"
        placeholder="Cari pengguna (Nama, NIP)..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="max-w-sm bg-slate-700 border-slate-600 text-white placeholder-slate-400 focus:ring-sky-500 focus:border-sky-500"
      />

      <Card className="border-slate-700 bg-slate-800 shadow-xl">
        <CardHeader>
          <CardTitle className="text-sky-400">Daftar Pengguna</CardTitle>
          <CardDescription className="text-slate-400">Kelola akun peserta dan admin. Total: {filteredUsers.length} pengguna.</CardDescription>
        </CardHeader>
        <CardContent>
          {loadingUsers ? (
            <div className="flex justify-center items-center py-8">
              <RefreshCw className="h-8 w-8 text-sky-400 animate-spin" />
              <p className="ml-2 text-slate-300">Memuat pengguna...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-slate-700 hover:bg-slate-700/50">
                    <TableHead className="text-slate-300">Nama Lengkap</TableHead>
                    <TableHead className="text-slate-300">NIP</TableHead>
                    <TableHead className="text-slate-300">Role</TableHead>
                    <TableHead className="text-slate-300 text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map(user => (
                    <TableRow key={user.id} className="border-slate-700 hover:bg-slate-700/50">
                      <TableCell className="font-medium text-slate-200">{user.name}</TableCell>
                      <TableCell className="text-slate-300">{user.nip}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${user.role === 'ADMIN' ? 'bg-sky-500 text-white' : 'bg-emerald-500 text-white'}`}>
                          {user.role}
                        </span>
                      </TableCell>
                      <TableCell className="text-right space-x-2">
                        <Button variant="outline" size="sm" onClick={() => handleEdit(user)} className="text-yellow-400 border-yellow-400 hover:bg-yellow-400 hover:text-slate-900">
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => openDeleteDialog(user)} className="text-red-400 border-red-400 hover:bg-red-400 hover:text-white"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {filteredUsers.length === 0 && !loadingUsers && (
                <p className="text-center text-slate-400 py-8">Tidak ada pengguna ditemukan.</p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="bg-slate-800 border-slate-700 text-white">
          <DialogHeader>
            <DialogTitle className="text-sky-400">{isEditMode ? 'Edit Pengguna' : 'Tambah Pengguna Baru'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 py-4">
            <div>
              <Label htmlFor="name" className="text-slate-300">Nama Lengkap (Tanpa Gelar)</Label>
              <Input id="name" name="name" type="text" value={currentUserData.name} onChange={handleInputChange} required className="bg-slate-700 border-slate-600 placeholder-slate-500 focus:ring-sky-500 focus:border-sky-500" />
            </div>
            <div>
              <Label htmlFor="nip" className="text-slate-300">NIP (Nomor Induk Pegawai)</Label>
              <Input id="nip" name="nip" type="text" value={currentUserData.nip} onChange={handleInputChange} required className="bg-slate-700 border-slate-600 placeholder-slate-500 focus:ring-sky-500 focus:border-sky-500" maxLength="18" />
              <p className="text-xs text-slate-400 mt-1">NIP harus 18 digit angka.</p>
            </div>
            <div>
              <Label htmlFor="role" className="text-slate-300">Role</Label>
              <select
                id="role" name="role"
                value={currentUserData.role}
                onChange={handleInputChange}
                className="w-full p-2 rounded-md bg-slate-700 border-slate-600 text-white focus:ring-sky-500 focus:border-sky-500"
              >
                <option value="USER">Participant</option>
                <option value="ADMIN">Admin</option>
              </select>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)} className="text-slate-300 border-slate-600 hover:bg-slate-700">Batal</Button>
              <Button type="submit" className="bg-sky-600 hover:bg-sky-700 text-white">
                {isEditMode ? 'Simpan Perubahan' : 'Tambah Pengguna'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="bg-slate-800 border-slate-700 text-white">
          <DialogHeader>
            <DialogTitle className="text-red-500 flex items-center"><AlertTriangle className="mr-2 h-6 w-6 text-red-500" />Konfirmasi Hapus</DialogTitle>
            <DialogDescription className="text-slate-400">
              Apakah Anda yakin ingin menghapus pengguna <span className="font-semibold text-sky-400">{deleteUser?.fullName}</span>? Tindakan ini tidak dapat diurungkan.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)} className="text-slate-300 border-slate-600 hover:bg-slate-700">Batal</Button>
            <Button onClick={handleDelete} className="bg-red-600 hover:bg-red-700 text-white">
              Ya, Hapus
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </motion.div>
  );
};

export default AdminUserManagement;