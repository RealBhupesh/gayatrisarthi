import ExamSelection from "@/components/ExamSelection";
import SubjectSelection from "@/components/SubjectSelection";
import { Button } from "@/components/ui/button";
import { examSubjectMap, preparingForOptions, subjects } from "@/utils";
import React, { useState, useEffect, useRef, MutableRefObject } from "react";
import { useNavigate } from "react-router-dom";

// Exam-to-Subjects mapping

function Preferences() {
  const [selectedExam, setSelectedExam] = useState<string>("");
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [examError, setExamError] = useState<string>("");
  const [subjectsError, setSubjectsError] = useState<string>("");
  const navigate = useNavigate();
  const secRef = useRef<HTMLDivElement>();

  // Filter subjects based on selected exam
  const filteredSubjects = selectedExam
    ? examSubjectMap[selectedExam] || []
    : subjects; // Show all subjects if no exam is selected

  // Effect to reset selectedSubjects when exam changes
  useEffect(() => {
    if (selectedExam) {
      // Keep only subjects that are valid for the new exam
      setSelectedSubjects((prev) =>
        prev.filter((sub) => examSubjectMap[selectedExam]?.includes(sub))
      );
    } else {
      setSelectedSubjects([]); // Clear subjects if no exam is selected
    }
  }, [selectedExam]);

  const handleExamSelect = (exam: string) => {
    setSelectedExam(exam === selectedExam ? "" : exam);
    setExamError("");
  };

  const handleSubjectSelect = (subject: string) => {
    setSelectedSubjects((prev) =>
      prev.includes(subject)
        ? prev.filter((s) => s !== subject)
        : [...prev, subject]
    );
    setSubjectsError("");
  };

  const handleSubmit = () => {
    if (!selectedExam) {
      setExamError("Please select an exam.");
      secRef?.current?.scrollIntoView({ behavior: "smooth" });
      return;
    }
    if (selectedSubjects.length === 0) {
      setSubjectsError("Please select at least one subject.");
      return;
    }
    // console.log("Selected Exam:", selectedExam);
    // console.log("Selected Subjects:", selectedSubjects);
    navigate("/dashboard", { state: { selectedSubjects, selectedExam } });
  };

  return (
    <div className="container max-w-6xl mx-auto px-4 py-12">
      <div ref={secRef as MutableRefObject<HTMLDivElement>}>
        <ExamSelection
          options={[
            "MHTCET(PCM)",
            "MAH-B-BCA-BBA-BMS-BBM-CET",
          ]}
          selectedExam={selectedExam}
          onSelect={handleExamSelect}
          error={examError}
        />
      </div>
      {selectedExam && (
        <SubjectSelection
          options={filteredSubjects}
          selectedSubjects={selectedSubjects}
          onSelect={handleSubjectSelect}
          error={subjectsError}
        />
      )}
      <div className="flex justify-center mt-8 mx-auto">
        <Button
          onClick={handleSubmit}
          variant="default"
        >
          Submit
        </Button>
      </div>
    </div>
  );
}

export default Preferences;
