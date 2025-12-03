import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useToast } from "@/hooks/use-toast"
import { photoURLChhatraKey, storageKey, streams } from "@/utils"
import { apiUrl } from "@/utils/apiRoutes"
import axios from "axios"
import { Filter, Medal, Star, Trophy, X } from 'lucide-react'
import { useEffect, useState } from "react"
import { To, useLocation, useNavigate, useParams } from "react-router-dom"
import NavMain from "../components/NavMain"
import { set } from "zod"

export default function Leaderboard({ isQuizLeaderboard }: { isQuizLeaderboard: boolean }) {
  const { quizId } = useParams();
  const location = useLocation()
  const navigate = useNavigate()
  const { toast } = useToast()
  const [leaderboard, setLeaderboard] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [streamFilter, setStreamFilter] = useState("All")
  const [userData, setUserData] = useState<any>(null)
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const ITEMS_PER_PAGE = 10;

  const StreamFilters = streams

  const handleMenuClick = (path: To) => {
    navigate(path)
  }

  const handleLogout = () => {
    localStorage.removeItem(storageKey)
    localStorage.removeItem(photoURLChhatraKey)
    navigate("/")
  }

  useEffect(() => {
    const fetchUserData = async () => {
      const token = localStorage.getItem(storageKey)
      if (!token) {
        navigate("/")
        return
      }

      try {
        const response = await axios.get(`${apiUrl}/api/userProfile/profile`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        setUserData(response.data.data)
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Error fetching user data.",
          description: "Please try again later.",
        })
      }
    }

    fetchUserData()
  }, [])

  useEffect(() => {
    const fetchLeaderboard = async () => {
      setIsLoading(true)
      try {
        const response = await axios.get(
          isQuizLeaderboard
            ? `${apiUrl}/api/userscore/leaderboard/${quizId}`
            : `${apiUrl}/api/userscore/leaderboard`,
          {
            params: {
              page: currentPage,
              limit: ITEMS_PER_PAGE,
              stream: streamFilter !== "All" ? streamFilter : undefined,
            },
          }
        );

        if (response.data.success) {
          const { leaderboard, totalPages, currentPage: serverPage } = response.data.data;
          const transformedLeaderboard = leaderboard.map(
            (item: any, index: number) => ({
              rank: ((serverPage - 1) * ITEMS_PER_PAGE) + index + 1,
              name: item.fullName || "Unknown",
              score: item.score,
              avatar: "/default-avatar.png",
              badge:
                index === 0 && serverPage === 1
                  ? "Gold"
                  : index === 1 && serverPage === 1
                    ? "Silver"
                    : index === 2 && serverPage === 1
                      ? "Bronze"
                      : null,
              stream: item.stream,
              id: item._id,
              rankIcon:
                index === 0 && serverPage === 1
                  ? "trophy"
                  : index === 1 && serverPage === 1
                    ? "medal"
                    : index === 2 && serverPage === 1
                      ? "medal"
                      : "number"
            })
          );
          setLeaderboard(transformedLeaderboard);
          setTotalPages(totalPages);
          setCurrentPage(serverPage);
        } else {
          toast({
            variant: "destructive",
            title: "Something went wrong",
            description: response.data.message || "Failed to fetch leaderboard",
          });
        }
      } catch (error) {
        if (axios.isAxiosError(error)) {
          console.error("Error response:", error.response?.data);
          toast({
            variant: "destructive",
            title: "An error occurred",
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
        setIsLoading(false);
      }
    };

    fetchLeaderboard()
  }, [currentPage, streamFilter])

  if (isLoading) {
    return (
      
        <div className="flex justify-center items-center h-screen">
          <div className="w-8 h-8 border-4 border-t-4 border-gray-200 border-t-slate-500 rounded-full animate-spin"></div>
        </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <Card className="shadow-lg bg-card">
          <CardHeader className="border-b border-border">
            <NavMain
              userData={userData}
              handleLogout={handleLogout}
              handleMenuClick={handleMenuClick}
            />
          </CardHeader>
          <CardContent className="p-6">
            <div className="mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
              <CardTitle className="text-3xl font-bold text-center sm:text-left">
                {isQuizLeaderboard && location.state?.quizData ? `Leaderboard for Quiz: ${location.state.quizData.quizTitle}` : "Global Leaderboard"}
              </CardTitle>
              <div className="flex items-center gap-2">
                {streamFilter !== "All" && (
                  <Badge variant="secondary" className="text-sm py-1 px-2">
                    {streamFilter}
                    <X
                      className="h-4 w-4 ml-1 cursor-pointer"
                      onClick={() => setStreamFilter("All")}
                    />
                  </Badge>
                )}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="shadow-sm">
                      <Filter className="h-4 w-4 mr-2" /> Filter by Stream
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    {StreamFilters.map((filter) => (
                      <DropdownMenuItem key={filter} onClick={() => setStreamFilter(filter)}>
                        {filter}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[100px]">Rank</TableHead>
                    <TableHead>Player</TableHead>
                    <TableHead className="text-right">Score</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {leaderboard
                    .filter(player => streamFilter === "All" || player.stream === streamFilter)
                    .sort((a, b) => b.score - a.score)
                    .map((player, index) => (
                      <TableRow
                        key={index}
                        className={`hover:bg-accent/50 ${player.id === userData?._id ? 'bg-accent' : ''
                          }`}
                      >
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            {player.rankIcon === "trophy" && (
                              <Trophy className="h-6 w-6" />
                            )}
                            {player.rankIcon === "medal" && (
                              <Medal className="h-6 w-6" />
                            )}
                            {player.rankIcon === "number" && (
                              <span className="text-lg font-bold">{player.rank}</span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-10 w-10">
                              <AvatarImage src={player.avatar} alt={player.name} />
                              <AvatarFallback>{player.name[0]}</AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-semibold">{player.name}</div>
                              <div className="text-sm text-gray-500 dark:text-gray-400">{player.stream}</div>
                              {player.badge && (
                                <Badge variant="secondary" className="mt-1">
                                  <Star className="h-3 w-3 mr-1" />
                                  {player.badge}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-right font-bold text-lg">
                          {player.score.toLocaleString()}
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
              <div className="mt-4 flex justify-center">
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <span className="mx-4 py-2">
                  Page {currentPage} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

