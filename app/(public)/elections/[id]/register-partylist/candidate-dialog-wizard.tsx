import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { StudentIdInput } from "@/components/ui/student-id-input";
import { ContactNumberInput } from "@/components/ui/contact-number-input";
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
import { ChevronLeft, X } from "lucide-react";
import { calculateAgeFromBirthDate } from "@/lib/utils";
import type { CourseOption, PartylistRegistrationCandidateDraft } from "@/lib/types/public";
import validateCandidate from "./validate-candidate";

export interface CandidateDialogWizardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData: PartylistRegistrationCandidateDraft;
  initialScreeningAnswers: {
    bonafide: boolean | null;
    failingGrades: boolean | null;
    amaranth: boolean | null;
    convicted: boolean | null;
  };
  courses: CourseOption[];
  positionTitle: string;
  electionType: string;
  ownerFacultyCode?: string | null;
  onSave: (candidate: PartylistRegistrationCandidateDraft, answers: any) => void;
}

export default function CandidateDialogWizard({
  open,
  onOpenChange,
  initialData,
  initialScreeningAnswers,
  courses,
  positionTitle,
  electionType,
  ownerFacultyCode,
  onSave,
}: CandidateDialogWizardProps) {
  const [dialogStep, setDialogStep] = useState<"screening" | "details">("screening");
  const [dialogScreeningStep, setDialogScreeningStep] = useState(0);
  const [dialogScreeningPassed, setDialogScreeningPassed] = useState<boolean | null>(null);
  const [dialogError, setDialogError] = useState<string | null>(null);
  
  const [dialogCandidateData, setDialogCandidateData] = useState<PartylistRegistrationCandidateDraft>(initialData);
  const [dialogScreeningAnswers, setDialogScreeningAnswers] = useState(initialScreeningAnswers);

  // Sync state if initialData changes
  // Not strictly necessary if we unmount the component when hidden, but good practice.
  // We'll rely on the parent providing fresh key or initialData when opened.

  const handleDialogScreeningAnswer = (field: 'bonafide' | 'failingGrades' | 'amaranth' | 'convicted', value: boolean) => {
    const updated = { ...dialogScreeningAnswers, [field]: value };
    setDialogScreeningAnswers(updated);

    if (field === 'bonafide' && value === false) {
      setDialogScreeningPassed(false);
      return;
    }
    if (field === 'amaranth' && value === true) {
      setDialogScreeningPassed(false);
      return;
    }
    if (field === 'convicted' && value === true) {
      setDialogScreeningPassed(false);
      return;
    }

    if (dialogScreeningStep < 3) {
      setDialogScreeningStep(prev => prev + 1);
    } else {
      setDialogScreeningPassed(true);
      setDialogStep('details');
    }
  };

  const handleDialogBack = () => {
    if (dialogScreeningStep > 0) {
      setDialogScreeningStep(prev => prev - 1);
    }
  };

  const handlePhotoUploadInDialog = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const MAX_DIMENSION = 300;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_DIMENSION) {
            height *= MAX_DIMENSION / width;
            width = MAX_DIMENSION;
          }
        } else {
          if (height > MAX_DIMENSION) {
            width *= MAX_DIMENSION / height;
            height = MAX_DIMENSION;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const compressedBase64 = canvas.toDataURL("image/jpeg", 0.7);
          setDialogCandidateData((prev) => ({
            ...prev,
            photo: compressedBase64,
          }));
        } else {
          setDialogCandidateData((prev) => ({
            ...prev,
            photo: String(reader.result || ""),
          }));
        }
      };
      img.src = String(reader.result || "");
    };
    reader.readAsDataURL(file);
  };

  const handleSaveCandidate = () => {
    const validationError = validateCandidate(positionTitle, dialogCandidateData, electionType, ownerFacultyCode, courses);
    
    if (validationError) {
      setDialogError(validationError);
      return;
    }
    
    onSave(dialogCandidateData, dialogScreeningAnswers);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader className="border-b pb-4 mb-4 relative">
          <DialogTitle className="text-xl">
            {dialogStep === 'screening' ? 'Nominee Eligibility Screening' : 'Nominee Application Form'}
          </DialogTitle>
          {dialogStep === 'screening' && dialogScreeningPassed === null && (
            <p className="text-sm text-muted-foreground mt-1 font-medium">
              Step {dialogScreeningStep + 1} of 4: Eligibility Check
            </p>
          )}
          {dialogStep === 'details' && (
            <p className="text-sm text-muted-foreground mt-1 font-medium">
              Complete the application details for this nominee.
            </p>
          )}
        </DialogHeader>

        {dialogStep === 'screening' && (
          <div className="py-6 flex flex-col items-center justify-center min-h-[300px] relative">
            {dialogScreeningStep > 0 && dialogScreeningPassed === null && (
              <Button 
                variant="ghost" 
                size="icon" 
                className="absolute left-0 top-0" 
                onClick={handleDialogBack}
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
            )}

            {dialogScreeningPassed === null ? (
              <div className="w-full max-w-md text-center space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                {dialogScreeningStep === 0 && (
                  <div className="space-y-6">
                    <div className="bg-primary/5 p-4 rounded-full w-20 h-20 mx-auto flex items-center justify-center">
                      <span className="text-2xl font-bold text-primary">1</span>
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-xl font-semibold">Bonafide Student?</h3>
                      <p className="text-muted-foreground">Are you a bonafide student of the Visayas State University?</p>
                    </div>
                    <div className="flex gap-4 justify-center">
                      <Button size="lg" className="w-28 font-bold" onClick={() => handleDialogScreeningAnswer('bonafide', true)}>Yes</Button>
                      <Button size="lg" variant="outline" className="w-28 font-bold" onClick={() => handleDialogScreeningAnswer('bonafide', false)}>No</Button>
                    </div>
                  </div>
                )}
                
                {dialogScreeningStep === 1 && (
                  <div className="space-y-6">
                    <div className="bg-primary/5 p-4 rounded-full w-20 h-20 mx-auto flex items-center justify-center">
                      <span className="text-2xl font-bold text-primary">2</span>
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-xl font-semibold">Academic Standing</h3>
                      <p className="text-muted-foreground">Do you have two (2) or more failing grades?</p>
                    </div>
                    <div className="flex gap-4 justify-center">
                      <Button size="lg" variant="outline" className="w-28 font-bold" onClick={() => handleDialogScreeningAnswer('failingGrades', true)}>Yes</Button>
                      <Button size="lg" className="w-28 font-bold" onClick={() => handleDialogScreeningAnswer('failingGrades', false)}>No</Button>
                    </div>
                  </div>
                )}

                {dialogScreeningStep === 2 && (
                  <div className="space-y-6">
                    <div className="bg-primary/5 p-4 rounded-full w-20 h-20 mx-auto flex items-center justify-center">
                      <span className="text-2xl font-bold text-primary">3</span>
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-xl font-semibold">Publication Affiliation</h3>
                      <p className="text-muted-foreground">Are you currently a staff member of the Amaranth?</p>
                    </div>
                    <div className="flex gap-4 justify-center">
                      <Button size="lg" variant="outline" className="w-28 font-bold" onClick={() => handleDialogScreeningAnswer('amaranth', true)}>Yes</Button>
                      <Button size="lg" className="w-28 font-bold" onClick={() => handleDialogScreeningAnswer('amaranth', false)}>No</Button>
                    </div>
                  </div>
                )}

                {dialogScreeningStep === 3 && (
                  <div className="space-y-6">
                    <div className="bg-primary/5 p-4 rounded-full w-20 h-20 mx-auto flex items-center justify-center">
                      <span className="text-2xl font-bold text-primary">4</span>
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-xl font-semibold">Disciplinary Record</h3>
                      <p className="text-muted-foreground">Have you been convicted of any offense carrying a penalty of more than 30 days suspension?</p>
                    </div>
                    <div className="flex gap-4 justify-center">
                      <Button size="lg" variant="outline" className="w-28 font-bold" onClick={() => handleDialogScreeningAnswer('convicted', true)}>Yes</Button>
                      <Button size="lg" className="w-28 font-bold" onClick={() => handleDialogScreeningAnswer('convicted', false)}>No</Button>
                    </div>
                  </div>
                )}
              </div>
            ) : dialogScreeningPassed === false ? (
              <div className="w-full max-w-md text-center space-y-6 animate-in zoom-in-95 duration-300">
                <div className="bg-destructive/10 p-6 rounded-full w-24 h-24 mx-auto flex items-center justify-center">
                  <X className="w-12 h-12 text-destructive" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-2xl font-bold text-destructive">Not Eligible</h3>
                  <p className="text-muted-foreground">Based on your answers, this nominee is not eligible to run for this position according to the election guidelines.</p>
                </div>
                <Button variant="outline" className="w-full mt-4" onClick={() => onOpenChange(false)}>
                  Close
                </Button>
              </div>
            ) : null}
          </div>
        )}

        {dialogStep === 'details' && (
          <div className="space-y-4 py-2">
            {dialogError && (
              <div className="bg-destructive/10 text-destructive text-xs p-3 rounded border border-destructive/20 font-medium">
                {dialogError}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label className="text-xs font-bold uppercase">Full Name *</Label>
                <Input
                  value={dialogCandidateData.full_name}
                  onChange={(event) =>
                    setDialogCandidateData(prev => ({ ...prev, full_name: event.target.value }))
                  }
                  placeholder="Last Name, First Name, Middle Name"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-bold uppercase">Student ID *</Label>
                <StudentIdInput
                  value={dialogCandidateData.student_id}
                  onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                    setDialogCandidateData(prev => ({ ...prev, student_id: event.target.value }))
                  }
                  placeholder="23-1-01457"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label className="text-xs font-bold uppercase">Email *</Label>
                <Input
                  type="email"
                  value={dialogCandidateData.email}
                  onChange={(event) =>
                    setDialogCandidateData(prev => ({ ...prev, email: event.target.value }))
                  }
                  placeholder="candidate@vsu.edu.ph"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-bold uppercase">Contact Number *</Label>
                <ContactNumberInput
                  value={dialogCandidateData.contact_number}
                  onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                    setDialogCandidateData(prev => ({ ...prev, contact_number: event.target.value }))
                  }
                  placeholder="09XXXXXXXXX"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1 md:col-span-2">
                <Label className="text-xs font-bold uppercase">Date of Birth *</Label>
                <Input
                  type="date"
                  value={dialogCandidateData.birth_date}
                  onChange={(event) =>
                    setDialogCandidateData(prev => ({
                      ...prev,
                      birth_date: event.target.value,
                      age: calculateAgeFromBirthDate(event.target.value),
                    }))
                  }
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-bold uppercase">Age (Auto-computed)</Label>
                <Input 
                  value={calculateAgeFromBirthDate(dialogCandidateData.birth_date) || ""} 
                  readOnly 
                  className="bg-muted/60" 
                />
              </div>
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-bold uppercase">Course / Degree Program *</Label>
              <Select
                value={dialogCandidateData.course_id}
                onValueChange={(value) => {
                  const selected = courses.find((course) => course.course_id === value);
                  setDialogCandidateData(prev => ({
                    ...prev,
                    course_id: value,
                    faculty: selected?.faculty_name || "",
                    department: selected?.department_name || "",
                  }));
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a course" />
                </SelectTrigger>
                <SelectContent>
                  {courses.map((course) => (
                    <SelectItem key={course.course_id} value={course.course_id}>
                      {course.acronym
                        ? `${course.acronym} - ${course.name}`
                        : course.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {dialogCandidateData.course_id && (
                <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">
                  {dialogCandidateData.faculty} / {dialogCandidateData.department}
                </p>
              )}
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-bold uppercase">Current Address *</Label>
              <Input
                value={dialogCandidateData.current_address}
                onChange={(event) =>
                  setDialogCandidateData(prev => ({ ...prev, current_address: event.target.value }))
                }
                placeholder="Current address"
              />
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-bold uppercase">Permanent Address *</Label>
              <Input
                value={dialogCandidateData.permanent_address}
                onChange={(event) =>
                  setDialogCandidateData(prev => ({ ...prev, permanent_address: event.target.value }))
                }
                placeholder="Permanent address"
              />
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-bold uppercase">1x1 Photo *</Label>
              <Input
                type="file"
                accept="image/*"
                onChange={handlePhotoUploadInDialog}
                className="cursor-pointer border border-input bg-background file:border-r file:border-input file:bg-muted file:px-3 file:mr-3 hover:bg-muted/10 transition-all text-xs"
              />
              {dialogCandidateData.photo && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={dialogCandidateData.photo}
                  alt="Nominee preview"
                  className="w-12 h-12 rounded object-cover border mt-1"
                />
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1">
                <Label className="text-xs font-bold uppercase">COG Link *</Label>
                <Input
                  value={dialogCandidateData.cog_link}
                  onChange={(event) =>
                    setDialogCandidateData(prev => ({ ...prev, cog_link: event.target.value }))
                  }
                  placeholder="https://..."
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-bold uppercase">COR Link *</Label>
                <Input
                  value={dialogCandidateData.cor_link}
                  onChange={(event) =>
                    setDialogCandidateData(prev => ({ ...prev, cor_link: event.target.value }))
                  }
                  placeholder="https://..."
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-bold uppercase">Good Moral Link *</Label>
                <Input
                  value={dialogCandidateData.good_moral_link}
                  onChange={(event) =>
                    setDialogCandidateData(prev => ({ ...prev, good_moral_link: event.target.value }))
                  }
                  placeholder="https://..."
                />
              </div>
            </div>

            <div className="flex gap-2 justify-end pt-4 border-t">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="button" onClick={handleSaveCandidate}>
                Save Nominee
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
