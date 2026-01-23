"use client";

import { useState, useEffect } from "react";
import { Student } from "@/types/student";
import { X, Mail, Phone, FileText, Briefcase, Users, MessageSquare, MapPin, GraduationCap, Star } from "lucide-react";
import { AutoReviewButton } from "./AutoReviewButton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface StudentDetailProps {
  student: Student | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (student: Student) => void;
}

/**
 * Detailed view of a student with ability to update group, feedback, and scores
 */
export function StudentDetail({ student, isOpen, onClose, onUpdate }: StudentDetailProps) {
  const [group, setGroup] = useState(student?.group || "");
  const [feedback, setFeedback] = useState(student?.feedback || "");
  const [resumeScore, setResumeScore] = useState<number>(student?.resumeScore || 0);
  const [resumeStructure, setResumeStructure] = useState<string>(student?.resumeStructure || "");
  const [resumeProjects, setResumeProjects] = useState<string>(student?.resumeProjects || "");
  const [projectScore, setProjectScore] = useState<number>(student?.projectScore || 0);
  const [projectDifficulty, setProjectDifficulty] = useState<"easy" | "medium" | "hard" | "">(
    student?.projectDifficulty || ""
  );
  const [projectReview, setProjectReview] = useState<string>(student?.projectReview || "");

  // Update state when student changes
  useEffect(() => {
    if (student) {
      setGroup(student.group || "");
      setFeedback(student.feedback || "");
      setResumeScore(student.resumeScore || 0);
      setResumeStructure(student.resumeStructure || "");
      setResumeProjects(student.resumeProjects || "");
      setProjectScore(student.projectScore || 0);
      setProjectDifficulty(student.projectDifficulty || "");
      setProjectReview(student.projectReview || "");
    }
  }, [student]);

  if (!student) return null;

  const handleSave = () => {
    if (!student) return;
    
    onUpdate({
      ...student,
      group,
      feedback,
      resumeScore,
      resumeStructure,
      resumeProjects,
      projectScore,
      projectDifficulty: projectDifficulty || undefined,
      projectReview,
    });
    onClose();
  };

  const handleAutoReviewComplete = (review: {
    resumeScore: number;
    resumeStructure: string;
    resumeProjects: string;
    projectScore: number;
    projectDifficulty: "easy" | "medium" | "hard";
    projectReview: string;
  }) => {
    setResumeScore(review.resumeScore);
    setResumeStructure(review.resumeStructure);
    setResumeProjects(review.resumeProjects);
    setProjectScore(review.projectScore);
    setProjectDifficulty(review.projectDifficulty);
    setProjectReview(review.projectReview);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Student Details</span>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Basic Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Name</Label>
                <Input value={student.name || ""} disabled />
              </div>
              <div>
                <Label>Status</Label>
                <Input value={student.rawStatus || student.status.charAt(0).toUpperCase() + student.status.slice(1).replace(/_/g, " ")} disabled />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {student.campus && (
                <div>
                  <Label className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Campus
                  </Label>
                  <Input value={student.campus} disabled />
                </div>
              )}
              {student.school && (
                <div>
                  <Label className="flex items-center gap-2">
                    <GraduationCap className="h-4 w-4" />
                    School
                  </Label>
                  <Input value={student.school} disabled />
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Email
                </Label>
                <Input value={student.email || ""} disabled />
              </div>
              <div>
                <Label className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  Contact Details
                </Label>
                {student.phone ? (
                  <a
                    href={`tel:${String(student.phone).replace(/\s/g, "").replace(/\+/g, "").replace(/-/g, "")}`}
                    className="block mt-1 p-3 bg-muted rounded-md text-cyan-600 dark:text-cyan-400 hover:underline"
                  >
                    {student.phone}
                  </a>
                ) : (
                  <Input value="N/A" disabled />
                )}
              </div>
            </div>
          </div>

          {/* Resume & Projects */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-lg">Resume & Projects Review</h3>
              <AutoReviewButton student={student} onReviewComplete={handleAutoReviewComplete} />
            </div>
            
            {/* Resume Section */}
            <div className="space-y-3">
              {student.resume && (
                <div>
                  <Label className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Resume
                  </Label>
                  <div className="mt-1 p-3 bg-muted rounded-md">
                    {student.resume.startsWith("http") ? (
                      <a
                        href={student.resume}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-cyan-600 dark:text-cyan-400 hover:underline"
                      >
                        {student.resume}
                      </a>
                    ) : (
                      <span className="text-sm">{student.resume}</span>
                    )}
                  </div>
                </div>
              )}
              
              <div>
                <Label className="flex items-center gap-2">
                  <Star className="h-4 w-4" />
                  Resume Score (0-10)
                </Label>
                <Input
                  type="number"
                  min="0"
                  max="10"
                  value={resumeScore}
                  onChange={(e) => setResumeScore(Number(e.target.value))}
                  placeholder="Enter score 0-10"
                />
              </div>

              <div>
                <Label>Resume Structure Review</Label>
                <textarea
                  value={resumeStructure}
                  onChange={(e) => setResumeStructure(e.target.value)}
                  placeholder="Automated review of resume structure..."
                  className="w-full min-h-[80px] rounded-md border border-input bg-background px-3 py-2 text-sm"
                />
              </div>

              <div>
                <Label>Resume Projects Review</Label>
                <textarea
                  value={resumeProjects}
                  onChange={(e) => setResumeProjects(e.target.value)}
                  placeholder="Automated review of projects in resume..."
                  className="w-full min-h-[80px] rounded-md border border-input bg-background px-3 py-2 text-sm"
                />
              </div>
            </div>

            {/* Projects Section */}
            <div className="space-y-3">
              {student.projects && (
                <div>
                  <Label className="flex items-center gap-2">
                    <Briefcase className="h-4 w-4" />
                    Projects
                  </Label>
                  <div className="mt-1 p-3 bg-muted rounded-md">
                    <p className="text-sm whitespace-pre-wrap">{student.projects}</p>
                  </div>
                </div>
              )}
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Project Score (0-10)</Label>
                  <Input
                    type="number"
                    min="0"
                    max="10"
                    value={projectScore}
                    onChange={(e) => setProjectScore(Number(e.target.value))}
                    placeholder="Enter score 0-10"
                  />
                </div>
                <div>
                  <Label>Project Difficulty</Label>
                  <Select value={projectDifficulty} onValueChange={(value: "easy" | "medium" | "hard") => setProjectDifficulty(value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select difficulty" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="easy">Easy</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="hard">Hard</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label>Project Review</Label>
                <textarea
                  value={projectReview}
                  onChange={(e) => setProjectReview(e.target.value)}
                  placeholder="Automated review of project quality and complexity..."
                  className="w-full min-h-[80px] rounded-md border border-input bg-background px-3 py-2 text-sm"
                />
              </div>
            </div>
          </div>

          {/* Group Assignment */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <Users className="h-5 w-5" />
              Group Assignment
            </h3>
            <div>
              <Label>Assign to Group</Label>
              <Input
                value={group}
                onChange={(e) => setGroup(e.target.value)}
                placeholder="Enter group name (e.g., Group A, Batch 2024)"
              />
            </div>
          </div>

          {/* Feedback */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Feedback
            </h3>
            <div>
              <Label>Add Feedback</Label>
              <textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="Enter your feedback for this student..."
                className="w-full min-h-[100px] rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              className="bg-cyan-600 hover:bg-cyan-700 dark:bg-cyan-500 dark:hover:bg-cyan-600 text-white"
            >
              Save Changes
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

