import React from "react";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface SubjectSelectionProps {
  options: string[];
  selectedSubjects: string[];
  onSelect: (subject: string) => void;
  error?: string;
}

export default function SubjectSelection({
  options,
  selectedSubjects,
  onSelect,
  error,
}: SubjectSelectionProps) {
  const handleSubjectToggle = (subject: string) => {
    onSelect(subject);
  };

  return (
    <div className="space-y-2">
      <Label>Select Subjects</Label>
      <div className="flex flex-wrap gap-2">
        {options.map((subject) => (
          <Card
            key={subject}
            onClick={() => handleSubjectToggle(subject)}
            className={cn(
              "min-w-[100px] cursor-pointer border-2 p-2 text-center",
              selectedSubjects.includes(subject)
                ? "border-primary text-primary"
                : "border-muted hover:border-primary"
            )}
          >
            {subject}
          </Card>
        ))}
      </div>
      {error && <p className="text-red-500 text-sm">{error}</p>}
    </div>
  );
}
