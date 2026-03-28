import { DashboardLayout } from "@/components/DashboardLayout";
import { Users, DollarSign, Clock, ShieldAlert, TrendingUp, TrendingDown } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const stats = [
  { label: "Total Employees", value: "1,248", change: "+12", up: true, icon: Users, color: "text-primary", bg: "bg-primary/10" },
  { label: "Monthly Payroll", value: "$2.4M", change: "+3.2%", up: true, icon: DollarSign, color: "text-success", bg: "bg-success/10" },
  { label: "Attendance Rate", value: "94.7%", change: "-0.5%", up: false, icon: Clock, color: "text-info", bg: "bg-info/10" },
  { label: "Anomalies", value: "7", change: "+2", up: true, icon: ShieldAlert, color: "text-destructive", bg: "bg-destructive/10" },
];

const barData = [
  { month: "Jan", salary: 2100000, bonus: 180000 },
  { month: "Feb", salary: 2150000, bonus: 120000 },
  { month: "Mar", salary: 2200000, bonus: 250000 },
  { month: "Apr", salary: 2180000, bonus: 160000 },
  { month: "May", salary: 2300000, bonus: 200000 },
  { month: "Jun", salary: 2400000, bonus: 280000 },
];

const pieData = [
  { name: "Engineering", value: 420, color: "hsl(217, 91%, 50%)" },
  { name: "Sales", value: 280, color: "hsl(142, 71%, 45%)" },
  { name: "Marketing", value: 180, color: "hsl(38, 92%, 50%)" },
  { name: "HR", value: 120, color: "hsl(199, 89%, 48%)" },
  { name: "Operations", value: 248, color: "hsl(280, 65%, 60%)" },
];

const recentActivity = [
  { employee: "Sarah Chen", action: "Salary processed", amount: "$8,500", date: "Mar 28, 2026", status: "Completed" },
  { employee: "Mike Johnson", action: "Leave approved", amount: "—", date: "Mar 27, 2026", status: "Approved" },
  { employee: "Emily Davis", action: "Bonus awarded", amount: "$1,200", date: "Mar 27, 2026", status: "Completed" },
  { employee: "James Wilson", action: "Penalty applied", amount: "-$200", date: "Mar 26, 2026", status: "Pending" },
  { employee: "Lisa Park", action: "Overtime logged", amount: "$450", date: "Mar 26, 2026", status: "Completed" },
];

const Dashboard = () => {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="page-header">Dashboard</h1>
          <p className="page-subtitle">Overview of your payroll management system</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, i) => (
            <div key={stat.label} className="stat-card" style={{ animationDelay: `${i * 80}ms` }}>
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground font-medium">{stat.label}</p>
                  <p className="text-2xl font-bold mt-1 text-foreground">{stat.value}</p>
                  <div className="flex items-center gap-1 mt-2">
                    {stat.up ? <TrendingUp className="h-3.5 w-3.5 text-success" /> : <TrendingDown className="h-3.5 w-3.5 text-destructive" />}
                    <span className={`text-xs font-medium ${stat.up && stat.label !== "Anomalies" ? "text-success" : "text-destructive"}`}>{stat.change}</span>
                    <span className="text-xs text-muted-foreground">vs last month</span>
                  </div>
                </div>
                <div className={`w-10 h-10 rounded-lg ${stat.bg} flex items-center justify-center`}>
                  <stat.icon className={`h-5 w-5 ${stat.color}`} />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 glass-card rounded-xl p-6">
            <h3 className="font-semibold text-foreground mb-4">Payroll Overview</h3>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(214, 20%, 90%)" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="hsl(215, 16%, 47%)" />
                <YAxis tick={{ fontSize: 12 }} stroke="hsl(215, 16%, 47%)" tickFormatter={(v) => `$${v / 1000000}M`} />
                <Tooltip formatter={(value: number) => [`$${(value / 1000).toFixed(0)}K`, ""]} />
                <Bar dataKey="salary" fill="hsl(217, 91%, 50%)" radius={[4, 4, 0, 0]} name="Salary" />
                <Bar dataKey="bonus" fill="hsl(142, 71%, 45%)" radius={[4, 4, 0, 0]} name="Bonus" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="glass-card rounded-xl p-6">
            <h3 className="font-semibold text-foreground mb-4">Department Distribution</h3>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" stroke="none">
                  {pieData.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-2 mt-2">
              {pieData.map((d) => (
                <div key={d.name} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: d.color }} />
                    <span className="text-muted-foreground">{d.name}</span>
                  </div>
                  <span className="font-medium text-foreground">{d.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="glass-card rounded-xl p-6">
          <h3 className="font-semibold text-foreground mb-4">Recent Activity</h3>
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Action</th>
                  <th>Amount</th>
                  <th>Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {recentActivity.map((a, i) => (
                  <tr key={i}>
                    <td className="font-medium text-foreground">{a.employee}</td>
                    <td>{a.action}</td>
                    <td className="font-medium">{a.amount}</td>
                    <td className="text-muted-foreground">{a.date}</td>
                    <td>
                      <span className={a.status === "Completed" ? "badge-success" : a.status === "Approved" ? "badge-info" : "badge-warning"}>
                        {a.status}
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

export default Dashboard;
