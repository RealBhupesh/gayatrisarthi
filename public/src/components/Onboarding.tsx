import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import {
  institutes,
  photoURLChhatraKey,
  preparingForOptions,
  storageKey,
  streams,
  subjects, // Import subjects
} from "@/utils";
import axios from "axios";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { apiUrl } from "@/utils/apiRoutes";
import ExamSelection from "./ExamSelection"; // Import ExamSelection
import SubjectSelection from "./SubjectSelection"; // Import SubjectSelection

export default function Onboarding({
  setUserData,
  photoURL,
  regFormData,
  setRegErrors,
  setstartOnboarding,
}: {
  setUserData: React.Dispatch<
    React.SetStateAction<{ [key: string]: string | string[] }>
  >; // Update type to handle arrays
  photoURL?: string;
  regFormData: { [key: string]: string };
  setRegErrors?: React.Dispatch<
    React.SetStateAction<{ [key: string]: string }>
  >;
  setstartOnboarding: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const [formData, setFormData] = useState<{
    [key: string]: string | string[];
  }>({
    fullName: "",
    phoneNumber: "",
    instituteType: "",
    instituteName: "",
    city: "",
    state: "",
    stream: "",
    prepExam: "",
    subjects: [], // Add subjects as an array
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({
    fullName: "",
    phoneNumber: "",
    instituteType: "",
    instituteName: "",
    city: "",
    state: "",
    stream: "",
    prepExam: "",
    subjects: "", // Add subjects to errors
  });

  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const validateField = (
    field: keyof typeof formData,
    value: string | string[]
  ) => {
    let error = "";
    if (!value || (Array.isArray(value) && value.length === 0)) {
      error = "This field is required.";
    } else if (
      field === "phoneNumber" &&
      typeof value === "string" &&
      !/^\d{10}$/.test(value)
    ) {
      error = "Please enter a valid 10-digit phone number.";
    }
    setErrors((prev) => ({ ...prev, [field]: error }));
    return error === "";
  };

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleSubjectToggle = (subject: string) => {
    const currentSubjects = formData.subjects as string[];
    let updatedSubjects: string[];
    if (currentSubjects.includes(subject)) {
      updatedSubjects = currentSubjects.filter((s) => s !== subject);
    } else {
      updatedSubjects = [...currentSubjects, subject];
    }
    setFormData((prev) => ({ ...prev, subjects: updatedSubjects }));
    if (errors.subjects) {
      setErrors((prev) => ({ ...prev, subjects: "" }));
    }
  };

  const handleSubmit = async () => {
    const isValid = Object.keys(formData).every((field) =>
      validateField(
        field as keyof typeof formData,
        formData[field as keyof typeof formData]
      )
    );

    if (isValid) {
      setLoading(true);
      try {
        const response = await axios.post(
          `${apiUrl}/api/userProfile/register`,
          {
            ...formData,
            ...regFormData,
            role: "user",
          }
        );

        const result = response.data;

        localStorage.setItem(storageKey, result.data.token);
        localStorage.setItem(photoURLChhatraKey, photoURL || "");
        setUserData(result.data.user);

        navigate("/preferences");
        toast({
          variant: "default",
          title: "Welcome In.",
          description: "Registration successful",
        });
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
      } finally {
        setLoading(false);
      }
    }
  };

  const handleBackClick = () => {
    setstartOnboarding(false);
  };

  return (
    <div className="min-h-screen bg-background text-foreground p-4">
      <button
        onClick={handleBackClick}
        className="flex items-center hover:underline"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5 mr-1"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15 19l-7-7 7-7"
          />
        </svg>
        Back
      </button>
      <header className="mb-6 flex items-center">
        <h1 className="text-2xl md:text-3xl font-bold flex-grow text-center">
          Let’s Get Started
        </h1>
      </header>

      <div className="max-w-xl mx-auto">
        {/* Input fields */}
        {[
          {
            label: "Full Name",
            field: "fullName",
            placeholder: "Enter your full name",
          },
          {
            label: "Phone Number",
            field: "phoneNumber",
            placeholder: "Enter your phone number",
          },
          {
            label: "Institute Name",
            field: "instituteName",
            placeholder: "Enter the name of your institute",
          },
          { label: "City", field: "city", placeholder: "Enter your city" },
          { label: "State", field: "state", placeholder: "Enter your state" },
        ].map(({ label, field, placeholder }) => (
          <div className="mb-4" key={field}>
            <Label htmlFor={field} className="block font-semibold mb-1">
              {label}
            </Label>
            <Input
              id={field}
              value={formData[field] as string}
              onChange={(e) => handleInputChange(field, e.target.value)}
              placeholder={placeholder}
              className="w-full"
            />
            {errors[field] && (
              <p className="text-red-500 text-sm">{errors[field]}</p>
            )}
          </div>
        ))}

        {/* Select fields */}
        {[
          {
            label: "Institute Type",
            field: "instituteType",
            options: institutes,
          },
          { label: "Stream", field: "stream", options: streams },
        ].map(({ label, field, options }) => (
          <div className="mb-4" key={field}>
            <Label className="block font-semibold mb-1">{label}</Label>
            <Select
              onValueChange={(value) => handleInputChange(field, value)}
              defaultValue={formData[field] as string}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder={`Select ${label}`} />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {options.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
            {errors[field] && (
              <p className="text-red-500 text-sm">{errors[field]}</p>
            )}
          </div>
        ))}

        {/* Exam Selection Cards */}
        <ExamSelection
          options={preparingForOptions}
          selectedExam={formData.prepExam as string}
          onSelect={(exam) => handleInputChange("prepExam", exam)}
          error={errors.prepExam}
        />

        {/* Subject Selection Cards */}
        <SubjectSelection
          options={subjects}
          selectedSubjects={formData.subjects as string[]}
          onSelect={handleSubjectToggle}
          error={errors.subjects}
        />

        {/* Submit Button */}
        <div className="text-center mt-6">
          <Button
            onClick={handleSubmit}
            className={`px-6 py-2 rounded-md ${
              loading ? "opacity-50 cursor-not-allowed" : ""
            }`}
            disabled={loading}
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <svg
                  className="animate-spin h-5 w-5 text-gray-500 mr-2"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  ></path>
                </svg>
                Loading...
              </span>
            ) : (
              "Submit"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
