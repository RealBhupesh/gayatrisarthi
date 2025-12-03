import React from 'react';
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Clock, Timer } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Define the props interface
interface Quiz {
  quizId: string;
  quizTitle: string;
  subject: string;
  tags: string[];
  questionsData: {
    numberOfQues: number;
    questions: any[];
  };
}

interface QuizStartDialogProps {
  quiz: Quiz;
  onStart: (withTimer: boolean) => void;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

const QuizStartDialog = ({ quiz, onStart, isOpen, onOpenChange }: QuizStartDialogProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Start Quiz: {quiz.quizTitle}</DialogTitle>
          <DialogDescription>
            Choose how you want to take this quiz
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid grid-cols-2 gap-4 pt-4">
          {/* Timed Quiz Option */}
          <Card 
            className="cursor-pointer hover:border-primary transition-colors"
            onClick={() => onStart(true)}
          >
            <CardHeader className="text-center pb-2">
              <Clock className="w-8 h-8 mx-auto mb-2" />
              <CardTitle className="text-lg">Timed Quiz</CardTitle>
            </CardHeader>
            <CardContent className="text-center text-sm text-muted-foreground">
              Challenge yourself with a timer
            </CardContent>
          </Card>

          {/* Untimed Quiz Option */}
          <Card 
            className="cursor-pointer hover:border-primary transition-colors"
            onClick={() => onStart(false)}
          >
            <CardHeader className="text-center pb-2">
              <Timer className="w-8 h-8 mx-auto mb-2" />
              <CardTitle className="text-lg">Practice Mode</CardTitle>
            </CardHeader>
            <CardContent className="text-center text-sm text-muted-foreground">
              Take your time to learn
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default QuizStartDialog;