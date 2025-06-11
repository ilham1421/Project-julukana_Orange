import React from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ChevronLeft, ChevronRight, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';

const NavigationSidebar = ({ currentQuestionIndex, questions, answers, onQuestionSelect, onPrevious, onNext, onFinish }) => {
  const totalQuestions = questions.length;
  const progressPercentage = totalQuestions > 0 ? (Object.keys(answers).length / totalQuestions) * 100 : 0;

  return (
    <motion.aside 
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      transition={{ type: 'spring', stiffness: 100, duration: 0.5 }}
      className="w-full md:w-80 bg-gradient-to-br from-slate-50 to-gray-100 p-6 border-l border-gray-200 shadow-lg flex flex-col"
    >
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-sm font-semibold text-gray-700">Progres Ujian</h3>
          <span className="text-xs font-medium text-blue-600">{Object.keys(answers).length} / {totalQuestions} Soal</span>
        </div>
        <Progress value={progressPercentage} className="w-full h-2 progress-bar" indicatorClassName="bg-gradient-to-r from-sky-500 to-indigo-500" />
      </div>

      <div className="flex-1 overflow-y-auto mb-6 pr-2 -mr-2 custom-scrollbar">
        <div className="grid grid-cols-5 gap-2">
          {questions.map((question, index) => (
            <motion.div key={question.id} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
              <Button
                variant="outline"
                size="icon"
                className={`w-full h-10 rounded-md transition-all duration-200
                  ${currentQuestionIndex === index ? 'bg-blue-600 text-white border-blue-700 ring-2 ring-blue-400' : 
                    answers[question.id] ? 'bg-green-100 border-green-400 text-green-800 hover:bg-green-200' : 
                    'bg-white border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400'
                  }`}
                onClick={() => onQuestionSelect(index)}
              >
                {index + 1}
              </Button>
            </motion.div>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex space-x-3">
          <Button 
            onClick={onPrevious} 
            disabled={currentQuestionIndex === 0}
            variant="outline"
            className="flex-1 border-gray-300 hover:bg-gray-100"
          >
            <ChevronLeft className="w-5 h-5 mr-1" /> Kembali
          </Button>
          <Button 
            onClick={onNext} 
            disabled={currentQuestionIndex === totalQuestions - 1}
            variant="outline"
            className="flex-1 border-gray-300 hover:bg-gray-100"
          >
            Selanjutnya <ChevronRight className="w-5 h-5 ml-1" />
          </Button>
        </div>
        <Button 
          onClick={onFinish}
          className="w-full bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white py-3 text-base"
        >
          <AlertTriangle className="w-5 h-5 mr-2" /> Selesaikan Ujian
        </Button>
      </div>
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #cbd5e1; /* Tailwind gray-400 */
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #94a3b8; /* Tailwind gray-500 */
        }
      `}</style>
    </motion.aside>
  );
};

export default NavigationSidebar;