import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { CheckCircle2, Circle } from 'lucide-react';

const QuestionCard = ({ question, selectedAnswer, onAnswerSelect }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="question-card border-0 shadow-xl">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 border-b">
          <CardTitle className="text-lg font-semibold text-gray-800">
            Soal No. {question.id}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-8">
          {/* Pertanyaan */}
          <div className="mb-8">
            <p className="text-lg leading-relaxed text-gray-800 font-medium">
              {question.text}
            </p>
          </div>

          {/* Pilihan Jawaban */}
          <div className="space-y-4">
            {question.options.map((option, index) => {
              const optionLetter = String.fromCharCode(65 + index); // A, B, C, D
              const isSelected = selectedAnswer === optionLetter;
              
              return (
                <motion.div
                  key={index}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button
                    variant="ghost"
                    className={`w-full p-6 h-auto text-left justify-start option-hover ${
                      isSelected 
                        ? 'bg-blue-100 border-2 border-blue-500 text-blue-900' 
                        : 'bg-gray-50 border-2 border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => onAnswerSelect(optionLetter)}
                  >
                    <div className="flex items-center space-x-4 w-full">
                      <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${
                        isSelected 
                          ? 'bg-blue-500 border-blue-500' 
                          : 'border-gray-400'
                      }`}>
                        {isSelected ? (
                          <CheckCircle2 className="w-5 h-5 text-white" />
                        ) : (
                          <span className="text-sm font-bold text-gray-600">{optionLetter}</span>
                        )}
                      </div>
                      <span className={`text-base ${isSelected ? 'font-semibold' : 'font-medium'}`}>
                        {option}
                      </span>
                    </div>
                  </Button>
                </motion.div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default QuestionCard;