import React, { useState, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import CBTHeader from "@/components/CBTHeader";
import QuestionCard from "@/components/QuestionCard";
import NavigationSidebar from "@/components/NavigationSidebar";
import FinishDialog from "@/components/FinishDialog";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import {
  Trophy,
  Volume2,
  VolumeX,
  AlertTriangle as AlertTriangleIcon,
  Loader2,
} from "lucide-react";
import { questions as initialQuestionsData } from "@/data/questions";

// Helper function to shuffle an array
const shuffleArray = (array) => {
  let currentIndex = array.length,
    randomIndex;
  while (currentIndex !== 0) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex],
      array[currentIndex],
    ];
  }
  return array;
};

function UserCBT({ user, onLogout, examSettings }) {
  const [questions, setQuestions] = useState([]);
  const [currentQuestionId, setCurrentQuestionId] = useState(null);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(examSettings.duration_minutes * 60);
  const [showFinishDialog, setShowFinishDialog] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [isSirenMuted, setIsSirenMuted] = useState(false);
  const [loadingQuestions, setLoadingQuestions] = useState(true);
  const [fullscreenExitCount, setFullscreenExitCount] = useState(0);
  const [fullscreenWarning, setFullscreenWarning] = useState(false);
  const [notificationModal, setNotificationModal] = useState({
    isOpen: false,
    title: "",
    description: "",
  });

  const { toast } = useToast();
  const navigate = useNavigate();
  const sirenAudioRef = useRef(null);
  const tabSwitchTimeoutRef = useRef(null);

  const currentQuestionData = useMemo(() => {
    return questions.find((q) => q.id === currentQuestionId);
  }, [currentQuestionId, questions]);

  // Effect untuk inisialisasi ujian (dijalankan sekali)
  useEffect(() => {
    if (!user || user.role !== "participant") {
      navigate("/");
      return;
    }

    setLoadingQuestions(true);

    const storedQuestions = localStorage.getItem("cbtQuestions");
    const questionsToUse = storedQuestions
      ? JSON.parse(storedQuestions)
      : initialQuestionsData;

    const formattedQuestions = questionsToUse.map((q) => ({
      ...q,
      id: q.id.toString(),
    }));
    const finalQuestions = examSettings.shuffle_questions
      ? shuffleArray([...formattedQuestions])
      : formattedQuestions;

    setQuestions(finalQuestions);
    if (finalQuestions.length > 0) {
      setCurrentQuestionId(finalQuestions[0].id);
    }

    const savedAnswers = localStorage.getItem(`cbt-answers-${user.nip}`);
    if (savedAnswers) {
      setAnswers(JSON.parse(savedAnswers));
    }

    setTimeLeft(examSettings.duration_minutes * 60);
    setLoadingQuestions(false);
    enterFullscreen();
  }, [examSettings, user, navigate]);

  // Effect untuk timer ujian
  useEffect(() => {
    if (isFinished || loadingQuestions || timeLeft <= 0) return;
    const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
    return () => clearTimeout(timer);
  }, [timeLeft, isFinished, loadingQuestions]);

  // Effect untuk mengakhiri ujian saat waktu habis
  useEffect(() => {
    if (timeLeft === 0 && !isFinished && !loadingQuestions) {
      handleFinishExam({
        isViolation: false,
        reason: "Ujian telah berakhir karena waktu habis.",
      });
    }
  }, [timeLeft, isFinished, loadingQuestions]);

  // Effect untuk menyimpan jawaban ke localStorage
  useEffect(() => {
    if (user && Object.keys(answers).length > 0) {
      localStorage.setItem(`cbt-answers-${user.nip}`, JSON.stringify(answers));
    }
  }, [answers, user]);

  // Effect untuk deteksi kecurangan (pindah tab & keluar fullscreen)
  useEffect(() => {
    if (isFinished) return;

    const handleVisibilityChange = () => {
      if (document.hidden && examSettings.detect_tab_switch) {
        if (sirenAudioRef.current && !isSirenMuted)
          sirenAudioRef.current.play().catch(console.error);

        showModalNotification({
          title: "Peringatan!",
          description:
            "Anda terdeteksi berpindah tab. Ujian akan diakhiri otomatis dalam 3 detik.",
        });

        tabSwitchTimeoutRef.current = setTimeout(() => {
          handleFinishExam({
            isViolation: true,
            reason: "Ujian dihentikan karena berpindah tab.",
          });
        }, 3000);
      } else {
        clearTimeout(tabSwitchTimeoutRef.current);
        if (sirenAudioRef.current) sirenAudioRef.current.pause();
      }
    };

    const handleFullscreenChange = () => {
      if (document.fullscreenElement === null && !isFinished) {
        const newCount = fullscreenExitCount + 1;
        setFullscreenExitCount(newCount);

        if (newCount >= 2) {
          handleFinishExam({
            isViolation: true,
            reason:
              "Ujian dihentikan karena keluar dari mode fullscreen 2 kali.",
          });
        } else {
          setFullscreenWarning(true);
        }
      }
    };

    if (examSettings.detect_tab_switch)
      document.addEventListener("visibilitychange", handleVisibilityChange);
    document.addEventListener("fullscreenchange", handleFullscreenChange);

    return () => {
      if (examSettings.detect_tab_switch)
        document.removeEventListener(
          "visibilitychange",
          handleVisibilityChange
        );
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      clearTimeout(tabSwitchTimeoutRef.current);
    };
  }, [
    isFinished,
    isSirenMuted,
    fullscreenExitCount,
    examSettings.detect_tab_switch,
  ]);

  const enterFullscreen = () => {
    const elem = document.documentElement;
    if (elem.requestFullscreen) {
      elem.requestFullscreen().catch(() => setFullscreenWarning(true));
    }
  };

  const handleAnswerSelect = (questionId, answer) => {
    setAnswers((prev) => ({ ...prev, [questionId]: answer }));
    toast({
      description: `Jawaban untuk soal nomor ${
        questions.findIndex((q) => q.id === questionId) + 1
      } disimpan.`,
    });
  };

  const showModalNotification = ({ title, description }) => {
    setNotificationModal({ isOpen: true, title, description });
  };

  const getCurrentQuestionIndex = () =>
    questions.findIndex((q) => q.id === currentQuestionId);

  const handleQuestionSelect = (questionIndex) => {
    if (questions[questionIndex])
      setCurrentQuestionId(questions[questionIndex].id);
  };

  const handlePrevious = () => {
    const currentIndex = getCurrentQuestionIndex();
    if (currentIndex > 0) setCurrentQuestionId(questions[currentIndex - 1].id);
  };

  const handleNext = () => {
    const currentIndex = getCurrentQuestionIndex();
    if (currentIndex < questions.length - 1)
      setCurrentQuestionId(questions[currentIndex + 1].id);
  };

  const handleFinishExam = ({
    isViolation = false,
    reason = "Terima kasih telah mengikuti ujian.",
  } = {}) => {
    if (isFinished) return;

    setIsFinished(true);
    setShowFinishDialog(false);

    if (sirenAudioRef.current) sirenAudioRef.current.pause();
    clearTimeout(tabSwitchTimeoutRef.current);
    if (document.fullscreenElement) document.exitFullscreen();

    let correct = 0;
    questions.forEach((q) => {
      if (answers[q.id] === q.correctAnswer) correct++;
    });
    const scorePercentage =
      questions.length > 0 ? Math.round((correct / questions.length) * 100) : 0;

    const resultData = {
      userId: user.id,
      userNip: user.nip,
      userName: user.fullName,
      answers,
      scoreCorrect: correct,
      scoreTotal: questions.length,
      scorePercentage,
      finishedDueToViolation: isViolation,
      passingGradePercentage: examSettings.passing_grade_percentage,
      passed: scorePercentage >= examSettings.passing_grade_percentage,
      submittedAt: new Date().toISOString(),
      examSettingsApplied: examSettings,
    };

    const allResults = JSON.parse(localStorage.getItem("examResults")) || [];
    localStorage.setItem(
      "examResults",
      JSON.stringify([...allResults, resultData])
    );
    localStorage.removeItem(`cbt-answers-${user.nip}`);

    showModalNotification({ title: "Ujian Selesai", description: reason });
  };

  const toggleSirenMute = () => setIsSirenMuted((prev) => !prev);

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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex flex-col items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="bg-white p-10 rounded-xl shadow-2xl text-center max-w-lg w-full"
        >
          <Trophy className="w-20 h-20 text-yellow-500 mx-auto mb-6" />
          <h1 className="text-3xl font-bold text-gray-800 mb-4">
            Ujian Telah Selesai!
          </h1>
          <p className="text-gray-600 mb-8">
            {notificationModal.description ||
              `Terima kasih, ${user.fullName}, telah menyelesaikan ujian.`}
          </p>
          <Button
            onClick={onLogout}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 text-lg"
          >
            Kembali ke Halaman Login
          </Button>
        </motion.div>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
        <h2 className="text-2xl font-semibold text-gray-700 mb-2">
          Belum Ada Soal
        </h2>
        <p className="text-gray-500">
          Saat ini belum ada soal yang tersedia. Silakan hubungi admin.
        </p>
        <Button onClick={onLogout} className="mt-6">
          Kembali ke Login
        </Button>
      </div>
    );
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

      {fullscreenWarning && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75">
          <div className="bg-white p-6 rounded-lg shadow-lg text-center max-w-sm w-full mx-4">
            <AlertTriangleIcon className="text-yellow-500 w-12 h-12 mx-auto mb-4" />
            <h2 className="text-lg font-semibold mb-2">
              Peringatan Keluar Fullscreen
            </h2>
            <p className="text-sm text-gray-600 mb-4">
              Anda telah keluar dari mode fullscreen. Ini adalah peringatan{" "}
              {fullscreenExitCount} dari 2.
            </p>
            <Button
              onClick={() => {
                enterFullscreen();
                setFullscreenWarning(false);
              }}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            >
              Kembali ke Mode Fullscreen
            </Button>
          </div>
        </div>
      )}

      {examSettings.detect_tab_switch && (
        <div className="fixed bottom-4 right-4 z-50">
          <Button
            onClick={toggleSirenMute}
            variant="outline"
            size="icon"
            className="bg-white/80 backdrop-blur-sm shadow-lg"
          >
            {isSirenMuted ? (
              <VolumeX className="h-5 w-5 text-red-500" />
            ) : (
              <Volume2 className="h-5 w-5 text-green-500" />
            )}
          </Button>
        </div>
      )}

      <div className="flex flex-col md:flex-row h-[calc(100vh-4rem)]">
        <div className="flex-1 p-4 md:p-6 overflow-y-auto">
          <div className="max-w-4xl mx-auto">
            <AnimatePresence mode="wait">
              {currentQuestionData && (
                <motion.div
                  key={currentQuestionId}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                >
                  <QuestionCard
                    question={currentQuestionData}
                    selectedAnswer={answers[currentQuestionId]}
                    onAnswerSelect={(answer) =>
                      handleAnswerSelect(currentQuestionId, answer)
                    }
                  />
                </motion.div>
              )}
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
        onConfirm={() => handleFinishExam()}
        answeredCount={Object.keys(answers).length}
        totalQuestions={questions.length}
      />

      {notificationModal.isOpen && !isFinished && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black bg-opacity-75">
          <div className="bg-white p-6 rounded-lg shadow-lg text-center max-w-sm w-full mx-4">
            <h2 className="text-xl font-bold mb-4">
              {notificationModal.title}
            </h2>
            <p className="mb-4">{notificationModal.description}</p>
            <Button
              onClick={() =>
                setNotificationModal({ ...notificationModal, isOpen: false })
              }
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            >
              Mengerti
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export default UserCBT;
