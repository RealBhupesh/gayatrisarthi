import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { photoURLChhatraKey, storageKey } from "@/utils";
import { apiUrl } from "@/utils/apiRoutes";
import axios from "axios";
import {
  Award,
  BookOpen,
  Clock,
  Mail,
  MapPin,
  Phone,
  School,
  Target,
  Trophy,
  TrendingUp,
  User,
} from "lucide-react";
import { useEffect, useState } from "react";
import { To, useNavigate } from "react-router-dom";
import NavMain from "../components/NavMain";

interface UserData {
  userId: string;
  username: string;
  email: string;
  phoneNumber: string;
  fullName: string;
  instituteName: string;
  city: string;
  state: string;
  instituteType: string;
  stream: string;
  prepExam: string;
  role: string;
  photoURL?: string;
}

interface RankData {
  rank: number | null;
  totalScore: number;
  percentile: number | null;
  totalUsers: number;
}

interface SubjectPerformance {
  subject: string;
  attempts: number;
  averageScore: string;
  accuracy: string;
}

interface Statistics {
  totalAttempts: number;
  totalUniqueQuizzes: number;
  averageScore: string;
  averageTimeTaken: number;
  subjectPerformance: SubjectPerformance[];
}

interface RecentAttempt {
  attemptId: string;
  quizId: string;
  subject: string;
  score: number;
  numberOfQues: number;
  timeTaken: number;
  createdAt: string;
}

interface ProfileData {
  user: UserData;
  rankData: RankData;
  statistics: Statistics;
  recentAttempts: RecentAttempt[];
}

export default function Profile() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem(storageKey);

  const fetchProfileData = async () => {
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
      const response = await axios.get(`${apiUrl}/api/userProfile/profile/stats`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setProfileData(response.data.data);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error fetching profile data.",
        description: "Please try again later.",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfileData();
  }, []);

  const handleMenuClick = (path: To) => {
    navigate(path);
  };

  const handleLogout = () => {
    localStorage.removeItem(storageKey);
    localStorage.removeItem(photoURLChhatraKey);
    navigate("/");
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="w-12 h-12 border-4 border-t-4 border-gray-200 border-t-slate-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!profileData) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p>No profile data available.</p>
      </div>
    );
  }

  const { user, rankData, statistics, recentAttempts } = profileData;

  return (
    <div className="p-6 pb-0 space-y-6 max-w-7xl mx-auto">
      <NavMain
        userData={user}
        handleLogout={handleLogout}
        handleMenuClick={handleMenuClick}
      />

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">My Profile</h1>
          <Button variant="outline" onClick={() => navigate("/dashboard")}>
            Back to Dashboard
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="md:col-span-1 border-2 border-primary/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Personal Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Full Name</p>
                  <p className="font-medium">{user.fullName}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium text-sm">{user.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Phone</p>
                  <p className="font-medium">{user.phoneNumber}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <School className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Institute</p>
                  <p className="font-medium">{user.instituteName}</p>
                  <p className="text-xs text-muted-foreground">
                    {user.instituteType}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Location</p>
                  <p className="font-medium">
                    {user.city}, {user.state}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Stream</p>
                  <p className="font-medium">{user.stream}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">
                    Preparing For
                  </p>
                  <p className="font-medium">{user.prepExam}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="md:col-span-2 space-y-6">
            <Card className="border-2 border-primary/30 bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-950/20 dark:to-orange-950/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-yellow-600" />
                  Rank & Performance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
                    <div className="text-3xl font-bold text-yellow-600">
                      {rankData.rank || "N/A"}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      Global Rank
                    </p>
                  </div>
                  <div className="text-center p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
                    <div className="text-3xl font-bold text-blue-600">
                      {rankData.totalScore}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      Total Score
                    </p>
                  </div>
                  <div className="text-center p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
                    <div className="text-3xl font-bold text-green-600">
                      {rankData.percentile || "N/A"}
                      {rankData.percentile && "%"}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      Percentile
                    </p>
                  </div>
                  <div className="text-center p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
                    <div className="text-3xl font-bold text-purple-600">
                      {rankData.totalUsers}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      Total Users
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-2 border-primary/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Quiz Statistics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold">
                      {statistics.totalAttempts}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Total Attempts
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">
                      {statistics.totalUniqueQuizzes}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Quizzes Taken
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">
                      {statistics.averageScore}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Average Score
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold flex items-center justify-center gap-1">
                      <Clock className="h-4 w-4" />
                      {formatTime(statistics.averageTimeTaken)}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Avg Time
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {statistics.subjectPerformance.length > 0 && (
          <Card className="border-2 border-primary/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5" />
                Subject-wise Performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {statistics.subjectPerformance.map((subject) => (
                  <div
                    key={subject.subject}
                    className="p-4 border rounded-lg hover:shadow-md transition-shadow"
                  >
                    <h3 className="font-semibold text-lg mb-2">
                      {subject.subject}
                    </h3>
                    <div className="space-y-1 text-sm">
                      <p className="flex justify-between">
                        <span className="text-muted-foreground">Attempts:</span>
                        <span className="font-medium">{subject.attempts}</span>
                      </p>
                      <p className="flex justify-between">
                        <span className="text-muted-foreground">Avg Score:</span>
                        <span className="font-medium">
                          {subject.averageScore}
                        </span>
                      </p>
                      <p className="flex justify-between">
                        <span className="text-muted-foreground">Accuracy:</span>
                        <Badge
                          className={`${
                            parseFloat(subject.accuracy) >= 80
                              ? "bg-green-500"
                              : parseFloat(subject.accuracy) >= 60
                              ? "bg-yellow-500"
                              : "bg-red-500"
                          } text-white`}
                        >
                          {subject.accuracy}%
                        </Badge>
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {recentAttempts.length > 0 && (
          <Card className="border-2 border-primary/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Recent Quiz Attempts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Subject</TableHead>
                      <TableHead>Score</TableHead>
                      <TableHead>Time Taken</TableHead>
                      <TableHead>Accuracy</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentAttempts.map((attempt) => {
                      const accuracy = (
                        (attempt.score / attempt.numberOfQues) *
                        100
                      ).toFixed(1);
                      return (
                        <TableRow key={attempt.attemptId}>
                          <TableCell>
                            {formatDate(attempt.createdAt)}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{attempt.subject}</Badge>
                          </TableCell>
                          <TableCell>
                            {attempt.score} / {attempt.numberOfQues}
                          </TableCell>
                          <TableCell>
                            {formatTime(attempt.timeTaken)}
                          </TableCell>
                          <TableCell>
                            <Badge
                              className={`${
                                parseFloat(accuracy) >= 80
                                  ? "bg-green-500"
                                  : parseFloat(accuracy) >= 60
                                  ? "bg-yellow-500"
                                  : "bg-red-500"
                              } text-white`}
                            >
                              {accuracy}%
                            </Badge>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
