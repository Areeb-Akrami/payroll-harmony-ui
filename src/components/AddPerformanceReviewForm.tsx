import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { performanceService, CreatePerformanceRecord } from "@/services/performanceService";
import { X } from "lucide-react";

interface AddPerformanceReviewFormProps {
  employeeId: number;
  employeeName: string;
  period: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export const AddPerformanceReviewForm = ({ employeeId, employeeName, period, onSuccess, onCancel }: AddPerformanceReviewFormProps) => {
  const [kpiScore, setKpiScore] = useState('');
  const [productivity, setProductivity] = useState('');
  const [quality, setQuality] = useState('');
  const [teamwork, setTeamwork] = useState('');
  const [communication, setCommunication] = useState('');
  const [comments, setComments] = useState('');
  const [goals, setGoals] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const scores = { kpiScore, productivity, quality, teamwork, communication };
    for (const [key, value] of Object.entries(scores)) {
        const numValue = Number(value);
        if (value === '' || isNaN(numValue) || numValue < 0 || numValue > 100) {
            setError(`Please enter a valid score (0-100) for the "${key.replace('Score', '')}" field.`);
            return;
        }
    }

    const newPerformanceData: CreatePerformanceRecord = {
      employeeId,
      period,
      kpiScore: Number(kpiScore),
      productivity: Number(productivity),
      quality: Number(quality),
      teamwork: Number(teamwork),
      communication: Number(communication),
      comments,
      reviewedBy: 'Admin', 
      goalsForNextPeriod: goals.split(',').map(s => s.trim()).filter(s => s),
    };

    try {
      performanceService.createPerformanceRecord(newPerformanceData);
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create performance record.');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-background rounded-xl p-6 w-full max-w-lg space-y-4 glass-card max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold">Add Performance Review</h2>
            <p className="text-muted-foreground">For {employeeName} - Period: {period}</p>
          </div>
          <Button variant="ghost" size="icon" onClick={onCancel}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="kpiScore">KPI Score (0-100)</Label>
              <Input id="kpiScore" type="number" min="0" max="100" value={kpiScore} onChange={(e) => setKpiScore(e.target.value)} required />
            </div>
            <div>
              <Label htmlFor="productivity">Productivity (0-100)</Label>
              <Input id="productivity" type="number" min="0" max="100" value={productivity} onChange={(e) => setProductivity(e.target.value)} required />
            </div>
            <div>
              <Label htmlFor="quality">Quality (0-100)</Label>
              <Input id="quality" type="number" min="0" max="100" value={quality} onChange={(e) => setQuality(e.target.value)} required />
            </div>
            <div>
              <Label htmlFor="teamwork">Teamwork (0-100)</Label>
              <Input id="teamwork" type="number" min="0" max="100" value={teamwork} onChange={(e) => setTeamwork(e.target.value)} required />
            </div>
            <div className="md:col-span-2">
              <Label htmlFor="communication">Communication (0-100)</Label>
              <Input id="communication" type="number" min="0" max="100" value={communication} onChange={(e) => setCommunication(e.target.value)} required />
            </div>
          </div>
          <div>
            <Label htmlFor="comments">Comments</Label>
            <Textarea id="comments" value={comments} onChange={(e) => setComments(e.target.value)} placeholder="Enter any comments..."/>
          </div>
          <div>
            <Label htmlFor="goals">Goals for Next Period (comma-separated)</Label>
            <Input id="goals" value={goals} onChange={(e) => setGoals(e.target.value)} placeholder="e.g. Complete training, Lead project"/>
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <div className="flex justify-end gap-2 pt-4 border-t border-border">
            <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
            <Button type="submit">Submit Review</Button>
          </div>
        </form>
      </div>
    </div>
  );
};