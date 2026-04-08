import { DashboardLayout } from "@/components/DashboardLayout";
import { CalendarDays, CheckCircle2, XCircle, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";

const leaveRequests = [
  { name: "Sarah Chen", type: "Annual Leave", from: "Apr 1", to: "Apr 5", days: 5, reason: "Family vacation", status: "Pending" },
  { name: "Mike Johnson", type: "Sick Leave", from: "Mar 28", to: "Mar 29", days: 2, reason: "Medical appointment", status: "Approved" },
  { name: "Emily Davis", type: "Personal", from: "Apr 10", to: "Apr 10", days: 1, reason: "Personal matters", status: "Pending" },
  { name: "James Wilson", type: "Annual Leave", from: "Mar 20", to: "Mar 25", days: 5, reason: "Travel plans", status: "Approved" },
  { name: "Lisa Park", type: "Sick Leave", from: "Mar 15", to: "Mar 16", days: 2, reason: "Flu", status: "Rejected" },
  { name: "David Brown", type: "Maternity", from: "May 1", to: "Jul 30", days: 90, reason: "Maternity leave", status: "Approved" },
];

const leaveStats = [
  { label: "Pending", value: 12, icon: Clock, color: "text-warning", bg: "bg-warning/10" },
  { label: "Approved", value: 45, icon: CheckCircle2, color: "text-success", bg: "bg-success/10" },
  { label: "Rejected", value: 8, icon: XCircle, color: "text-destructive", bg: "bg-destructive/10" },
  { label: "Total This Month", value: 65, icon: CalendarDays, color: "text-primary", bg: "bg-primary/10" },
];

const Leave = () => (
  <DashboardLayout>
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="page-header">Leave Management</h1>
          <p className="page-subtitle">Review and manage employee leave requests</p>
        </div>
        <Button className="gap-2 h-10">
          <CalendarDays className="h-4 w-4" /> New Leave Request
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {leaveStats.map((s) => (
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

      <div className="glass-card rounded-xl p-6">
        <h3 className="font-semibold text-foreground mb-4">Leave Requests</h3>
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr><th>Employee</th><th>Type</th><th>From</th><th>To</th><th>Days</th><th>Reason</th><th>Status</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {leaveRequests.map((l, i) => (
                <tr key={i}>
                  <td className="font-medium text-foreground">{l.name}</td>
                  <td>{l.type}</td>
                  <td className="text-muted-foreground">{l.from}</td>
                  <td className="text-muted-foreground">{l.to}</td>
                  <td className="font-medium">{l.days}</td>
                  <td className="text-muted-foreground max-w-[200px] truncate">{l.reason}</td>
                  <td>
                    <span className={l.status === "Approved" ? "badge-success" : l.status === "Rejected" ? "badge-danger" : "badge-warning"}>
                      {l.status}
                    </span>
                  </td>
                  <td>
                    {l.status === "Pending" && (
                      <div className="flex gap-1">
                        <button className="p-1.5 rounded-md hover:bg-success/10 text-success transition-colors"><CheckCircle2 className="h-4 w-4" /></button>
                        <button className="p-1.5 rounded-md hover:bg-destructive/10 text-destructive transition-colors"><XCircle className="h-4 w-4" /></button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </DashboardLayout>
);

export default Leave;
