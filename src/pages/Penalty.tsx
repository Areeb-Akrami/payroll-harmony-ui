import { DashboardLayout } from "@/components/DashboardLayout";
import { AlertTriangle, DollarSign, Users, FileWarning } from "lucide-react";

const penaltyData = [
  { name: "James Wilson", dept: "Engineering", type: "Late Arrival", amount: "-$200", date: "Mar 26, 2026", occurrences: 5, status: "Applied" },
  { name: "Anna Lee", dept: "Engineering", type: "Unauthorized Absence", amount: "-$500", date: "Mar 24, 2026", occurrences: 2, status: "Applied" },
  { name: "Tom Harris", dept: "Sales", type: "Policy Violation", amount: "-$300", date: "Mar 22, 2026", occurrences: 1, status: "Under Review" },
  { name: "Emily Davis", dept: "Marketing", type: "Late Submission", amount: "-$150", date: "Mar 20, 2026", occurrences: 3, status: "Applied" },
  { name: "Mike Johnson", dept: "Sales", type: "Late Arrival", amount: "-$100", date: "Mar 18, 2026", occurrences: 2, status: "Waived" },
];

const penaltyStats = [
  { label: "Total Penalties", value: "$12.5K", icon: DollarSign, color: "text-destructive", bg: "bg-destructive/10" },
  { label: "Employees Affected", value: "34", icon: Users, color: "text-warning", bg: "bg-warning/10" },
  { label: "Active Warnings", value: "18", icon: AlertTriangle, color: "text-info", bg: "bg-info/10" },
  { label: "Under Review", value: "6", icon: FileWarning, color: "text-primary", bg: "bg-primary/10" },
];

const Penalty = () => (
  <DashboardLayout>
    <div className="space-y-6">
      <div>
        <h1 className="page-header">Penalty System</h1>
        <p className="page-subtitle">Track and manage employee penalties and deductions</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {penaltyStats.map((s) => (
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
        <h3 className="font-semibold text-foreground mb-4">Penalty Records</h3>
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr><th>Employee</th><th>Department</th><th>Type</th><th>Amount</th><th>Date</th><th>Occurrences</th><th>Status</th></tr>
            </thead>
            <tbody>
              {penaltyData.map((p, i) => (
                <tr key={i}>
                  <td className="font-medium text-foreground">{p.name}</td>
                  <td>{p.dept}</td>
                  <td>{p.type}</td>
                  <td className="font-bold text-destructive">{p.amount}</td>
                  <td className="text-muted-foreground">{p.date}</td>
                  <td className="text-center">{p.occurrences}</td>
                  <td>
                    <span className={p.status === "Applied" ? "badge-danger" : p.status === "Under Review" ? "badge-warning" : "badge-info"}>
                      {p.status}
                    </span>
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

export default Penalty;
