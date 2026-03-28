import { DashboardLayout } from "@/components/DashboardLayout";
import { DollarSign, Download, Search, CreditCard, Wallet, Receipt } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";

const payrollData = [
  { id: "PAY001", name: "Sarah Chen", base: "$7,000", overtime: "$800", bonus: "$700", deductions: "$1,200", net: "$7,300", status: "Paid" },
  { id: "PAY002", name: "Mike Johnson", base: "$6,000", overtime: "$400", bonus: "$800", deductions: "$1,000", net: "$6,200", status: "Paid" },
  { id: "PAY003", name: "Emily Davis", base: "$5,500", overtime: "$0", bonus: "$1,300", deductions: "$900", net: "$5,900", status: "Pending" },
  { id: "PAY004", name: "James Wilson", base: "$7,500", overtime: "$1,200", bonus: "$400", deductions: "$1,400", net: "$7,700", status: "Paid" },
  { id: "PAY005", name: "Lisa Park", base: "$4,800", overtime: "$200", bonus: "$900", deductions: "$800", net: "$5,100", status: "Processing" },
  { id: "PAY006", name: "David Brown", base: "$6,500", overtime: "$600", bonus: "$700", deductions: "$1,100", net: "$6,700", status: "Paid" },
];

const payrollStats = [
  { label: "Total Payroll", value: "$2.4M", icon: DollarSign, color: "text-primary", bg: "bg-primary/10" },
  { label: "Net Disbursed", value: "$2.1M", icon: CreditCard, color: "text-success", bg: "bg-success/10" },
  { label: "Total Deductions", value: "$320K", icon: Wallet, color: "text-warning", bg: "bg-warning/10" },
  { label: "Pending", value: "23", icon: Receipt, color: "text-info", bg: "bg-info/10" },
];

const Payroll = () => {
  const [search, setSearch] = useState("");
  const filtered = payrollData.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="page-header">Salary & Payroll</h1>
            <p className="page-subtitle">March 2026 payroll processing</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="gap-2 h-10"><Download className="h-4 w-4" /> Export</Button>
            <Button className="gap-2 h-10"><DollarSign className="h-4 w-4" /> Run Payroll</Button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {payrollStats.map((s) => (
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
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search payroll..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 h-10 bg-muted/50 border-0" />
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr><th>ID</th><th>Employee</th><th>Base</th><th>Overtime</th><th>Bonus</th><th>Deductions</th><th>Net Pay</th><th>Status</th></tr>
              </thead>
              <tbody>
                {filtered.map((p) => (
                  <tr key={p.id}>
                    <td className="text-muted-foreground font-mono text-xs">{p.id}</td>
                    <td className="font-medium text-foreground">{p.name}</td>
                    <td>{p.base}</td>
                    <td>{p.overtime}</td>
                    <td className="text-success font-medium">{p.bonus}</td>
                    <td className="text-destructive">{p.deductions}</td>
                    <td className="font-bold text-foreground">{p.net}</td>
                    <td>
                      <span className={p.status === "Paid" ? "badge-success" : p.status === "Pending" ? "badge-warning" : "badge-info"}>
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
};

export default Payroll;
