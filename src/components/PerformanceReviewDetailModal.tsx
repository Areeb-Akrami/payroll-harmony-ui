
import { PerformanceRecord } from "@/services/performanceService";
import { Button } from "./ui/button";
import { X } from "lucide-react";

interface PerformanceReviewDetailModalProps {
  record: PerformanceRecord;
  employeeName: string;
  onClose: () => void;
}

const PerformanceReviewDetailModal = ({ record, employeeName, onClose }: PerformanceReviewDetailModalProps) => {
  if (!record) return null;

  const getRatingColor = (rating: PerformanceRecord['rating']) => {
    switch (rating) {
      case 'Excellent': return 'text-green-500';
      case 'Good': return 'text-blue-500';
      case 'Satisfactory': return 'text-yellow-500';
      case 'Needs Improvement': return 'text-orange-500';
      case 'Poor': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
      <div className="bg-background rounded-xl p-6 w-full max-w-2xl space-y-4 glass-card">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold">Performance Review Details</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="font-medium">Employee: <span className="font-normal text-muted-foreground">{employeeName}</span></div>
          <div className="font-medium">Period: <span className="font-normal text-muted-foreground">{record.period}</span></div>
          <div className="font-medium">Overall Score: <span className={`font-bold ${getRatingColor(record.rating)}`}>{record.overallScore}/100</span></div>
          <div className="font-medium">Rating: <span className={`font-bold ${getRatingColor(record.rating)}`}>{record.rating}</span></div>
        </div>

        <div className="space-y-2">
            <h3 className="font-semibold">Scores:</h3>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li>KPI Score: {record.kpiScore}</li>
                <li>Productivity: {record.productivity}</li>
                <li>Quality of Work: {record.quality}</li>
                <li>Teamwork & Collaboration: {record.teamwork}</li>
                <li>Communication Skills: {record.communication}</li>
            </ul>
        </div>

        {record.comments && (
          <div className="space-y-2">
            <h3 className="font-semibold">Comments:</h3>
            <p className="text-muted-foreground">{record.comments}</p>
          </div>
        )}

        {record.goalsForNextPeriod && record.goalsForNextPeriod.length > 0 && (
            <div className="space-y-2">
                <h3 className="font-semibold">Goals for Next Period:</h3>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                    {record.goalsForNextPeriod.map((goal, index) => (
                        <li key={index}>{goal}</li>
                    ))}
                </ul>
            </div>
        )}

        <div className="text-sm text-muted-foreground pt-4 border-t border-border">
          Reviewed by {record.reviewedBy} on {new Date(record.reviewDate).toLocaleDateString()}
        </div>

        <div className="text-right">
          <Button onClick={onClose}>Close</Button>
        </div>
      </div>
    </div>
  );
};

export default PerformanceReviewDetailModal;