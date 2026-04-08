import { DashboardLayout } from "@/components/DashboardLayout";
import { CalendarDays, CheckCircle2, XCircle, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { leaveService, LeaveRequest } from "@/services/leaveService";
import { Modal } from "@/components/Modal";
import { CreateLeaveRequestForm } from "@/components/CreateLeaveRequestForm";

const Leave = () => {
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchLeaves = () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = leaveService.getAllLeaves();
      setLeaves(data);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to fetch leaves');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaves();
  }, []);

  const handleUpdateStatus = (id: number, status: "Approved" | "Rejected") => {
    try {
      leaveService.updateLeaveStatus(id, { status });
      fetchLeaves(); // Refetch leaves to update the UI
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to update leave status');
    }
  };

  const statusCounts = leaves.reduce(
    (acc, leave) => {
      acc[leave.status] = (acc[leave.status] || 0) + 1;
      return acc;
    },
    { Pending: 0, Approved: 0, Rejected: 0 }
  );

  const totalThisMonth = leaves.filter(leave => {
    const startDate = new Date(leave.startDate);
    const now = new Date();
    return startDate.getMonth() === now.getMonth() && startDate.getFullYear() === now.getFullYear();
  }).length;

  const leaveStats = [
    { label: "Pending", value: statusCounts.Pending, icon: Clock, color: "text-warning", bg: "bg-warning/10" },
    { label: "Approved", value: statusCounts.Approved, icon: CheckCircle2, color: "text-success", bg: "bg-success/10" },
    { label: "Rejected", value: statusCounts.Rejected, icon: XCircle, color: "text-destructive", bg: "bg-destructive/10" },
    { label: "Total This Month", value: totalThisMonth, icon: CalendarDays, color: "text-primary", bg: "bg-primary/10" },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="page-header">Leave Management</h1>
            <p className="page-subtitle">Review and manage employee leave requests</p>
          </div>
          <Modal
            isOpen={isModalOpen}
            onOpenChange={setIsModalOpen}
            trigger={
              <Button onClick={() => setIsModalOpen(true)} className="gap-2 h-10">
                <CalendarDays className="h-4 w-4" /> New Leave Request
              </Button>
            }
            title="Create New Leave Request"
          >
            <CreateLeaveRequestForm
              onFinished={() => {
                setIsModalOpen(false);
                fetchLeaves();
              }}
            />
          </Modal>
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
                {isLoading ? (
                  <tr>
                    <td colSpan={8} className="text-center py-12">Loading...</td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td colSpan={8} className="text-center py-12 text-red-500">Error: {error}</td>
                  </tr>
                ) : (
                  leaves.map((l) => (
                    <tr key={l.id}>
                      <td className="font-medium text-foreground">{l.employeeName}</td>
                      <td>{l.type}</td>
                      <td className="text-muted-foreground">{new Date(l.startDate).toLocaleDateString()}</td>
                      <td className="text-muted-foreground">{new Date(l.endDate).toLocaleDateString()}</td>
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
                            <button onClick={() => handleUpdateStatus(l.id, "Approved")} className="p-1.5 rounded-md hover:bg-success/10 text-success transition-colors"><CheckCircle2 className="h-4 w-4" /></button>
                            <button onClick={() => handleUpdateStatus(l.id, "Rejected")} className="p-1.5 rounded-md hover:bg-destructive/10 text-destructive transition-colors"><XCircle className="h-4 w-4" /></button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Leave;