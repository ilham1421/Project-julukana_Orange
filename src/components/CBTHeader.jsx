
import React from 'react';
import { Clock, User, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

const CBTHeader = ({ timeLeft, currentQuestion, totalQuestions, participantName, onLogout }) => {
  const formatTime = (seconds) => {
    const h = Math.floor(seconds / 3600).toString().padStart(2, '0');
    const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${h}:${m}:${s}`;
  };

  const progressPercentage = totalQuestions > 0 ? (currentQuestion / totalQuestions) * 100 : 0;
  const logoUrl = "https://storage.googleapis.com/hostinger-horizons-assets-prod/011c2c6d-27ef-4f8d-9fed-8b3e9faf55e0/8ffe6ebc4a34f0f2bae8a9f061210870.png";

  return (
    <motion.header 
      initial={{ y: -60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 100, duration: 0.5 }}
      className="bg-gradient-to-r from-yellow-500 via-amber-500 to-orange-600 text-white p-4 shadow-lg flex flex-col md:flex-row justify-between items-center sticky top-0 z-10 h-auto md:h-16"
    >
      {/* Left Section - Logo & Title */}
      <div className="flex items-center mb-2 md:mb-0">
        <img 
          src={logoUrl} 
          alt="Logo CAT JULUKANA" 
          className="w-10 h-10 mr-3 rounded-full"
        />
        <h1 className="text-xl font-bold tracking-tight">CAT JULUKANA</h1>
      </div>

      {/* Center Section - Timer & Progress */}
      <div className="flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-6 mb-2 md:mb-0">
        <div className={`flex items-center px-3 py-1 rounded-full ${timeLeft < 300 ? 'bg-red-600 timer-warning' : 'bg-black/30'}`}>
          <Clock className="w-5 h-5 mr-2" />
          <span className="text-sm font-medium">Sisa Waktu: {formatTime(timeLeft)}</span>
        </div>
        <div className="text-sm font-medium">
          Soal: {currentQuestion} / {totalQuestions}
        </div>
      </div>
      
      {/* Right Section - Participant Info & Logout */}
      <div className="flex items-center">
        <div className="flex items-center mr-4">
          <User className="w-5 h-5 mr-2 text-yellow-200" />
          <span className="text-sm font-medium">{participantName}</span>
        </div>
        {onLogout && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onLogout}
            className="text-white hover:bg-white/20"
          >
            <LogOut className="w-4 h-4 mr-1" /> Logout
          </Button>
        )}
      </div>

       {/* Progress Bar - Full width at bottom of header */}
       {totalQuestions > 0 && (
        <div className="w-full absolute bottom-0 left-0 h-1 bg-orange-400">
            <motion.div 
            className="h-1 bg-yellow-300"
            initial={{ width: 0 }}
            animate={{ width: `${progressPercentage}%`}}
            transition={{ duration: 0.5 }}
            />
        </div>
       )}
    </motion.header>
  );
};

export default CBTHeader;
