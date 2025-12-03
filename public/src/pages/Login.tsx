import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { z } from "zod";
import { GridBackground } from "@/components/aceternity/background-grid";
import Onboarding from "@/components/Onboarding";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { photoURLChhatraKey, storageKey } from "@/utils";
import { auth } from "@/utils/firebaseConfig";
import { Loader2 } from "lucide-react";
import { apiUrl } from "@/utils/apiRoutes";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

export default function Login({
  setphotoURL,
  setUserData,
}: {
  setphotoURL: React.Dispatch<React.SetStateAction<string>>;
  setUserData: React.Dispatch<React.SetStateAction<{}>>;
}) {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [startOnboarding, setstartOnboarding] = useState(false);
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    email: "",
  });
  const [photoURL, setPhotoURL] = useState("");

  useEffect(() => {
    const token = localStorage.getItem(storageKey);
    if (token) {
      navigate("/preferences");
    }
  }, [navigate]);

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      const googleProvider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, googleProvider);
      const {
        user: { email, photoURL },
      } = result;

      if (email) {
        setFormData({ email });
        setPhotoURL(photoURL!);

        console.log("Google Sign-In Success:", email);
        console.log(apiUrl);

        const response = await axios.post(`${apiUrl}/api/userProfile/login`, {
          email,
        });
        const { data, message, exists } = response.data;

        if (response.status === 200) {
          if (exists) {
            setphotoURL(photoURL!); // Set user photo URL if provided
            localStorage.setItem(photoURLChhatraKey, photoURL || "");
            // console.log("Login Successful:", data);
            localStorage.setItem(storageKey, data.token); // Save token
            setUserData(data.user); // Update user data in the state
            navigate("/preferences"); // Navigate to the dashboard
            toast({
              variant: "default",
              title: "Welcome!",
              description: "Login Successful",
            });
          } else {
            setstartOnboarding(true);
          }
        } else {
          console.error("Unexpected Response:", message);
          toast({
            variant: "destructive",
            title: "Unexpected Error",
            description: message || "An error occurred during login.",
          });
        }
      }
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        const { data } = error.response;
        console.error("Backend Error:", data);
        toast({
          variant: "destructive",
          title: "Login Failed",
          description: data?.message || "An error occurred while logging in.",
        });
      } else {
        // Handle generic or network errors
        console.error("Google Sign-In Error:", error);
        toast({
          variant: "destructive",
          title: "Google Sign-In Error",
          description: "Failed to sign in with Google. Please try again.",
        });
      }
    } finally {
      setIsLoading(false); // Reset loading state
    }
  };

  return (
    <>
      {startOnboarding ? (
        <Onboarding
          setUserData={setUserData}
          regFormData={formData}
          photoURL={photoURL}
          setstartOnboarding={setstartOnboarding} // Pass correctly
        />
      ) : (
        <GridBackground>
          <Card className="w-full max-w-md shadow-lg">
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl font-bold text-center">
                Sign in
              </CardTitle>
              <CardDescription className="text-center text-sm">
                Enter your credentials to access your account
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button
                variant="outline"
                type="button"
                disabled={isLoading}
                className="w-full"
                onClick={handleGoogleSignIn}
              >
                {isLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                    <path
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      fill="#4285F4"
                    />
                    <path
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      fill="#34A853"
                    />
                    <path
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      fill="#FBBC05"
                    />
                    <path
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      fill="#EA4335"
                    />
                    <path d="M1 1h22v22H1z" fill="none" />
                  </svg>
                )}{" "}
                Continue with Google
              </Button>
            </CardContent>
            {/* <CardFooter className="flex flex-col space-y-2">
          <p className="text-center text-sm">
            Don’t have an account?{" "}
            <a href="/register" className="text-blue-500 hover:underline">
              Register here
            </a>
          </p>
        </CardFooter> */}
          </Card>
        </GridBackground>
      )}
    </>
  );
}
