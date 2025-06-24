import React, { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
  FilePlus,
  Edit2,
  Trash2,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
} from "lucide-react";
import { motion } from "framer-motion";
import useFetch from "../../hooks/useFetch";
import axiosFetch from "../../lib/axios";
import { convertAnswerToNumber } from "../../lib/utils";

// Tentukan berapa item yang ditampilkan per halaman
const ITEMS_PER_PAGE = 10;

const AdminQuestionManagement = () => {
  // --- SEMUA STATE DAN HOOKS TETAP SAMA DARI KODE ASLI ANDA ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState({
    id: null,
    text: "",
    options: ["", "", "", ""],
    correctAnswer: "A",
  });
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();
  const [deleteQuestion, setDeleteQuestion] = useState(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  // --- LOGIKA FETCH TIDAK DIUBAH (TETAP CLIENT-SIDE SEARCH) ---
  const {
    data: responseData,
    loading: loadingQuestions,
    error: errorQuestions,
    refetch,
  } = useFetch(
    "/api/admin/soal?" +
      new URLSearchParams({
        page: currentPage,
        limit: ITEMS_PER_PAGE,
      })
  );

  const questions = useMemo(() => responseData?.soals ?? [], [responseData]);
  const totalPages = useMemo(() => {
    if (!responseData || !responseData.total) return 1;
    return Math.ceil(responseData.total / ITEMS_PER_PAGE);
  }, [responseData]);

  // Handle error dari fetch
  useEffect(() => {
    if (errorQuestions) {
      toast({
        title: "Gagal Memuat Soal",
        description:
          errorQuestions.message || "Tidak dapat terhubung ke server.",
        variant: "destructive",
      });
    }
  }, [errorQuestions, toast]);

  // --- SEMUA FUNGSI HELPER TETAP SAMA, TIDAK ADA PERUBAHAN ---
  const saveQuestions = async () => {
    const feting = await axiosFetch({
      url: "/api/admin/soal",
      method: "POST",
      data: {
        question: currentQuestion.text,
        options: currentQuestion.options,
        answer: convertAnswerToNumber(currentQuestion.correctAnswer),
      },
    });

    if (feting.status >= 400) {
      const errorMessage = feting.data?.message || "Gagal menyimpan soal.";
      toast({
        title: "Gagal",
        description: errorMessage,
        variant: "destructive",
      });
      return;
    }
    toast({ title: "Sukses", description: "Soal berhasil disimpan." });
    setIsModalOpen(false);
    resetForm();
    refetch();
  };

  const saveUpdateQuestions = async () => {
    const feting = await axiosFetch({
      url: "/api/admin/soal/" + currentQuestion.id,
      method: "PUT",
      data: {
        question: currentQuestion.text,
        options: currentQuestion.options,
        answer: convertAnswerToNumber(currentQuestion.correctAnswer),
      },
    });

    if (feting.status >= 400) {
      const errorMessage = feting.data.message || "Gagal memperbarui soal.";
      toast({
        title: "Gagal",
        description: errorMessage,
        variant: "destructive",
      });
      return;
    }
    toast({ title: "Sukses", description: "Soal berhasil diperbarui." });
    setIsModalOpen(false);
    resetForm();
    refetch();
  };

  const handleDelete = async () => {
    if (!deleteQuestion) return;

    const feting = await axiosFetch({
      url: "/api/admin/soal/" + deleteQuestion.id,
      method: "DELETE",
    });

    if (feting.status >= 400) {
      const errorMessage = feting.data.message || "Gagal menghapus soal.";
      toast({
        title: "Gagal",
        description: errorMessage,
        variant: "destructive",
      });
      return;
    }

    toast({ title: "Sukses", description: `Soal berhasil dihapus.` });
    setIsDeleteDialogOpen(false);
    setDeleteQuestion(null);
    refetch();
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCurrentQuestion((prev) => ({ ...prev, [name]: value }));
  };
  const handleOptionChange = (index, value) => {
    const newOptions = [...currentQuestion.options];
    newOptions[index] = value;
    setCurrentQuestion((prev) => ({ ...prev, options: newOptions }));
  };
  const handleSubmit = (e) => {
    e.preventDefault();
    if (
      !currentQuestion.text ||
      currentQuestion.options.some((opt) => !opt) ||
      !currentQuestion.correctAnswer
    ) {
      toast({
        title: "Gagal",
        description: "Semua field wajib diisi.",
        variant: "destructive",
      });
      return;
    }
    if (isEditMode) {
      saveUpdateQuestions();
    } else {
      saveQuestions();
    }
  };
  const handleEdit = (question) => {
    setIsEditMode(true);
    setCurrentQuestion(question);
    setIsModalOpen(true);
  };
  const openDeleteDialog = (question) => {
    setDeleteQuestion(question);
    setIsDeleteDialogOpen(true);
  };
  const resetForm = () => {
    setIsEditMode(false);
    setCurrentQuestion({
      id: null,
      text: "",
      options: ["", "", "", ""],
      correctAnswer: "A",
    });
  };

  // --- LOGIKA FILTER CLIENT-SIDE TIDAK DIUBAH ---
  const filteredQuestions = useMemo(() => {
    if (!Array.isArray(questions)) return [];
    return questions.filter((q) =>
      q.question.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [questions, searchTerm]);

  // --- FUNGSI PAGINATION TIDAK DIUBAH ---
  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {/* Header tidak berubah */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-sky-400">Manajemen Soal</h1>
        <div>
          {" "}
          {/* Pembungkus untuk tombol-tombol header */}
          <Button
            onClick={() => refetch()}
            variant="outline"
            className="mr-2 text-sky-400 border-sky-400 hover:bg-sky-400 hover:text-slate-900"
            disabled={loadingQuestions}
          >
            <RefreshCw
              className={`mr-2 h-4 w-4 ${
                loadingQuestions ? "animate-spin" : ""
              }`}
            />
            Refresh
          </Button>
          <Button
            onClick={() => {
              resetForm();
              setIsModalOpen(true);
            }}
            className="bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            <FilePlus className="mr-2 h-5 w-5" /> Tambah Soal
          </Button>
        </div>
      </div>

      {/* Input search tidak berubah */}
      <Input
        type="text"
        placeholder="Cari soal..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="max-w-sm bg-slate-700 border-slate-600 text-white placeholder-slate-400 focus:ring-sky-500 focus:border-sky-500"
      />

      <Card className="border-slate-700 bg-slate-800 shadow-xl">
        <CardHeader>
          <CardTitle className="text-sky-400">Daftar Soal Ujian</CardTitle>
          <CardDescription className="text-slate-400">
            Kelola semua soal untuk CBT.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            {loadingQuestions && filteredQuestions.length === 0 ? (
              <div className="flex justify-center items-center py-16">
                <RefreshCw className="h-8 w-8 text-sky-400 animate-spin" />
                <p className="ml-3 text-slate-300">Memuat data soal...</p>
              </div>
            ) : (
              <Table>
                {/* Tabel tidak berubah */}
                <TableHeader>
                  <TableRow className="border-slate-700 hover:bg-slate-700/50">
                    <TableHead className="text-slate-300 w-[55%]">
                      Teks Soal
                    </TableHead>
                    <TableHead className="text-slate-300">
                      Jawaban Benar
                    </TableHead>
                    <TableHead className="text-slate-300 text-right">
                      Aksi
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredQuestions.map((q) => (
                    <TableRow
                      key={q.id}
                      className="border-slate-700 hover:bg-slate-700/50"
                    >
                      <TableCell className="font-medium text-slate-200 truncate max-w-xs">
                        {q.question}
                      </TableCell>
                      <TableCell className="text-slate-300">
                        {q.options[q.answer]}
                      </TableCell>
                      <TableCell className="text-right space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            handleEdit({
                              id: q.id,
                              text: q.question,
                              options: q.options,
                              correctAnswer: String.fromCharCode(65 + q.answer),
                            })
                          }
                          className="text-yellow-400 border-yellow-400 hover:bg-yellow-400 hover:text-slate-900"
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openDeleteDialog(q)}
                          className="text-red-400 border-red-400 hover:bg-red-400 hover:text-white"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
          {!loadingQuestions && filteredQuestions.length === 0 && (
            <p className="text-center text-slate-400 py-8">
              Tidak ada soal ditemukan.
            </p>
          )}

          {/* ========================================================= */}
          {/* ### HANYA BLOK INI YANG DIUBAH ### */}
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
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1 || loadingQuestions}
                  className="bg-transparent text-amber-400 border-amber-400/40 hover:bg-amber-400 hover:text-slate-900 hover:border-amber-400 disabled:opacity-30 disabled:border-slate-600 disabled:text-slate-600"
                >
                  <ChevronLeft className="h-4 w-4 mr-2" />
                  Sebelumnya
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages || loadingQuestions}
                  className="bg-transparent text-amber-400 border-amber-400/40 hover:bg-amber-400 hover:text-slate-900 hover:border-amber-400 disabled:opacity-30 disabled:border-slate-600 disabled:text-slate-600"
                >
                  Selanjutnya
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </div>
          )}
          {/* ========================================================= */}
          {/* ### AKHIR BLOK YANG DIUBAH ### */}
          {/* ========================================================= */}
        </CardContent>
      </Card>

      {/* Dialogs tidak berubah */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="bg-slate-800 border-slate-700 text-white sm:max-w-[625px]">
          <DialogHeader>
            <DialogTitle className="text-sky-400">
              {isEditMode ? "Edit Soal" : "Tambah Soal Baru"}
            </DialogTitle>
            <DialogDescription className="text-slate-400">
              {isEditMode
                ? "Ubah detail soal."
                : "Masukkan detail untuk soal baru."}
            </DialogDescription>
          </DialogHeader>
          <form
            onSubmit={handleSubmit}
            className="space-y-4 py-4 max-h-[70vh] overflow-y-auto pr-2"
          >
            <div>
              <Label htmlFor="text" className="text-slate-300">
                Teks Soal
              </Label>
              <Textarea
                id="text"
                name="text"
                value={currentQuestion.text}
                onChange={handleInputChange}
                required
                className="bg-slate-700 border-slate-600 placeholder-slate-500 focus:ring-sky-500 focus:border-sky-500 min-h-[100px]"
              />
            </div>
            {currentQuestion.options.map((option, index) => {
              const optionLetter = String.fromCharCode(65 + index);
              return (
                <div key={index}>
                  <Label
                    htmlFor={`option${optionLetter}`}
                    className="text-slate-300"
                  >
                    Opsi {optionLetter}
                  </Label>
                  <Input
                    id={`option${optionLetter}`}
                    name={`option${optionLetter}`}
                    value={option}
                    onChange={(e) => handleOptionChange(index, e.target.value)}
                    required
                    className="bg-slate-700 border-slate-600 placeholder-slate-500 focus:ring-sky-500 focus:border-sky-500"
                  />
                </div>
              );
            })}
            <div>
              <Label htmlFor="correctAnswer" className="text-slate-300">
                Jawaban Benar
              </Label>
              <select
                id="correctAnswer"
                name="correctAnswer"
                value={currentQuestion.correctAnswer}
                onChange={handleInputChange}
                required
                className="w-full p-2 rounded-md bg-slate-700 border-slate-600 text-white focus:ring-sky-500 focus:border-sky-500"
              >
                <option value="A">A</option>
                <option value="B">B</option>
                <option value="C">C</option>
                <option value="D">D</option>
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
                className="bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                {isEditMode ? "Simpan Perubahan" : "Tambah Soal"}
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
              Apakah Anda yakin ingin menghapus soal:{" "}
              <span className="font-semibold text-sky-400">
                "{deleteQuestion?.question.substring(0, 50)}..."
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

export default AdminQuestionManagement;
