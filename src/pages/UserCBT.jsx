import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import CBTHeader from '@/components/CBTHeader';
import QuestionCard from '@/components/QuestionCard';
import NavigationSidebar from '@/components/NavigationSidebar';
import FinishDialog from '@/components/FinishDialog';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Trophy, Volume2, VolumeX, AlertTriangle as AlertTriangleIcon, Loader2 } from 'lucide-react';
import { questions as initialQuestionsData } from '@/data/questions';


const shuffleArray = (array) => {
  let currentIndex = array.length, randomIndex;
  while (currentIndex !== 0) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex], array[currentIndex]];
  }
  return array;
};

function UserCBT({ user, onLogout, examSettings: initialExamSettings }) {
  const [currentQuestionId, setCurrentQuestionId] = useState(null);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(initialExamSettings.duration_minutes * 60);
  const [showFinishDialog, setShowFinishDialog] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const [examSettings, setExamSettings] = useState(initialExamSettings);
  const [questions, setQuestions] = useState([]);
  const [isSirenMuted, setIsSirenMuted] = useState(false);
  const sirenAudioRef = useRef(null);
  const tabSwitchTimeoutRef = useRef(null);
  const [loadingQuestions, setLoadingQuestions] = useState(true);

  useEffect(() => {
    setLoadingQuestions(true);
    const storedQuestions = localStorage.getItem('cbtQuestions');
    let questionsToUse = [];
    if (storedQuestions) {
      questionsToUse = JSON.parse(storedQuestions);
    } else {
      questionsToUse = initialQuestionsData; // Fallback to static data if not in localStorage
      localStorage.setItem('cbtQuestions', JSON.stringify(initialQuestionsData));
    }
    
    const formattedQuestions = questionsToUse.map(q => ({...q, id: q.id.toString()}));
    setQuestions(examSettings.shuffle_questions ? shuffleArray([...formattedQuestions]) : formattedQuestions);
    if (formattedQuestions.length > 0) {
      setCurrentQuestionId(formattedQuestions[0].id);
    }
    setLoadingQuestions(false);
    
    setTimeLeft(initialExamSettings.duration_minutes * 60);
    setExamSettings(initialExamSettings);

  }, [initialExamSettings]);


  useEffect(() => {
    if (!user || user.role !== 'participant') {
      navigate('/');
      return;
    }
    
    const savedAnswers = localStorage.getItem(`cbt-answers-${user.nip}`);
    if (savedAnswers) {
      setAnswers(JSON.parse(savedAnswers));
    }

    const handleVisibilityChange = () => {
      if (document.hidden && examSettings.detect_tab_switch && !isFinished) {
        if (sirenAudioRef.current && !isSirenMuted) {
          sirenAudioRef.current.play().catch(e => console.error("Error playing siren:", e));
        }
        toast({
          title: 'Peringatan!',
          description: 'Anda terdeteksi berpindah tab. Ujian akan diakhiri otomatis.',
          variant: 'destructive',
          duration: 5000,
        });
        if (tabSwitchTimeoutRef.current) clearTimeout(tabSwitchTimeoutRef.current);
        tabSwitchTimeoutRef.current = setTimeout(() => {
          handleFinishExam(true);
        }, 3000);
      } else {
        if (tabSwitchTimeoutRef.current) clearTimeout(tabSwitchTimeoutRef.current);
        if (sirenAudioRef.current) {
            sirenAudioRef.current.pause();
            sirenAudioRef.current.currentTime = 0;
        }
      }
    };
    
    if (examSettings.detect_tab_switch) {
      document.addEventListener('visibilitychange', handleVisibilityChange);
    }

    return () => {
      if (examSettings.detect_tab_switch) {
        document.removeEventListener('visibilitychange', handleVisibilityChange);
      }
      if (tabSwitchTimeoutRef.current) clearTimeout(tabSwitchTimeoutRef.current);
       if (sirenAudioRef.current) {
          sirenAudioRef.current.pause();
          sirenAudioRef.current.currentTime = 0;
       }
    };
  }, [user, navigate, examSettings.detect_tab_switch, isFinished, isSirenMuted, toast]);


  useEffect(() => {
    if (timeLeft > 0 && !isFinished && user && questions.length > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && !isFinished && user && questions.length > 0) {
      handleFinishExam(false);
      toast({
        title: "Waktu Habis!",
        description: "Ujian telah berakhir karena waktu habis.",
        variant: "destructive",
      });
    }
  }, [timeLeft, isFinished, user, questions.length, toast]);

  useEffect(() => { 
    if (user) {
      localStorage.setItem(`cbt-answers-${user.nip}`, JSON.stringify(answers));
    }
  }, [answers, user]);

  const handleAnswerSelect = (questionId, answer) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
    toast({
      title: "Jawaban Tersimpan (Lokal)",
      description: `Soal ${questions.findIndex(q => q.id === questionId) + 1} dijawab.`,
    });
  };
  
  const getCurrentQuestionIndex = () => questions.findIndex(q => q.id === currentQuestionId);

  const handleQuestionSelect = (questionIndex) => {
    if (questions[questionIndex]) {
      setCurrentQuestionId(questions[questionIndex].id);
    }
  };

  const handlePrevious = () => {
    const currentIndex = getCurrentQuestionIndex();
    if (currentIndex > 0) {
      setCurrentQuestionId(questions[currentIndex - 1].id);
    }
  };

  const handleNext = () => {
    const currentIndex = getCurrentQuestionIndex();
    if (currentIndex < questions.length - 1) {
      setCurrentQuestionId(questions[currentIndex + 1].id);
    }
  };

  const handleFinishExam = (dueToTabSwitch = false) => {
    setIsFinished(true);
    setShowFinishDialog(false);
    if (sirenAudioRef.current) {
      sirenAudioRef.current.pause();
      sirenAudioRef.current.currentTime = 0;
    }
    if (tabSwitchTimeoutRef.current) clearTimeout(tabSwitchTimeoutRef.current);

    let correct = 0;
    let scorePercentage = 0;
    if (questions.length > 0) {
        questions.forEach((question) => {
          if (answers[question.id] === question.correctAnswer) { 
            correct++;
          }
        });
        scorePercentage = Math.round((correct / questions.length) * 100);
    }

    const resultData = {
      userId: user.id, 
      userNip: user.nip,
      userName: user.fullName,
      answers: answers,
      scoreCorrect: correct,
      scoreTotal: questions.length,
      scorePercentage: scorePercentage,
      finishedDueToTabSwitch: dueToTabSwitch,
      passingGradePercentage: examSettings.passing_grade_percentage,
      passed: scorePercentage >= examSettings.passing_grade_percentage,
      submittedAt: new Date().toISOString(),
      examSettingsApplied: examSettings 
    };

    const allResults = JSON.parse(localStorage.getItem('examResults')) || [];
    allResults.push(resultData);
    localStorage.setItem('examResults', JSON.stringify(allResults));

    toast({
      title: "Ujian Selesai",
      description: dueToTabSwitch 
        ? "Ujian Anda telah diakhiri secara otomatis karena berpindah tab. Hasil disimpan."
        : "Terima kasih telah mengikuti ujian CBT. Hasil Anda telah disimpan.",
      variant: dueToTabSwitch ? "destructive" : "default",
    });
    localStorage.removeItem(`cbt-answers-${user.nip}`); 
  };
  
  const toggleSirenMute = () => {
    setIsSirenMuted(!isSirenMuted);
    if (sirenAudioRef.current) {
      sirenAudioRef.current.muted = !isSirenMuted;
      if (!isSirenMuted && document.hidden && examSettings.detect_tab_switch && !isFinished) {
         sirenAudioRef.current.play().catch(e => console.error("Error playing siren:", e));
      } else {
        sirenAudioRef.current.pause();
      }
    }
  };

  if (!user) {
    return <div className="flex justify-center items-center h-screen text-white">Memuat data pengguna...</div>;
  }
  if (loadingQuestions) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-50">
        <Loader2 className="w-12 h-12 text-sky-500 animate-spin mb-4" />
        <p className="text-lg text-gray-700">Memuat soal ujian...</p>
      </div>
    );
  }

  if (isFinished) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex flex-col items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="bg-white p-10 rounded-xl shadow-2xl text-center max-w-lg w-full"
        >
          <Trophy className="w-20 h-20 text-yellow-500 mx-auto mb-6" />
          <h1 className="text-3xl font-bold text-gray-800 mb-4">Ujian Telah Selesai!</h1>
          <p className="text-gray-600 mb-8">
            Terima kasih, {user.fullName}, telah menyelesaikan ujian. Hasil ujian Anda telah direkam.
          </p>
          <Button
            onClick={onLogout}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-3 text-lg"
          >
            Kembali ke Halaman Login
          </Button>
        </motion.div>
      </div>
    );
  }
  
  if (questions.length === 0 && !loadingQuestions) {
    return (
         <div className="min-h-screen bg-gray-50 flex flex-col">
            <CBTHeader
                timeLeft={timeLeft}
                currentQuestion={0}
                totalQuestions={0}
                participantName={user.fullName}
                onLogout={onLogout}
            />
            <div className="flex-1 flex items-center justify-center p-6">
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center bg-white p-8 rounded-lg shadow-xl"
                >
                    <Trophy className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
                    <h2 className="text-2xl font-semibold text-gray-700 mb-2">Belum Ada Soal</h2>
                    <p className="text-gray-500">Saat ini belum ada soal yang tersedia untuk ujian. Silakan hubungi admin.</p>
                     <Button onClick={onLogout} className="mt-6 bg-blue-600 hover:bg-blue-700">
                        Kembali ke Login
                    </Button>
                </motion.div>
            </div>
        </div>
    );
  }

  const currentQuestionData = questions.find(q => q.id === currentQuestionId);
  
  if (!currentQuestionData && questions.length > 0 && currentQuestionId === null) {
    setCurrentQuestionId(questions[0].id);
    return <div className="flex justify-center items-center h-screen">Inisialisasi soal...</div>;
  }

  if (!currentQuestionData && questions.length > 0) {
     return <div className="flex justify-center items-center h-screen">Memuat soal... ID soal tidak valid atau soal belum terinisialisasi.</div>;
  }


  return (
    <div className="min-h-screen bg-gray-50">
      <audio ref={sirenAudioRef} src="/siren.mp3" loop muted={isSirenMuted} />
      <CBTHeader
        timeLeft={timeLeft}
        currentQuestion={getCurrentQuestionIndex() + 1}
        totalQuestions={questions.length}
        participantName={user.fullName}
        onLogout={onLogout}
      />
       {examSettings.detect_tab_switch && (
        <div className="fixed bottom-4 right-4 z-50">
          <Button onClick={toggleSirenMute} variant="outline" size="icon" className="bg-white/80 backdrop-blur-sm shadow-lg">
            {isSirenMuted ? <VolumeX className="h-5 w-5 text-red-500" /> : <Volume2 className="h-5 w-5 text-green-500" />}
          </Button>
        </div>
      )}
      
      <div className="flex flex-col md:flex-row h-[calc(100vh-4rem-var(--header-offset,0px))] md:h-[calc(100vh-4rem)]">
        <div className="flex-1 p-4 md:p-6 overflow-y-auto">
          <div className="max-w-4xl mx-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentQuestionId}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                {currentQuestionData && (
                    <QuestionCard
                    question={currentQuestionData} 
                    selectedAnswer={answers[currentQuestionId]}
                    onAnswerSelect={(answer) => handleAnswerSelect(currentQuestionId, answer)}
                    />
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        <NavigationSidebar
          currentQuestionIndex={getCurrentQuestionIndex()}
          questions={questions}
          answers={answers}
          onQuestionSelect={handleQuestionSelect}
          onPrevious={handlePrevious}
          onNext={handleNext}
          onFinish={() => setShowFinishDialog(true)}
        />
      </div>

      <FinishDialog
        isOpen={showFinishDialog}
        onClose={() => setShowFinishDialog(false)}
        onConfirm={() => handleFinishExam(false)}
        answeredCount={Object.keys(answers).length}
        totalQuestions={questions.length}
      />
       <style jsx>{`
        :root {
          --header-offset: ${examSettings.detect_tab_switch ? '2.5rem' : '0px'}; 
        }
      `}</style>
    </div>
  );
}

export default UserCBT;