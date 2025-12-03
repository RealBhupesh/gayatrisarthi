import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { storageKey } from "@/utils";
import { apiUrl } from "@/utils/apiRoutes";
import axios from "axios";
import { motion } from "framer-motion";
import { AlertCircle, Check, Clock, Lightbulb, Trophy, X } from 'lucide-react';
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

//import MathRenderer from "@/components/MathEquation";

interface Question {
  qno: number;
  ques: string;
  options: string[];
  correct: string;
  hint?: string;
}

export default function Quiz() {
  const location = useLocation();
  const navigate = useNavigate();
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [showRefreshWarning, setShowRefreshWarning] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [quizData, setQuizData] = useState<any>(null);
  const [timer, setTimer] = useState(0);
  const [score, setScore] = useState(0);
  const [showSummary, setShowSummary] = useState(false);
  const [answers, setAnswers] = useState<string[]>([]);
  const [isAnswered, setIsAnswered] = useState<Boolean>(false);
  const [showHint, setShowHint] = useState<Boolean>(false);

  const { toast } = useToast();
  useEffect(() => {
    const state = location.state;
    if (!state?.quizData) {
      navigate("/dashboard");
      return;
    }
    // console.log(state.quizData);
    setQuizData(state.quizData);
  }, [location, navigate]);

  // Timer effect
  // Timer effect
  useEffect(() => {
    if (!showSummary && location.state.withTimer) {
      const interval = setInterval(() => {
        setTimer((prev) => prev + 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [showSummary, location.state.withTimer]);

  useEffect(() => {
    if (showSummary) {
      updateScore({
        quizData,
        timer,
        answers,
        setScore,
      });
    }
  }, [showSummary, quizData, timer, answers]);

  const evaluateScore = (
    correctAnswers: number,
    totalQuestions: number,
    elapsedTime: number,
    allowedTime: number
  ): number => {
    // Accuracy: Ratio of correct answers
    const accuracy = correctAnswers / totalQuestions;

    // Time efficiency: Ratio of allowed time versus elapsed time
    const timeEfficiency = Math.min(allowedTime / elapsedTime, 1); // Max 1

    // Weighted scoring
    const weightedScore = (accuracy * 0.7 + timeEfficiency * 0.3) * 5;

    // Cap the score at 5
    return Math.min(Math.max(weightedScore, 0), 5);

    // return correctAnswers;
  };

  const updateScore = async ({
    quizData,
    timer,
    answers,
    setScore,
  }: {
    quizData: any;
    timer: number;
    answers: string[];
    setScore: React.Dispatch<React.SetStateAction<number>>;
  }) => {
    const token = localStorage.getItem(storageKey); // Retrieve token from localStorage

    if (!token) {
      toast({
        variant: "destructive",
        title: "Authentication Required.",
        description: "You need to log in to record your score.",
      });
      return;
    }

    try {
      // Calculate correct answers
      const correctAnswers = answers.filter(
        (answer, index) =>
          answer === quizData.questionsData.questions[index].correct
      ).length;

      // Calculate weighted score out of 5
      // const weightedScore = evaluateScore(
      //   correctAnswers,
      //   quizData.questionsData.numberOfQues,
      //   timer,
      //   quizData.totalTime
      // );

      const weightedScore = correctAnswers;
      // Record the quiz attempt
      // const attemptResponse = await axios.post(
      //   `${host}/api/history/attempt`,
      //   {
      //     quizId: quizData.quizId, // From state or props
      //     timeTaken: timer, // Total time taken
      //   },
      //   {
      //     headers: {
      //       Authorization: `Bearer ${token}`,
      //     },
      //   }
      // );

      // if (!attemptResponse.data.success) {
      //   throw new Error(
      //     attemptResponse.data.message || "Failed to record quiz attempt."
      //   );
      // }

      // Update the user's score
      const scoreUpdateResponse = await axios.put(
        `${apiUrl}/api/userscore/update`,
        {
          updateBy: weightedScore,
          subject: quizData.subject,
          quizId: quizData.quizId,
          timeTaken: quizData.totalTime,
          questionData: { numberOfQues: quizData.questionsData.numberOfQues },
        }, // Pass the calculated weighted score
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (scoreUpdateResponse.data.success) {
        toast({
          variant: "default",
          title: "Score Updated.",
          description: `Your score has been updated successfully!`,
        });
      } else {
        throw new Error(
          scoreUpdateResponse.data.message || "Failed to update score."
        );
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error("Error response:", error.response?.data);
        toast({
          variant: "destructive",
          title: "Something went wrong.",
          description: error.response?.data?.message,
        });
      } else {
        console.error("Unexpected error:", error);
        toast({
          variant: "destructive",
          title: "An unexpected error occurred.",
          description: "Please try again later.",
        });
      }
    }
  };
  // Format time function
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
      setShowRefreshWarning(true);
      return "";
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, []);

  const handleOptionSelect = (option: string) => {
    setSelectedOption(option);
    setIsAnswered(true);
  };

  const handleNext = () => {
    if (!quizData || !selectedOption) return;

    setIsAnswered(false);
    setShowHint(false);
    setAnswers((prev) => [...prev, selectedOption]);

    if (selectedOption === quizData.questionsData.questions[currentQuestionIndex].correct) {
      setScore((prev) => prev + 1);
    }

    if (currentQuestionIndex < quizData.questionsData.questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
      setSelectedOption(null);
    } else {
      setShowSummary(true);
    }
  };

  const navigateTo = (path: string) => {
    navigate(path);
  };

  if (!quizData) return null;

  const currentQuestion =
    quizData.questionsData.questions[currentQuestionIndex];

  if (showSummary) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="container mx-auto p-6 max-w-3xl"
      >
        <Card className="shadow-lg w-full max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="text-xl sm:text-2xl flex items-center gap-2 justify-center sm:justify-start">
              <Trophy className="h-5 w-5 sm:h-6 sm:w-6 text-yellow-500" />
              Quiz Complete!
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 p-4 sm:p-6">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2 }}
              className="text-center p-4 sm:p-6"
            >
              <div className="text-3xl sm:text-4xl font-bold mb-2">
                {score}/{quizData.questionsData.questions.length}
              </div>
              <div className="text-lg sm:text-xl text-muted-foreground">
                Time Taken: {formatTime(timer)}
              </div>
            </motion.div>

            <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4">
              <Button
                className="w-full sm:w-auto"
                onClick={() => navigate(`/leaderboard/${quizData.quizId}`, {
                  state: {
                    quizData: location.state.quizData
                  },
                })}
              >
                View Leaderboard
              </Button>
              <Button
                className="w-full sm:w-auto"
                onClick={() => navigateTo("/dashboard")}
                variant="outline"
              >
                Back to Dashboard
              </Button>
              <Button
                className="w-full sm:w-auto"
                onClick={() => {
                  const { dismiss } = toast({
                    title: "Are you sure you want to reattempt?",
                    description: "This will reset all your progress.",
                    action: (
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => {
                          setCurrentQuestionIndex(0);
                          setSelectedOption(null);
                          setShowSummary(false);
                          setScore(0);
                          setAnswers([]);
                          setTimer(0);
                          setIsAnswered(false);
                          setShowHint(false);
                          dismiss();
                        }}
                      >
                        Reattempt
                      </Button>
                    ),
                  });
                }}
                variant="outline"
              >
                Reattempt Quiz
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-3xl">
      <div className="fixed top-4 right-4 z-10 flex items-center space-x-2">
        {location.state.withTimer && (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
            <Clock className="w-4 h-4 mr-1" />
            {formatTime(timer)}
          </span>
        )}
        <Button
          onClick={() => {
            const { dismiss } = toast({
              title: "Are you sure you want to end the quiz?",
              description: "This will submit your current progress.",
              action: (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => {
                    if (selectedOption) {
                      setAnswers((prev) => [...prev, selectedOption]);
                      if (selectedOption === quizData.questionsData.questions[currentQuestionIndex].correct) {
                        setScore((prev) => prev + 1);
                      }
                    }
                    setShowSummary(true);
                    dismiss();
                  }}
                >
                  End Quiz
                </Button>
              ),
            });
          }}
          variant="destructive"
        >
          End Quiz
        </Button>
      </div>

      <Card className="shadow-lg mt-10 w-full max-w-2xl mx-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-2xl">{quizData.quizTitle}</CardTitle>
          <div className="text-sm text-gray-500">
            Question {currentQuestionIndex + 1} of{" "}
            {quizData.questionsData.questions.length}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <h2 className="text-lg">
            <Card className="p-3">
              <CardContent>
                {currentQuestion.ques}
              </CardContent>
            </Card>
          </h2>
          <div className="grid gap-2">
            {currentQuestion.options.map((option: string, index: number) => {
              let buttonClass =
                "w-full justify-start text-left h-auto py-4 px-6 disabled:opacity-80";

              if (isAnswered && selectedOption === option) {
                if (option === currentQuestion.correct) {
                  buttonClass += " bg-green-500 text-white";
                } else {
                  buttonClass += " bg-red-500 text-white";
                }
              }

              return (
                <Button
                  key={index}
                  variant={"outline"}
                  className={buttonClass}
                  onClick={() => handleOptionSelect(option)}
                  disabled={isAnswered ? true : false}
                >
                  <span className="mr-2">
                    {String.fromCharCode(65 + index)}.
                  </span>
                  <span className="flex-1">{option}</span>
                  {isAnswered && selectedOption === option && option === currentQuestion.correct && (
                    <Check className="ml-2 h-5 w-5 text-white" />
                  )}
                  {isAnswered && selectedOption === option && option !== currentQuestion.correct && (
                    <X className="ml-2 h-5 w-5 text-white" />
                  )}
                </Button>
              );
            })}
          </div>
          <div>
            {showHint ? (
              <div className="">
                <strong>Hint: </strong>
                <Card className="mt-2">
                  <CardContent className="p-3 text-muted-foreground">
                    {currentQuestion.hint}
                  </CardContent>
                </Card>
              </div>
            ) : null}
          </div>
          <Card className="mt-4">
            <CardContent className="p-4 flex justify-end gap-2 items-center">
              {currentQuestion.hint ? (
                showHint ? null : (
                  <Button
                    variant="outline"
                    onClick={() => setShowHint(true)}
                    className="flex items-center gap-2"
                  >
                    Show Hint
                    <Lightbulb className="h-5 w-5 text-yellow-500" />
                  </Button>
                )
              ) : null}

              {(currentQuestionIndex != quizData.questionsData.questions.length - 1) && (
                <Button onClick={handleNext} disabled={!selectedOption}>
                  Next Question
                </Button>
              )}
              {(currentQuestionIndex === quizData.questionsData.questions.length - 1) && (
                <Button onClick={handleNext} disabled={!selectedOption}>
                  Finish Quiz
                </Button>
              )}
            </CardContent>
          </Card>

          {showRefreshWarning && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Warning</AlertTitle>
              <AlertDescription>
                Refreshing the page will reset your quiz progress.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      <AlertDialog
        open={showRefreshWarning}
        onOpenChange={setShowRefreshWarning}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to leave?</AlertDialogTitle>
            <AlertDialogDescription>
              Your quiz progress will be lost if you refresh or leave this page.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setShowRefreshWarning(false)}>
              Continue Quiz
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

