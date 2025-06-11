import React from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { AlertTriangle, CheckCircle2 } from 'lucide-react';

const FinishDialog = ({ isOpen, onClose, onConfirm, answeredCount, totalQuestions }) => {
  const unansweredCount = totalQuestions - answeredCount;

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent className="bg-white rounded-lg shadow-xl">
        <AlertDialogHeader>
          <div className="flex justify-center mb-4">
            <AlertTriangle className="w-16 h-16 text-yellow-500" />
          </div>
          <AlertDialogTitle className="text-2xl font-bold text-center text-gray-800">
            Konfirmasi Selesaikan Ujian
          </AlertDialogTitle>
          <AlertDialogDescription className="text-center text-gray-600 mt-2">
            Anda telah menjawab <strong className="text-green-600">{answeredCount}</strong> dari <strong className="text-blue-600">{totalQuestions}</strong> soal.
            {unansweredCount > 0 && (
              <p className="mt-1">
                Masih ada <strong className="text-red-600">{unansweredCount}</strong> soal yang belum terjawab.
              </p>
            )}
            <p className="mt-2">Apakah Anda yakin ingin menyelesaikan ujian sekarang?</p>
            <p className="text-sm text-gray-500 mt-3">Jawaban yang sudah disimpan tidak dapat diubah setelah ujian selesai.</p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="mt-6 gap-2 sm:justify-center">
          <AlertDialogCancel 
            onClick={onClose}
            className="w-full sm:w-auto px-6 py-2.5 border-gray-300 text-gray-700 hover:bg-gray-100"
          >
            Batal
          </AlertDialogCancel>
          <AlertDialogAction 
            onClick={onConfirm}
            className="w-full sm:w-auto px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white flex items-center justify-center"
          >
            <CheckCircle2 className="w-5 h-5 mr-2" />
            Ya, Selesaikan Ujian
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default FinishDialog;