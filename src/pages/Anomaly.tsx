import { DashboardLayout } from "@/components/DashboardLayout";
import { ShieldAlert, AlertTriangle, CheckCircle2, Eye, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";

const anomalies = [
  { id: "ANM001", title: "Unusual overtime pattern", employee: "James Wilson", dept: "Engineering", severity: "High", detected: "Mar 28, 2026", description: "Employee logged 60+ overtime hours in 2 weeks, significantly above department average.", status: "Open" },
  { id: "ANM002", title: "Duplicate salary entry", employee: "System", dept: "Payroll", severity: "Critical", detected: "Mar 27, 2026", description: "Two salary entries detected for same employee in March payroll batch.", status: "Investigating" },
  { id: "ANM003", title: "Ghost employee detected", employee: "Unknown", dept: "HR", severity: "Critical", detected: "Mar 26, 2026", description: "Payroll entry found with no matching employee record in the system.", status: "Open" },
  { id: "ANM004", title: "Attendance mismatch", employee: "Emily Davis", dept: "Marketing", severity: "Medium", detected: "Mar 25, 2026", description: "Check-in time recorded but no check-out for 3 consecutive days.", status: "Resolved" },
  { id: "ANM005", title: "Salary deviation alert", employee: "Tom Harris", dept: "Sales", severity: "Low", detected: "Mar 24, 2026", description: "Salary increased by 35% in single adjustment, flagged for review.", status: "Resolved" },
  { id: "ANM006", title: "Bulk leave pattern", employee: "Multiple", dept: "Operations", severity: "Medium", detected: "Mar 23, 2026", description: "8 employees from same team applied leave for identical dates.", status: "Investigating" },
];

const severityColor = (s: string) => s === "Critical" ? "badge-danger" : s === "High" ? "badge-warning" : s === "Medium" ? "badge-info" : "badge-success";
const statusIcon = (s: string) => s === "Open" ? <AlertTriangle className="h-3.5 w-3.5" /> : s === "Investigating" ? <Eye className="h-3.5 w-3.5" /> : <CheckCircle2 className="h-3.5 w-3.5" />;

const anomalyStats = [
  { label: "Open Anomalies", value: "7", icon: ShieldAlert, color: "text-destructive", bg: "bg-destructive/10" },
  { label: "Investigating", value: "3", icon: Eye, color: "text-warning", bg: "bg-warning/10" },
  { label: "Resolved (Month)", value: "12", icon: CheckCircle2, color: "text-success", bg: "bg-success/10" },
  { label: "Avg Resolution", value: "2.4 days", icon: Clock, color: "text-info", bg: "bg-info/10" },
];

const Anomaly = () => (
  <DashboardLayout>
    <div className="space-y-6">
      <div>
        <h1 className="page-header">Anomaly Detection</h1>
        <p className="page-subtitle">AI-powered payroll and attendance anomaly monitoring</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {anomalyStats.map((s) => (
          <div key={s.label} className="stat-card">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg ${s.bg} flex items-center justify-center`}>
                <s.icon className={`h-5 w-5 ${s.color}`} />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{s.label}</p>
                <p className="text-xl font-bold text-foreground">{s.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="space-y-3">
        {anomalies.map((a) => (
          <div key={a.id} className={`${a.severity === "Critical" ? "anomaly-card" : "glass-card"} rounded-xl p-5`}>
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-mono text-muted-foreground">{a.id}</span>
                  <span className={severityColor(a.severity)}>{a.severity}</span>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    {statusIcon(a.status)}
                    <span>{a.status}</span>
                  </div>
                </div>
                <h4 className="font-semibold text-foreground">{a.title}</h4>
                <p className="text-sm text-muted-foreground mt-1">{a.description}</p>
                <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                  <span>Employee: <span className="font-medium text-foreground">{a.employee}</span></span>
                  <span>Dept: {a.dept}</span>
                  <span>Detected: {a.detected}</span>
                </div>
              </div>
              {a.status !== "Resolved" && (
                <Button variant="outline" size="sm" className="shrink-0">
                  Investigate
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  </DashboardLayout>
);

export default Anomaly;
