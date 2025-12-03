import { useState } from "react";
import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import { ThemeProvider } from "./components/theme-provider";

// Pages

import Assignment from "./pages/Assignment";
import CreateQuiz from "./pages/CreateQuiz";
import Dashboard from "./pages/Dashboard";
import { Landing } from "./pages/Landing";
import Leaderboard from "./pages/Leaderboard";
import Login from "./pages/Login";
import Quiz from "./pages/Quiz";

// Components
import Footer from "./components/Footer";
import AdminDashboard from "./pages/AdminDashboard";
import Preferences from "./pages/Preferences";
import QuizCategoriesPage from "./pages/QuizCategoriesPage";

function App() {
  const [photoURL, setPhotoURL] = useState("");
  const [userData, setUserData] = useState({});

  return (
    <ThemeProvider>
      <BrowserRouter>
        {/* Full Page Layout */}
        <div className="flex flex-col min-h-screen">
          {/* Main Content */}
          <main className="flex-grow">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Landing />} />
              <Route
                path="/login"
                element={
                  <Login setphotoURL={setPhotoURL} setUserData={setUserData} />
                }
              />
              {/* <Route
                path="/register"
                element={<Register setUserData={setUserData} />}
              /> */}

              {/* Authenticated Routes */}
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/quiz" element={<Quiz />} />
              <Route path="/assignment" element={<Assignment />} />

              <Route
                path="/leaderboard/:quizId"
                element={
                  <Leaderboard
                    key="quiz-leaderboard"
                    isQuizLeaderboard={true}
                  />
                }
              />
              <Route
                path="/leaderboard"
                element={
                  <Leaderboard
                    key="global-leaderboard"
                    isQuizLeaderboard={false}
                  />
                }
              />
              <Route path="/create-quiz" element={<CreateQuiz />} />

              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/preferences" element={<Preferences />} />
              <Route path="/quiz-categories" element={<QuizCategoriesPage />} />
              {/* Fallback Route */}
              <Route
                path="*"
                element={
                  <div className="text-center py-10">404 - Page Not Found</div>
                }
              />
            </Routes>
          </main>

          {/* Footer (Conditional Rendering) */}
          <FooterWrapper />
        </div>
      </BrowserRouter>
    </ThemeProvider>
  );
}

// Component for Conditional Footer Rendering
const FooterWrapper = () => {
  const location = useLocation();

  // Check if the current route is /quiz
  if (location.pathname === "/quiz") {
    return null; // Do not render the footer on /quiz page
  }

  return <Footer />;
};

export default App;
