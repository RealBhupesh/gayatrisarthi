import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";
import {
  photoURLChhatraKey,
  preparingForOptions,
  storageKey,
  streams,
} from "@/utils";
import { apiUrl } from "@/utils/apiRoutes";
import axios from "axios";
import { BookOpen, Edit2, Info, Trophy } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { To, useLocation, useNavigate } from "react-router-dom";
import NavMain from "../components/NavMain";
import QuizStartDialog from "../components/QuizStartComponent";

interface Quiz {
  quizDescription: string;
  quizId: string;
  quizTitle: string;
  subject: string;
  tags: string[];
  forStreams: string[];
  selectedStreams: string[];
  questionsData: {
    numberOfQues: number;
    questions: any[];
  };
  maxScore: string | number;
}

interface QuizRankResponse {
  success: boolean;
  message: string;
  data: {
    rank: number | null;
    totalParticipants: number;
    percentile: number | null;
    bestScore: number | null;
    attempts: number;
    lastAttemptDate: string | null;
    betterThanCount: number | null;
    worseThanCount: number | null;
    sameScoreCount: number | null;
  };
}

export default function Dashboard() {
  const allStreamOptions = [...streams, ...preparingForOptions];
  const navigate = useNavigate();
  const { toast } = useToast();
  const location = useLocation();

  const [searchQuery, setSearchQuery] = useState(""); // Local search for client-side filtering
  const [globalSearchQuery, setGlobalSearchQuery] = useState(""); // Server-side search query
  const [selectedStream, setSelectedStream] = useState("All");
  const [userData, setUserData] = useState<any>();
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState(false);
  const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [attemptedQuizzes, setAttemptedQuizzes] = useState<any[]>([]);
  const [highestScoredQuizzes, setHighestScoredQuizzes] = useState<any[]>([]);
  const [quizleaderboardloading, setQuizleaderboardLoading] = useState<
    string[]
  >([]);
  const [quizRanks, setQuizRanks] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [openTooltipId, setOpenTooltipId] = useState<string | null>(null);
  const [filters, setFilters] = useState<{
    selectedSubjects: string[];
    selectedExam: string;
  }>({
    selectedSubjects: [],
    selectedExam: "",
  });

  const token = localStorage.getItem(storageKey);
  const observerRef = useRef<HTMLDivElement | null>(null);

  // Handle preferences from Preferences page
  useEffect(() => {
    if (location.state?.selectedSubjects || location.state?.selectedExam) {
      setFilters({
        selectedSubjects: location.state?.selectedSubjects || [],
        selectedExam: location.state?.selectedExam || "",
      });
      setSelectedStream(location.state?.selectedExam || "All");
      if (location.state?.selectedSubjects) {
        setGlobalSearchQuery(location.state.selectedSubjects.join(" "));
      }
    }
  }, [location.state]);

  // Fetch user data
  const fetchUserData = async () => {
    if (!token) {
      toast({
        variant: "destructive",
        title: "Authentication Required.",
        description: "You need to log in to access your profile.",
      });
      navigate("/");
      return;
    }

    try {
      const response = await axios.get(`${apiUrl}/api/userProfile/profile`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setUserData(response.data.data);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error fetching user data.",
        description: "Please try again later.",
      });
    }
  };

  // Fetch quizzes
  const fetchQuizzes = async (pageNum: number) => {
    if (loading || fetchError) return;
    setLoading(true);
    try {
      const response = await axios.get(`${apiUrl}/api/quiz/quizzes`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { page: pageNum, limit: 12 },
      });
      const {
        quizzes: newQuizzes,
        totalPages: total,
        currentPage,
        hasNextPage,
      } = response.data.data;
      setQuizzes(newQuizzes);
      setTotalPages(total);
      setCurrentPage(currentPage);
      setHasMore(hasNextPage);
      setFetchError(false);
    } catch (error) {
      setFetchError(true);
      toast({
        variant: "destructive",
        title: "Error fetching quizzes.",
        description: "Please try again later.",
      });
    } finally {
      setLoading(false);
    }
  };

  // Fetch attempted quizzes
  const fetchAttemptedQuizzes = async () => {
    if (!token) {
      toast({
        variant: "destructive",
        title: "Authentication Required.",
        description: "You need to log in to view your quiz attempts.",
      });
      navigate("/");
      return;
    }

    try {
      const response = await axios.get(`${apiUrl}/api/history/attempts`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setAttemptedQuizzes(response.data.data);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error fetching quiz attempts.",
        description: "Please try again later.",
      });
    }
  };

  // Search quizzes
  const searchQuizzes = async (pageNum: number) => {
    setLoading(true);
    try {
      const query = globalSearchQuery || filters.selectedSubjects.join(" ");
      const response = await axios.get(`${apiUrl}/api/quiz/search`, {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          query: query.split(" ")[0],
          stream: selectedStream,
          page: pageNum,
          limit: 12,
        },
      });
      if (response.data.success) {
        const {
          quizzes: newQuizzes,
          totalPages: total,
          currentPage,
          hasNextPage,
        } = response.data.data;
        setQuizzes(newQuizzes);
        setTotalPages(total);
        setCurrentPage(currentPage);
        setHasMore(hasNextPage);
        setFetchError(false);
      } else {
        setQuizzes([]);
        setTotalPages(1);
        setCurrentPage(1);
        toast({
          variant: "destructive",
          title: "No quiz found",
          description: response.data.message,
        });
      }
    } catch (error) {
      setQuizzes([]);
      setTotalPages(1);
      setCurrentPage(1);
      toast({
        variant: "destructive",
        title: "Error searching quizzes",
        description: "Please try again later.",
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle stream filter change
  const handleStreamChange = async (value: string, pageNum: number = 1) => {
    setSelectedStream(value);
    setCurrentPage(pageNum);
    setLoading(true);
    try {
      const response = await axios.get(`${apiUrl}/api/quiz/filter/stream`, {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          stream: value,
          page: pageNum,
          limit: 12,
        },
      });
      if (response.data.success) {
        const {
          quizzes: newQuizzes,
          totalPages: total,
          currentPage,
          hasNextPage,
        } = response.data.data;
        setQuizzes(newQuizzes);
        setTotalPages(total);
        setCurrentPage(currentPage);
        setHasMore(hasNextPage);
        setFetchError(false);
      }
    } catch (error) {
      setFetchError(true);
      toast({
        variant: "destructive",
        title: "Error filtering quizzes.",
        description: "Please try again later.",
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle quiz leaderboard
  const handleQuizLeaderboard = async (quiz: Quiz) => {
    try {
      if (!token) {
        toast({
          variant: "destructive",
          title: "Authentication Error",
          description: "Please login to view your rank",
        });
        return;
      }

      setQuizleaderboardLoading([...quizleaderboardloading, quiz.quizId]);
      const response = await axios.get(
        `${apiUrl}/api/history/quiz-rank/${quiz.quizId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.success) {
        if (!response.data.data.rank) {
          toast({
            title: "Info",
            description: "You haven't attempted this quiz yet",
            variant: "default",
          });
        }
        setQuizRanks([
          ...quizRanks,
          { quizId: quiz.quizId, ...response.data.data },
        ]);
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: response.data.message || "Failed to fetch rank",
        });
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 404) {
          toast({
            variant: "default",
            title: "No attempts yet",
            description: "No one has attempted this quiz yet",
          });
        } else {
          toast({
            variant: "destructive",
            title: "Something went wrong",
            description:
              error.response?.data?.message || "Failed to fetch rank",
          });
        }
      } else {
        toast({
          variant: "destructive",
          title: "An unexpected error occurred",
          description: "Please try again later",
        });
      }
    } finally {
      setQuizleaderboardLoading((prevLoading) =>
        prevLoading.filter((id) => id !== quiz.quizId)
      );
    }
  };

  // Handle quiz start
  const handleQuizStart = (quiz: Quiz) => {
    setSelectedQuiz(quiz);
    setIsDialogOpen(true);
  };

  const handleQuizStartOption = (withTimer: boolean) => {
    if (selectedQuiz) {
      navigate("/quiz", {
        state: {
          quizData: selectedQuiz,
          subjectName: selectedQuiz.subject,
          withTimer: withTimer,
        },
      });
    }
    setIsDialogOpen(false);
  };

  const handleMenuClick = (path: To) => {
    navigate(path);
  };

  const handleLogout = () => {
    localStorage.removeItem(storageKey);
    localStorage.removeItem(photoURLChhatraKey);
    navigate("/");
  };

  // Fetch user data and quizzes
  useEffect(() => {
    fetchUserData();
  }, []);

  useEffect(() => {
    if (userData) {
      fetchAttemptedQuizzes();
    }
  }, [userData]);

  // Handle highest scored quizzes
  useEffect(() => {
    const filteredQuizzes = attemptedQuizzes?.reduce((acc, attempt) => {
      const existingQuiz = acc.find(
        (item: any) => item.quizId === attempt.quizId
      );

      if (existingQuiz) {
        if (attempt.score > existingQuiz.score) {
          Object.assign(existingQuiz, attempt);
        }
      } else {
        acc.push(attempt);
      }

      return acc;
    }, []);

    setHighestScoredQuizzes(filteredQuizzes);
  }, [attemptedQuizzes]);

  // Fetch quizzes based on filters and page
  useEffect(() => {
    if (userData && !loading) {
      if (globalSearchQuery || filters.selectedSubjects.length > 0) {
        searchQuizzes(currentPage);
      } else if (selectedStream !== "All") {
        handleStreamChange(selectedStream, currentPage);
      } else {
        fetchQuizzes(currentPage);
      }
    }
  }, [
    userData,
    selectedStream,
    globalSearchQuery,
    filters.selectedSubjects,
    currentPage,
  ]);

  // Handle pagination
  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages && !loading) {
      setCurrentPage(newPage);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  // Client-side filtering for local search
  const filteredQuizzes = quizzes.filter((quiz) => {
    const matchesSearch =
      quiz.quizTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      quiz.quizDescription.toLowerCase().includes(searchQuery.toLowerCase()) ||
      quiz.subject.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStream =
      selectedStream === "All" ||
      (quiz.forStreams && quiz.forStreams.includes(selectedStream));
    return matchesSearch && matchesStream;
  });

  return (
    <div className="p-6 pb-0 space-y-6 max-w-7xl mx-auto">
      {/* Nav section */}
      <NavMain
        userData={userData}
        handleLogout={handleLogout}
        handleMenuClick={handleMenuClick}
      />

      {/* Quizzes Section */}
      <div>
        <div className="mb-4 flex flex-wrap gap-2 justify-between items-center">
          <h2 className="text-2xl font-bold">Available Quizzes</h2>

          <div className="flex gap-2">
            {/* Filter Dropdown */}
            <Select
              value={selectedStream}
              onValueChange={(value) => handleStreamChange(value, 1)}
            >
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Filter Stream" />
              </SelectTrigger>
              <SelectContent>
                {allStreamOptions.map((stream) => (
                  <SelectItem key={stream} value={stream}>
                    {stream}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Search Input */}
            <div className="relative">
              <Input
                type="text"
                placeholder="Search quizzes..."
                value={globalSearchQuery}
                onChange={(e) => setGlobalSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && searchQuizzes(1)}
              />
              {globalSearchQuery && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8"
                  onClick={() => {
                    setGlobalSearchQuery("");
                    setFilters({ ...filters, selectedSubjects: [] });
                    setCurrentPage(1);
                  }}
                >
                  ×
                </Button>
              )}
            </div>
            <Button onClick={() => searchQuizzes(1)}>Search</Button>
          </div>
        </div>

        {/* Display selected subjects */}
        {filters.selectedSubjects.length > 0 && (
          <div className="mb-4 flex flex-wrap gap-2">
            <span className="font-medium">Selected Subjects:</span>
            {filters.selectedSubjects.map((subject: string) => (
              <Badge key={subject} variant="secondary">
                {subject}
                <button
                  className="ml-2 text-xs"
                  onClick={() => {
                    const updatedSubjects = filters.selectedSubjects.filter(
                      (s: string) => s !== subject
                    );
                    setFilters({
                      ...filters,
                      selectedSubjects: updatedSubjects,
                    });
                    setGlobalSearchQuery(updatedSubjects.join(" "));
                    setCurrentPage(1);
                  }}
                >
                  ×
                </button>
              </Badge>
            ))}
          </div>
        )}

        {!filteredQuizzes?.length && !loading && (
          <div className="text-center">
            <p>No quizzes found. Try a different search or filter.</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredQuizzes.map((quiz) => (
            <Card
              key={quiz.quizId}
              className="relative hover:shadow-lg transition-shadow border-2 border-primary/30 flex flex-col h-full"
            >
              <div
                className="cursor-pointer flex flex-col flex-1"
                onClick={() => handleQuizStart(quiz)}
              >
                <CardHeader className="flex-1">
                  <CardTitle className="text-xl flex items-center gap-2 line-clamp-3 truncate text-ellipsis">
                    {quiz.quizTitle}
                    <TooltipProvider>
                      <Tooltip
                        open={quiz.quizId === openTooltipId}
                        onOpenChange={(open) => {
                          setOpenTooltipId(open ? quiz.quizId : null);
                        }}
                      >
                        <TooltipTrigger asChild>
                          <div
                            className="inline-flex cursor-pointer p-2"
                            onClick={(e) => {
                              e.stopPropagation();
                              setOpenTooltipId(
                                openTooltipId === quiz.quizId
                                  ? null
                                  : quiz.quizId
                              );
                            }}
                          >
                            <Info
                              className="h-4 w-4 absolute right-14 top-3 sm:top-4 z-50 text-gray-500 hover:text-primary dark:text-gray-300 dark:hover:text-white"
                              strokeWidth={2}
                            />
                          </div>
                        </TooltipTrigger>
                        <TooltipContent
                          side="bottom"
                          align="end"
                          className="max-w-xs p-2 bg-white dark:bg-gray-800 text-black dark:text-white shadow-lg border rounded-md"
                        >
                          <p className="text-sm">{quiz.quizDescription}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p className="font-medium">
                      {quiz.questionsData.numberOfQues} questions
                    </p>
                    <div className="flex gap-1">
                      {quiz.forStreams?.map((stream, index) => (
                        <Badge
                          key={index}
                          variant="secondary"
                          className="text-sm"
                        >
                          {stream}
                        </Badge>
                      ))}
                      {highestScoredQuizzes &&
                        highestScoredQuizzes.find(
                          (item: Quiz) => item.quizId === quiz.quizId
                        ) &&
                        (() => {
                          const attemptedQuiz = highestScoredQuizzes.find(
                            (item: Quiz) => item.quizId === quiz.quizId
                          );
                          if (attemptedQuiz) {
                            const score = attemptedQuiz.score;
                            const totalQuestions =
                              quiz.questionsData.numberOfQues;
                            const scorePercentage = Math.round(
                              (score / totalQuestions) * 100
                            );
                            return (
                              <Badge
                                className={`ml-auto ${
                                  scorePercentage >= 80
                                    ? "bg-green-500"
                                    : scorePercentage >= 50
                                    ? "bg-yellow-500"
                                    : "bg-red-500"
                                } text-white`}
                              >
                                {score} / {totalQuestions}
                              </Badge>
                            );
                          }
                        })()}
                    </div>
                  </div>
                </CardContent>
              </div>
              <CardFooter className="absolute top-2 right-0">
                {userData && userData.role === "admin" ? (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate("/create-quiz", { state: quiz });
                    }}
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                ) : (
                  <>
                    {quizRanks.filter((ele) => ele.quizId === quiz.quizId)
                      .length > 0 ? (
                      <Badge variant={"outline"}>
                        {
                          quizRanks.filter(
                            (ele) => ele.quizId === quiz.quizId
                          )[0].percentile
                        }
                        <i>ile</i>
                      </Badge>
                    ) : (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleQuizLeaderboard(quiz)}
                        disabled={quizleaderboardloading?.includes(quiz.quizId)}
                      >
                        {quizleaderboardloading &&
                        quizleaderboardloading.includes(quiz.quizId) ? (
                          <div className="flex justify-center items-center">
                            <div className="w-3 h-3 border-2 border-t-2 border-yellow-200 border-t-yellow-500 rounded-full animate-spin"></div>
                          </div>
                        ) : (
                          <Trophy className="h-5 w-5 text-yellow-500" />
                        )}
                      </Button>
                    )}
                  </>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>
        {loading && (
          <div className="flex justify-center items-center">
            <div className="w-8 h-8 border-4 border-t-4 border-gray-200 border-t-slate-500 rounded-full animate-spin"></div>
          </div>
        )}

        <div ref={observerRef} className="h-10"></div>
      </div>

      {selectedQuiz && (
        <QuizStartDialog
          quiz={selectedQuiz}
          isOpen={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          onStart={handleQuizStartOption}
        />
      )}
      {!loading && quizzes.length > 0 && (
        <div className="mt-6 pb-6 flex justify-center items-center gap-4">
          <Button
            variant="outline"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1 || loading}
          >
            Previous
          </Button>
          <div className="flex items-center gap-2">
            <span className="text-sm">
              Page {currentPage} of {totalPages}
            </span>
          </div>
          <Button
            variant="outline"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages || loading}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
