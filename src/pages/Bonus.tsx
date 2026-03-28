import { DashboardLayout } from "@/components/DashboardLayout";
import { Gift, DollarSign, Users, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";

const bonusData = [
  { name: "Sarah Chen", dept: "Engineering", type: "Performance", amount: "$2,500", quarter: "Q1 2026", status: "Paid" },
  { name: "Mike Johnson", dept: "Sales", type: "Sales Target", amount: "$3,200", quarter: "Q1 2026", status: "Paid" },
  { name: "Emily Davis", dept: "Marketing", type: "Project Completion", amount: "$1,800", quarter: "Q1 2026", status: "Pending" },
  { name: "James Wilson", dept: "Engineering", type: "Innovation", amount: "$1,500", quarter: "Q1 2026", status: "Approved" },
  { name: "Lisa Park", dept: "HR", type: "Performance", amount: "$1,200", quarter: "Q1 2026", status: "Paid" },
  { name: "David Brown", dept: "Operations", type: "Efficiency", amount: "$2,000", quarter: "Q1 2026", status: "Pending" },
];

const bonusStats = [
  { label: "Total Bonus Pool", value: "$185K", icon: DollarSign, color: "text-primary", bg: "bg-primary/10" },
  { label: "Recipients", value: "156", icon: Users, color: "text-success", bg: "bg-success/10" },
  { label: "Avg Bonus", value: "$1,186", icon: Gift, color: "text-warning", bg: "bg-warning/10" },
  { label: "YoY Change", value: "+12%", icon: TrendingUp, color: "text-info", bg: "bg-info/10" },
];

const Bonus = () => (
  <DashboardLayout>
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="page-header">Bonus Management</h1>
          <p className="page-subtitle">Manage employee bonuses and incentives</p>
        </div>
        <Button className="gap-2 h-10"><Gift className="h-4 w-4" /> Award Bonus</Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {bonusStats.map((s) => (
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
        <h3 className="font-semibold text-foreground mb-4">Bonus Records</h3>
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr><th>Employee</th><th>Department</th><th>Type</th><th>Amount</th><th>Quarter</th><th>Status</th></tr>
            </thead>
            <tbody>
              {bonusData.map((b, i) => (
                <tr key={i}>
                  <td className="font-medium text-foreground">{b.name}</td>
                  <td>{b.dept}</td>
                  <td>{b.type}</td>
                  <td className="font-bold text-success">{b.amount}</td>
                  <td className="text-muted-foreground">{b.quarter}</td>
                  <td>
                    <span className={b.status === "Paid" ? "badge-success" : b.status === "Approved" ? "badge-info" : "badge-warning"}>
                      {b.status}
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

export default Bonus;
