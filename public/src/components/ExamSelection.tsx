import React from "react";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface ExamSelectionProps {
  options: string[];
  selectedExam: string;
  onSelect: (exam: string) => void;
  error?: string;
}

export default function ExamSelection({
  options,
  selectedExam,
  onSelect,
  error,
}: ExamSelectionProps) {
  return (
    <div className="mb-4">
      <Label className="mb-2 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
        Preparing For
      </Label>
      <div className="flex flex-wrap gap-2 py-4">
        {options.map((exam) => (
          <Card
            key={exam}
            onClick={() => onSelect(exam)}
            className={cn(
              "min-w-[100px] cursor-pointer border-2 p-2 text-center",
              selectedExam === exam
                ? "border-primary text-primary"
                : "border-muted hover:border-primary"
            )}
          >
            {exam}
          </Card>
        ))}
      </div>
      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </div>
  );
}
