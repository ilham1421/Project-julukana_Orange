import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Eye, Download, Trash2, AlertTriangle, RefreshCw } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';
import { motion } from 'framer-motion';

const AdminResultsView = () => {
  const [examResults, setExamResults] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedResult, setSelectedResult] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [questionsMap, setQuestionsMap] = useState({});
  const [resultToDelete, setResultToDelete] = useState(null);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const { toast } = useToast();
  const [loadingResults, setLoadingResults] = useState(true);

  const fetchResults = () => {
    setLoadingResults(true);
    const results = JSON.parse(localStorage.getItem('examResults')) || [];
    
    const formattedResults = results.map(result => ({
      ...result,
      userName: result.userName || result.userId || 'N/A', 
      userNip: result.userNip || result.nip || 'N/A', 
      scoreCorrect: result.scoreCorrect || result.score?.correct || 0,
      scoreTotal: result.scoreTotal || result.score?.total || 0,
      scorePercentage: result.scorePercentage || result.score?.percentage || 0,
      submittedAt: result.submittedAt || result.timestamp || new Date().toISOString(),
    }));
    setExamResults(formattedResults);

    const storedQuestions = JSON.parse(localStorage.getItem('cbtQuestions')) || [];
    const qMap = storedQuestions.reduce((acc, q) => {
      acc[q.id.toString()] = q;
      return acc;
    }, {});
    setQuestionsMap(qMap);
    setLoadingResults(false);
  };

  useEffect(() => {
    fetchResults();
  }, []);

  const filteredResults = examResults.filter(result =>
    (result.userName && typeof result.userName === 'string' && result.userName.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (result.userNip && typeof result.userNip === 'string' && result.userNip.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleViewDetails = (result) => {
    setSelectedResult(result);
    setIsDetailModalOpen(true);
  };

  const handleDownloadResults = () => {
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Nama Peserta,NIP,Skor Benar,Total Soal,Persentase,Tanggal Ujian,Lulus,Selesai Karena Pindah Tab\n";
    filteredResults.forEach(result => {
        const row = [
            `"${result.userName}"`,
            result.userNip,
            result.scoreCorrect,
            result.scoreTotal,
            `${result.scorePercentage}%`,
            new Date(result.submittedAt).toLocaleString('id-ID'),
            result.passed ? 'Ya' : 'Tidak',
            result.finishedDueToTabSwitch ? 'Ya' : 'Tidak'
        ].join(",");
        csvContent += row + "\n";
    });
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "hasil_ujian_cbt.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast({title: "Sukses", description: "Data hasil ujian telah diunduh."});
  };

  const confirmDeleteResult = (result) => {
    setResultToDelete(result);
    setIsDeleteConfirmOpen(true);
  };

  const handleDeleteResult = () => {
    if (!resultToDelete) return;
    const updatedResults = examResults.filter(r => r.submittedAt !== resultToDelete.submittedAt || r.userName !== resultToDelete.userName);
    localStorage.setItem('examResults', JSON.stringify(updatedResults));
    setExamResults(updatedResults);
    setIsDeleteConfirmOpen(false);
    setResultToDelete(null);
    toast({ title: "Sukses", description: "Hasil ujian berhasil dihapus." });
  };


  return (
    <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="space-y-6"
    >
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <h1 className="text-3xl font-bold text-sky-400">Hasil Ujian Peserta</h1>
        <div className="flex gap-2">
            <Button onClick={fetchResults} variant="outline" className="mr-2 text-sky-400 border-sky-400 hover:bg-sky-400 hover:text-slate-900">
                <RefreshCw className={`mr-2 h-4 w-4 ${loadingResults ? 'animate-spin' : ''}`} /> Refresh
            </Button>
            <Input
            type="text"
            placeholder="Cari (Nama/NIP)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-xs bg-slate-700 border-slate-600 text-white placeholder-slate-400 focus:ring-sky-500 focus:border-sky-500"
            />
            <Button onClick={handleDownloadResults} className="bg-emerald-600 hover:bg-emerald-700 text-white">
                <Download className="mr-2 h-4 w-4" /> Unduh Semua
            </Button>
        </div>
      </div>

      <Card className="border-slate-700 bg-slate-800 shadow-xl">
        <CardHeader>
          <CardTitle className="text-sky-400">Rekapitulasi Nilai</CardTitle>
          <CardDescription className="text-slate-400">Lihat dan kelola hasil ujian semua peserta. Total: {filteredResults.length} hasil.</CardDescription>
        </CardHeader>
        <CardContent>
          {loadingResults ? (
            <div className="flex justify-center items-center py-8">
              <RefreshCw className="h-8 w-8 text-sky-400 animate-spin" />
              <p className="ml-2 text-slate-300">Memuat hasil ujian...</p>
            </div>
          ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-slate-700 hover:bg-slate-700/50">
                  <TableHead className="text-slate-300">Nama Peserta</TableHead>
                  <TableHead className="text-slate-300">NIP</TableHead>
                  <TableHead className="text-slate-300">Skor</TableHead>
                  <TableHead className="text-slate-300">Persentase</TableHead>
                  <TableHead className="text-slate-300">Status</TableHead>
                  <TableHead className="text-slate-300">Tanggal Ujian</TableHead>
                  <TableHead className="text-slate-300 text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredResults.map((result, index) => (
                  <TableRow key={`${result.userName}-${result.submittedAt}-${index}`} className="border-slate-700 hover:bg-slate-700/50">
                    <TableCell className="font-medium text-slate-200">{result.userName}</TableCell>
                    <TableCell className="text-slate-300">{result.userNip}</TableCell>
                    <TableCell className="text-slate-300">{result.scoreCorrect} / {result.scoreTotal}</TableCell>
                    <TableCell className={`font-semibold ${result.passed ? 'text-green-400' : 'text-red-400'}`}>{result.scorePercentage}%</TableCell>
                    <TableCell>
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${result.passed ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
                            {result.passed ? 'Lulus' : 'Tidak Lulus'}
                        </span>
                        {result.finishedDueToTabSwitch && (
                            <span className="ml-2 px-2 py-1 text-xs font-semibold rounded-full bg-yellow-500 text-black">
                                Pindah Tab
                            </span>
                        )}
                    </TableCell>
                    <TableCell className="text-slate-300">{new Date(result.submittedAt).toLocaleString('id-ID')}</TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button variant="outline" size="sm" onClick={() => handleViewDetails(result)} className="text-sky-400 border-sky-400 hover:bg-sky-400 hover:text-slate-900">
                        <Eye className="h-4 w-4" />
                      </Button>
                       <Button variant="outline" size="sm" onClick={() => confirmDeleteResult(result)} className="text-red-400 border-red-400 hover:bg-red-400 hover:text-white">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          )}
           {filteredResults.length === 0 && !loadingResults && (
            <p className="text-center text-slate-400 py-8">Tidak ada hasil ujian ditemukan.</p>
          )}
        </CardContent>
      </Card>

      <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
        <DialogContent className="bg-slate-800 border-slate-700 text-white sm:max-w-2xl md:max-w-3xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle className="text-sky-400">Detail Hasil Ujian: {selectedResult?.userName}</DialogTitle>
            <DialogDescription className="text-slate-400">
              NIP: {selectedResult?.userNip} | Skor: {selectedResult?.scoreCorrect}/{selectedResult?.scoreTotal} ({selectedResult?.scorePercentage}%)
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-3 overflow-y-auto max-h-[calc(80vh-150px)] pr-2">
            {selectedResult && selectedResult.answers && Object.entries(selectedResult.answers).map(([questionId, userAnswer]) => {
              const question = questionsMap[questionId.toString()];
              if (!question) return <p key={questionId} className="text-red-400">Soal dengan ID {questionId} tidak ditemukan.</p>;
              
              const isCorrect = userAnswer === question.correctAnswer;
              return (
                <div key={questionId} className={`p-3 rounded-md border ${isCorrect ? 'border-green-500/50 bg-green-500/10' : 'border-red-500/50 bg-red-500/10'}`}>
                  <p className="font-semibold text-slate-200 mb-1">{question.id}. {question.text}</p>
                  <p className="text-sm text-slate-300">Jawaban Anda: <span className={`font-medium ${isCorrect ? 'text-green-400' : 'text-red-400'}`}>{userAnswer} ({question.options && question.options[userAnswer.charCodeAt(0) - 65] ? question.options[userAnswer.charCodeAt(0) - 65] : 'Jawaban tidak valid'})</span></p>
                  <p className="text-sm text-slate-300">Jawaban Benar: <span className="font-medium text-green-400">{question.correctAnswer} ({question.options && question.options[question.correctAnswer.charCodeAt(0) - 65] ? question.options[question.correctAnswer.charCodeAt(0) - 65] : 'Kunci tidak valid'})</span></p>
                </div>
              );
            })}
            {selectedResult && (!selectedResult.answers || Object.keys(selectedResult.answers).length === 0) && (
                <p className="text-slate-400 text-center py-4">Peserta tidak menjawab soal apapun atau data jawaban tidak tersedia.</p>
            )}
          </div>
          <DialogFooter>
            <Button onClick={() => setIsDetailModalOpen(false)} variant="outline" className="text-slate-300 border-slate-600 hover:bg-slate-700">Tutup</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isDeleteConfirmOpen} onOpenChange={setIsDeleteConfirmOpen}>
        <DialogContent className="bg-slate-800 border-slate-700 text-white">
          <DialogHeader>
            <DialogTitle className="text-red-500 flex items-center"><AlertTriangle className="mr-2 h-6 w-6 text-red-500" /> Konfirmasi Hapus Hasil Ujian</DialogTitle>
            <DialogDescription className="text-slate-400">
              Apakah Anda yakin ingin menghapus hasil ujian untuk peserta <span className="font-semibold text-sky-400">{resultToDelete?.userName} (NIP: {resultToDelete?.userNip})</span> yang dilaksanakan pada <span className="font-semibold text-sky-400">{new Date(resultToDelete?.submittedAt).toLocaleString('id-ID')}</span>? Tindakan ini tidak dapat diurungkan.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setIsDeleteConfirmOpen(false)} className="text-slate-300 border-slate-600 hover:bg-slate-700">Batal</Button>
            <Button onClick={handleDeleteResult} className="bg-red-600 hover:bg-red-700 text-white">Ya, Hapus Hasil</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </motion.div>
  );
};

export default AdminResultsView;