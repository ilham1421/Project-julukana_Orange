import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { Trophy, CheckCircle2, XCircle, RotateCcw, Download, ListChecks } from 'lucide-react';

const ResultScreen = ({ answers, questions, onRestart, participantName }) => {
  const calculateScore = () => {
    if (!questions || questions.length === 0) {
      return { correct: 0, total: 0, percentage: 0 };
    }
    let correct = 0;
    questions.forEach((question) => {
      if (answers[question.id] === question.correctAnswer) {
        correct++;
      }
    });
    return {
      correct,
      total: questions.length,
      percentage: Math.round((correct / questions.length) * 100)
    };
  };

  const score = calculateScore();

  const getGrade = (percentage) => {
    if (percentage >= 85) return { grade: 'Sangat Baik', color: 'text-green-600', bg: 'bg-green-100' };
    if (percentage >= 70) return { grade: 'Baik', color: 'text-sky-600', bg: 'bg-sky-100' };
    if (percentage >= 55) return { grade: 'Cukup', color: 'text-yellow-600', bg: 'bg-yellow-100' };
    if (percentage >= 40) return { grade: 'Kurang', color: 'text-orange-600', bg: 'bg-orange-100' };
    return { grade: 'Sangat Kurang', color: 'text-red-600', bg: 'bg-red-100' };
  };

  const gradeInfo = getGrade(score.percentage);

  const handleDownloadDetail = () => {
    let content = `Hasil Ujian CBT - ${participantName}\n`;
    content += `Tanggal: ${new Date().toLocaleDateString('id-ID')}\n`;
    content += `Skor: ${score.correct}/${score.total} (${score.percentage}%)\n`;
    content += `Predikat: ${gradeInfo.grade}\n\n`;
    content += "Detail Jawaban:\n";

    questions.forEach(q => {
        const userAnswer = answers[q.id] || "Tidak Dijawab";
        const correctAnswer = q.correctAnswer;
        const isCorrect = userAnswer === correctAnswer;
        const userAnswerText = userAnswer !== "Tidak Dijawab" ? `${userAnswer} (${q.options[userAnswer.charCodeAt(0) - 65]})` : "Tidak Dijawab";
        const correctAnswerText = `${correctAnswer} (${q.options[correctAnswer.charCodeAt(0) - 65]})`;

        content += `\nSoal ${q.id}: ${q.text}\n`;
        content += `Jawaban Anda: ${userAnswerText} ${isCorrect ? '(Benar)' : '(Salah)'}\n`;
        if (!isCorrect) {
            content += `Jawaban Benar: ${correctAnswerText}\n`;
        }
    });
    
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `Hasil_Ujian_${participantName.replace(/\s+/g, '_')}.txt`;
    link.click();
    URL.revokeObjectURL(link.href);
  };


  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4 md:p-6">
      <motion.div 
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-4xl mx-auto"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-block p-4 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full shadow-lg mb-4">
            <Trophy className="w-16 h-16 text-white" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">Selamat, Ujian Selesai!</h1>
          <p className="text-gray-600 text-lg">Berikut adalah ringkasan hasil ujian CBT Anda, {participantName}.</p>
        </div>

        {/* Score Card */}
        <Card className="mb-8 shadow-2xl border-0 overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
            <CardTitle className="text-2xl text-center">
              <div className="flex items-center justify-center space-x-2">
                <ListChecks className="w-7 h-7" />
                <span>Ringkasan Hasil</span>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 md:p-8 bg-white">
            <div className="grid md:grid-cols-3 gap-6 text-center">
              <motion.div initial={{opacity:0, scale:0.8}} animate={{opacity:1, scale:1}} transition={{delay:0.2}}>
                <div className={`p-4 rounded-lg ${gradeInfo.bg}`}>
                  <p className="text-sm font-medium text-gray-600 mb-1">Predikat</p>
                  <p className={`text-3xl font-bold ${gradeInfo.color}`}>
                    {gradeInfo.grade}
                  </p>
                </div>
              </motion.div>
              
              <motion.div initial={{opacity:0, scale:0.8}} animate={{opacity:1, scale:1}} transition={{delay:0.3}}>
                 <div className="p-4 rounded-lg bg-blue-100">
                    <p className="text-sm font-medium text-gray-600 mb-1">Persentase Benar</p>
                    <p className="text-3xl font-bold text-blue-600">
                        {score.percentage}%
                    </p>
                 </div>
              </motion.div>

              <motion.div initial={{opacity:0, scale:0.8}} animate={{opacity:1, scale:1}} transition={{delay:0.4}}>
                <div className="p-4 rounded-lg bg-green-100">
                    <p className="text-sm font-medium text-gray-600 mb-1">Jawaban Benar</p>
                    <p className="text-3xl font-bold text-green-600">
                        {score.correct} / {score.total}
                    </p>
                </div>
              </motion.div>
            </div>
             <div className="mt-8 text-center text-gray-600">
                <p>Hasil detail telah disimpan. Anda dapat mengunduh ringkasan atau mengulang ujian.</p>
            </div>
          </CardContent>
        </Card>
        
        {/* Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="flex flex-col sm:flex-row justify-center items-center space-y-3 sm:space-y-0 sm:space-x-4"
        >
          <Button
            onClick={onRestart}
            className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 text-base"
          >
            <RotateCcw className="w-5 h-5 mr-2" />
            Ulangi Ujian
          </Button>
          <Button 
            variant="outline" 
            onClick={handleDownloadDetail}
            className="w-full sm:w-auto border-emerald-500 text-emerald-600 hover:bg-emerald-500 hover:text-white py-3 px-6 text-base"
            >
            <Download className="w-5 h-5 mr-2" />
            Unduh Detail Hasil
          </Button>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default ResultScreen;