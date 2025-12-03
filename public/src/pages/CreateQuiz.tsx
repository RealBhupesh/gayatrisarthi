import Navbar from "@/components/Navbar";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { preparingForOptions, storageKey, streams, subjects } from "@/utils";
import { apiUrl } from "@/utils/apiRoutes";
import axios from "axios";
import { Loader2, Sparkles, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { useNavigate } from "react-router-dom";

const CreateQuiz = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [prepExam, setPrepExam] = useState("");
  const [subject, setSubject] = useState("");
  const [noOfQuestions, setNoOfQuestions] = useState("10");
  const [questions, setQuestions] = useState([
    {
      qno: 1,
      ques: "",
      options: ["option1", "option2", "option3", "option4"],
      correct: "option1",
      hint: "",
    },
  ]);
  const [quizData, setQuizData] = useState<any>({
    title: "",
    timeInMinutes: 0,
    subject: "",
    quizDescription: "",
    selectedStreams: [], // Array to hold multiple selections
  });
  const [updateQuiz, setUpdateQuiz] = useState(false);
  const location = useLocation();
  const data = location.state;
  useEffect(() => {
    if (!data) return;
    setUpdateQuiz(true);
    // console.log(data);
    setQuestions(data.questionsData.questions);
    setQuizData({
      title: data.quizTitle,
      timeInMinutes: data.totalTime,
      subject: data.subject,
      selectedStreams: data.forStreams,
      quizDescription: data.quizDescription,
    });
    // console.log(data.subject);
    setSubject(data.subject);
  }, [data]);

  const allStreamOptions = [...streams, ...preparingForOptions];

  const isFormValid = () => {
    return (
      quizData.title &&
      quizData.timeInMinutes > 0 &&
      quizData.subject &&
      quizData.quizDescription &&
      quizData.selectedStreams.length > 0
    );
  };

  // useEffect(() => {
  //   console.log(questions);
  // }, [questions]);
  const validateQuiz = () => {
    const validQuestions = questions
      .filter((q) => q.ques)
      .map((q, index) => ({
        ...q,
        qno: index + 1,
      }));
    setQuestions(validQuestions);
    return validQuestions;
  };

  const generateQuestions = async () => {
    if (!prepExam || !subject || !noOfQuestions) {
      toast({
        variant: "destructive",
        title: "Missing Information",
        description: "Please enter exam type, number of questions and subject.",
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await axios.post(
        `${apiUrl}/api/quiz/generate`,
        {
          prepExam,
          noOfQuestions,
          subject,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem(storageKey)}`,
          },
        }
      );

      if (response.data.success) {
        let serialNumber = questions.length;
        console.log(response.data);
        const generatedQuestions =
          response.data.quiz.questionsData.questions.map(
            (q: any, index: number) => ({
              qno: ++serialNumber,
              ques: q.ques,
              options: q.options,
              correct: q.correct,
              hint: q.hint || "",
            })
          );

        setQuestions([...questions, ...generatedQuestions]);
        toast({
          title: "Success",
          description: "Quiz questions generated successfully",
        });
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        toast({
          variant: "destructive",
          title: "Generation Failed",
          description: error.response?.data?.message,
        });
      } else {
        toast({
          variant: "destructive",
          title: "Unexpected Error",
          description: "Please try again later",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuestionChange = (
    questionIndex: number,
    field: string,
    value: string,
    optionIndex?: number
  ) => {
    const updatedQuestions = [...questions];

    if (field === "options" && optionIndex !== undefined) {
      // Handle option changes
      updatedQuestions[questionIndex].options = [
        ...updatedQuestions[questionIndex].options,
      ];
      updatedQuestions[questionIndex].options[optionIndex] = value;
    } else {
      // Handle other field changes
      updatedQuestions[questionIndex] = {
        ...updatedQuestions[questionIndex],
        [field]: value,
      };
    }

    setQuestions(updatedQuestions);
  };
  const handleStreamSelect = (value: any) => {
    setQuizData({
      ...quizData,
      selectedStreams: quizData.selectedStreams.includes(value)
        ? quizData.selectedStreams
        : [...quizData.selectedStreams, value],
    });
  };

  const removeStream = (streamToRemove: any) => {
    setQuizData((prev: any) => ({
      ...prev,
      selectedStreams: prev.selectedStreams.filter(
        (stream: any) => stream !== streamToRemove
      ),
    }));
  };

  const addNewQuestion = () => {
    setQuestions([
      ...questions,
      {
        qno: questions.length + 1,
        ques: "",
        options: ["option1", "option2", "option3", "option4"],
        correct: "option1",
        hint: "",
      },
    ]);
  };

  const deleteQuestion = (indexToDelete: number) => {
    const updatedQuestions = questions
      .filter((_, index) => index !== indexToDelete)
      .map((q, index) => ({
        ...q,
        qno: index + 1,
      }));
    setQuestions(updatedQuestions);
  };

  const handleInputChange = (field: any, value: any) => {
    setQuizData((prev: any) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSaveQuiz = async () => {
    setSaveLoading(true);
    let validQuestions = validateQuiz();
    // if (questions.length < 5) {
    //   setSaveLoading(false);
    //   return toast({
    //     variant: "destructive",
    //     title: "Minimum questions required.",
    //     description: "Add more questions",
    //   });
    // }

    try {
      const token = localStorage.getItem(storageKey); // Assuming token is stored in localStorage

      const quiz = {
        quizTitle: quizData.title, // Replace with your form state
        tags: [...quizData.selectedStreams, quizData.subject],
        totalTime: quizData.timeInMinutes,
        subject: quizData.subject,
        forStreams: quizData.selectedStreams,
        quizDescription: quizData.quizDescription,
        questionsData: {
          questions: validQuestions,
        },
      };

      const response = await axios.post(`${apiUrl}/api/quiz/create`, quiz, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.data.success) {
        setQuestions([
          {
            qno: 1,
            ques: "",
            options: ["option1", "option2", "option3", "option4"],
            correct: "option1",
            hint: "",
          },
        ]);
        navigate("/dashboard", {
          state: {
            toast: {
              title: "Success",
              description: "Quiz saved successfully!",
              variant: "default",
            },
          },
        });
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error("Error response:", error.response?.data);
        toast({
          variant: "destructive",
          title: "Something went wrong",
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
    } finally {
      setSaveLoading(false);
    }
  };
  //update quiz currenlty holds validation for empty string for quiz questions
  const handleUpdateQuiz = async () => {
    let validQuestions = validateQuiz();
    setSaveLoading(true);
    try {
      const token = localStorage.getItem(storageKey); // Assuming token is stored in localStorage

      const quiz = {
        title: quizData.title, // Replace with your form state
        quizDescription: quizData.quizDescription,
        tags: [...quizData.selectedStreams, quizData.subject],
        timeInMinutes: quizData.timeInMinutes,
        subject: quizData.subject,
        selectedStreams: quizData.selectedStreams,
        questionsData: {
          questions: validQuestions,
        },
      };
      console.log(quiz);

      const response = await axios.put(
        `${apiUrl}/api/quiz/${data.quizId}`,
        quiz,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.success) {
        setQuestions([
          {
            qno: 1,
            ques: "",
            options: ["option1", "option2", "option3", "option4"],
            correct: "option1",
            hint: "",
          },
        ]);
        toast({
          title: "Success",
          description: "Quiz updated successfully!",
          variant: "default",
        });
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error("Error response:", error.response?.data);
        toast({
          variant: "destructive",
          title: "Something went wrong",
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
    } finally {
      setSaveLoading(false);
    }
  };

  useEffect(() => {
    if (!data) {
      //dont run in edit , only in save
      setQuizData({ ...quizData, subject: subject });
      if (prepExam) {
        setQuizData({ ...quizData, selectedStreams: [prepExam] });
      }
    }
  }, [subject, prepExam]);

  return (
    <div className="container mx-auto p-4 space-y-4">
      <Navbar></Navbar>
      <div className="flex flex-wrap justify-between items-center align-middle gap-2">
        <h1 className="text-xl font-bold">Create Quiz</h1>
        <div className="flex gap-2">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="secondary" disabled={isLoading} className="w-32">
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Loading
                  </>
                ) : (
                  <>
                    Generate
                    <Sparkles />
                  </>
                )}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Generate Quiz Questions</AlertDialogTitle>
                <AlertDialogDescription>
                  Please select the exam type and subject to generate questions.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="examType">Exam Type</Label>
                  <Select value={prepExam} onValueChange={setPrepExam}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select Exam Type" />
                    </SelectTrigger>
                    <SelectContent>
                      {preparingForOptions.map((index: any) => (
                        <SelectItem key={index} value={index}>
                          {index}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {data?.forStreams?.map((stream: any) => (
                  <Badge
                    key={stream}
                    variant="secondary"
                    className="px-2 py-1 mr-1"
                  >
                    {stream}
                  </Badge>
                ))}

                {/*  Number of questions to be generated *commenting out for now*
                <div className="space-y-2">
                  <Label htmlFor="noOfQuestions">Number of questions</Label>
                  <div className="flex flex-wrap gap-2">
                    <Select value={noOfQuestions} onValueChange={setNoOfQuestions}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select Number of Questions" />
                      </SelectTrigger>
                      <SelectContent>
                        {['10', '20', '30'].map((string) => (
                          <SelectItem key={string} value={string} defaultValue={10}>
                          {string}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div> */}

                <div className="space-y-2">
                  <Label htmlFor="subject">Subject</Label>
                  <div className="flex flex-wrap gap-2">
                    {/* <Select value={subject} onValueChange={setSubject}>
                    <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select Subject" />
                    </SelectTrigger>
                    <SelectContent>
                    {subjects.map((index: any) => (
                      <SelectItem key={index} value={index}>
                      {index}
                      </SelectItem>
                    ))}
                    </SelectContent>
                  </Select> */}
                    <Input
                      placeholder="Enter Subject or Chapter here"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={generateQuestions}
                  disabled={isLoading || !prepExam || !subject}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    "Generate"
                  )}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          {updateQuiz ? (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button className="w-32" disabled={saveLoading}>
                  {saveLoading ? "Updating..." : "Update Quiz"}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
                <AlertDialogHeader>
                  <AlertDialogTitle>Quiz Setup</AlertDialogTitle>
                  <AlertDialogDescription>
                    Please confirm if you want to edit the quiz.
                  </AlertDialogDescription>
                </AlertDialogHeader>

                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Quiz Title</Label>
                    <Input
                      id="title"
                      value={quizData.title}
                      onChange={(e) =>
                        handleInputChange("title", e.target.value)
                      }
                      placeholder="Enter quiz title"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="quizDescription">Quiz Description</Label>
                    <Textarea
                      id="quizDescription"
                      value={quizData.quizDescription}
                      onChange={(e) =>
                        handleInputChange("quizDescription", e.target.value)
                      }
                      placeholder="Enter quiz description"
                      rows={4}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="time">Time (minutes)</Label>
                    <Input
                      id="time"
                      type="number"
                      min="1"
                      value={quizData.timeInMinutes}
                      onChange={(e) =>
                        handleInputChange(
                          "timeInMinutes",
                          parseInt(e.target.value)
                        )
                      }
                      placeholder="Enter time in minutes"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="subject">Subject</Label>
                    <Input
                      id="subject"
                      value={quizData.subject}
                      onChange={(e) =>
                        handleInputChange("subject", e.target.value)
                      }
                      placeholder="Enter subject or chapter here"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="stream">Streams/Exam Types</Label>
                    <Select value="" onValueChange={handleStreamSelect}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select Streams/Exam Types" />
                      </SelectTrigger>
                      <SelectContent>
                        {allStreamOptions.map((stream) => (
                          <SelectItem
                            key={stream}
                            value={stream}
                            disabled={quizData.selectedStreams.includes(stream)}
                          >
                            {stream}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    {/* Display selected streams as badges */}
                    <div className="flex flex-wrap gap-2 mt-2">
                      {quizData.selectedStreams.map((stream: any) => (
                        <Badge
                          key={stream}
                          variant="secondary"
                          className="px-2 py-1"
                        >
                          {stream}
                          <button
                            className="ml-1 hover:text-destructive"
                            onClick={() => removeStream(stream)}
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>

                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleUpdateQuiz}
                    disabled={isLoading || !isFormValid()}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Updating...
                      </>
                    ) : (
                      "Update"
                    )}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          ) : (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button className="w-32" disabled={saveLoading}>
                  {saveLoading ? "Saving..." : "Save Quiz"}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
                <AlertDialogHeader>
                  <AlertDialogTitle>Quiz Setup</AlertDialogTitle>
                  <AlertDialogDescription>
                    Please fill in the quiz details below.
                  </AlertDialogDescription>
                </AlertDialogHeader>

                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Quiz Title</Label>
                    <Input
                      id="title"
                      value={quizData.title}
                      onChange={(e) =>
                        handleInputChange("title", e.target.value)
                      }
                      placeholder="Enter quiz title"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="quizDescription">Quiz Description</Label>
                    <Textarea
                      id="quizDescription"
                      value={quizData.quizDescription}
                      onChange={(e) =>
                        handleInputChange("quizDescription", e.target.value)
                      }
                      placeholder="Enter quiz description"
                      rows={4}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="time">Time (minutes)</Label>
                    <Input
                      id="time"
                      type="number"
                      min="1"
                      value={quizData.timeInMinutes}
                      onChange={(e) =>
                        handleInputChange(
                          "timeInMinutes",
                          parseInt(e.target.value)
                        )
                      }
                      placeholder="Enter time in minutes"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="subject">Subject</Label>
                    <Input
                      id="subject"
                      value={quizData.subject}
                      onChange={(e) =>
                        handleInputChange("subject", e.target.value)
                      }
                      placeholder="Enter subject or chapter here"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="stream">Streams/Exam Types</Label>
                    <Select value="" onValueChange={handleStreamSelect}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select Streams/Exam Types" />
                      </SelectTrigger>
                      <SelectContent>
                        {allStreamOptions.map((stream) => (
                          <SelectItem
                            key={stream}
                            value={stream}
                            disabled={quizData.selectedStreams.includes(stream)}
                          >
                            {stream}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    {/* Display selected streams as badges */}
                    <div className="flex flex-wrap gap-2 mt-2">
                      {quizData.selectedStreams.map((stream: any) => (
                        <Badge
                          key={stream}
                          variant="secondary"
                          className="px-2 py-1"
                        >
                          {stream}
                          <button
                            className="ml-1 hover:text-destructive"
                            onClick={() => removeStream(stream)}
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>

                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleSaveQuiz}
                    disabled={isLoading || !isFormValid()}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      "Save"
                    )}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      </div>
      <div className="max-w-3xl m-auto flex flex-col gap-4">
        {questions.map((question, index) => (
          <Card key={index} className="max-w-3xl relative">
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-2 top-2 hover:bg-red-100 text-red-500 hover:text-red-600"
              onClick={() => deleteQuestion(index)}
            >
              <X className="h-5 w-5" />
            </Button>

            <CardHeader>
              <CardTitle>Question {question.qno}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor={`question-${index}`}>Question</Label>
                <Textarea
                  id={`question-${index}`}
                  value={question.ques}
                  onChange={(e) =>
                    handleQuestionChange(index, "ques", e.target.value)
                  }
                  placeholder="Enter your question"
                  className="min-h-[100px]"
                />
                {/* Rendered question */}
                {/*{question.ques && (
                  <div className="bg-muted/50 p-4 rounded-md">
                    <MathRenderer equation={question.ques} />
                  </div>
                )}*/}
              </div>

              <div className="space-y-2">
                <Label>Options</Label>
                <RadioGroup
                  value={question.correct}
                  onValueChange={(value) =>
                    handleQuestionChange(index, "correct", value)
                  }
                  className="space-y-4"
                >
                  {question.options.map((option, optionIndex) => (
                    <div
                      key={optionIndex}
                      className="flex items-start space-x-2 border rounded-lg p-3"
                    >
                      <RadioGroupItem
                        value={option}
                        id={`option-${index}-${optionIndex}`}
                        className="mt-1"
                      />
                      <div className="flex-1 space-y-2">
                        <Input
                          value={option}
                          onChange={(e) =>
                            handleQuestionChange(
                              index,
                              "options",
                              e.target.value,
                              optionIndex
                            )
                          }
                          placeholder={`Option ${
                            optionIndex + 1
                          } (Use Proper Spacing for Questions)`}
                        />
                        {/* Rendered option */}
                        {/*{option && (
                          <div className="text-sm text-muted-foreground pl-2">
                            <MathRenderer equation={option} />
                          </div>
                        )}*/}
                      </div>
                    </div>
                  ))}
                </RadioGroup>
              </div>

              <div className="space-y-2">
                <Label htmlFor={`hint-${index}`}>Hint (Optional)</Label>
                <Input
                  id={`hint-${index}`}
                  value={question.hint}
                  onChange={(e) =>
                    handleQuestionChange(index, "hint", e.target.value)
                  }
                  placeholder="Enter a hint for the question"
                />
                {/* Rendered hint */}
                {/* {question.hint && (
                  <div className="text-sm text-muted-foreground pl-2">
                    <MathRenderer equation={question.hint} />
                  </div>
               )}*/}
              </div>
            </CardContent>
          </Card>
        ))}
        <div className="flex justify-start">
          <Button onClick={addNewQuestion} variant="outline">
            Add Question
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CreateQuiz;
