import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, BookOpen } from "lucide-react";
import NavMain from "../components/NavMain";
import { useToast } from "@/hooks/use-toast";
import { apiUrl } from "@/utils/apiRoutes";
import { storageKey } from "@/utils";

interface Quiz {
  _id: string;
  quizId: string;
  quizTitle: string;
  quizDescription: string;  
  totalTime: number;
  subject: string;
  // other fields are omitted for brevity
}

interface SubjectCategory {
  subject: string;
  quizzes: Quiz[];
}

interface ExamCategory {
  exam: string;
  subjects: SubjectCategory[];
}

interface UserData {
  id: string;
  fullName: string;
  email: string;
  role?: string;
}

// Quiz card component
const QuizCard: React.FC<{ quiz: Quiz; onStart: (quiz: Quiz) => void }> = ({ quiz, onStart }) => (
  <Card className="hover:shadow-lg transition-shadow border-primary/20 border rounded-lg flex flex-col justify-between">
    <CardHeader className="pb-2">
      <CardTitle className="text-lg flex items-center gap-2">
        <BookOpen className="h-5 w-5 text-primary" />
        {quiz.quizTitle}
      </CardTitle>
    </CardHeader>
    <CardContent className="space-y-2 pb-4">
      <p className="text-sm text-muted-foreground line-clamp-3">
        {quiz.quizDescription}
      </p>
      <div className="flex gap-2 flex-wrap">
        <Badge variant="secondary">
          {quiz.totalTime} min
        </Badge>
        <Badge variant="secondary">
          {quiz.subject}
        </Badge>
      </div>
      <Button onClick={() => onStart(quiz)} className="w-full mt-2">
        Start Quiz
      </Button>
    </CardContent>
  </Card>
);

const QuizCategoriesPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [categories, setCategories] = useState<ExamCategory[]>([]);
  const [loading, setLoading] = useState(false);
  const [userData, setUserData] = useState<UserData | null>(null);

  const token = localStorage.getItem(storageKey);

  // Fetch user data (optional, for NavMain)
  const fetchUserData = async () => {
    if (!token) return;
    try {
      const response = await axios.get(`${apiUrl}/api/userProfile/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.data.success) {
        setUserData(response.data.data);
      }
    } catch (error) {
      // ignore silently
    }
  };

  // Fetch quizzes grouped by category
  const fetchCategories = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${apiUrl}/api/quiz/all`);
      if (response.data.success) {
        setCategories(response.data.data);
      } else {
        throw new Error(response.data.message);
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error fetching quizzes",
        description: "Please try again later.",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserData();
    fetchCategories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleQuizStart = (quiz: Quiz) => {
    navigate("/quiz", {
      state: {
        quizData: quiz,
        subjectName: quiz.subject,
        withTimer: true,
      },
    });
  };

  const handleLogout = () => {
    localStorage.removeItem(storageKey);
    localStorage.removeItem("photoUrlChhatraKey");
    navigate("/");
  };

  return (
    <div className="min-h-screen p-6 max-w-7xl mx-auto space-y-6 bg-background">
      {/* Navigation */}
      <NavMain
        userData={userData}
        handleLogout={handleLogout}
        handleMenuClick={(path) => navigate(path)}
      />

      <h2 className="text-3xl font-bold">
        Quiz Categories
      </h2>

      {loading && (
        <div className="flex justify-center items-center py-10">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      )}

      {!loading && categories.length === 0 && (
        <p className="text-center text-sm text-muted-foreground py-10">
          No quizzes available.
        </p>
      )}

      <Accordion type="multiple" className="w-full">
        {categories.map((exam) => (
          <AccordionItem key={exam.exam} value={exam.exam} className="border-b">
            <AccordionTrigger className="text-xl font-semibold py-4">
              {exam.exam}
            </AccordionTrigger>
            <AccordionContent className="pl-4">
              <Accordion type="multiple" className="w-full">
                {exam.subjects.map((subject) => (
                  <AccordionItem
                    key={`${exam.exam}-${subject.subject}`}
                    value={`${exam.exam}-${subject.subject}`}
                    className="border-b"
                  >
                    <AccordionTrigger className="text-base font-medium">
                      {subject.subject}
                    </AccordionTrigger>
                    <AccordionContent>
                      {subject.quizzes.length === 0 && (
                        <p className="text-sm text-muted-foreground text-center py-4">
                          No quizzes available for this subject.
                        </p>
                      )}
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {subject.quizzes.map((quiz) => (
                          <QuizCard
                            key={quiz.quizId}
                            quiz={quiz}
                            onStart={handleQuizStart}
                          />
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
};

export default QuizCategoriesPage; 