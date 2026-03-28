import { DashboardLayout } from "@/components/DashboardLayout";
import { TrendingUp, Star, Target, Award } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const performanceData = [
  { name: "Sarah Chen", dept: "Engineering", kpi: 96, attendance: 98, projects: 12, rating: 4.8, trend: "up" },
  { name: "Mike Johnson", dept: "Sales", kpi: 88, attendance: 95, projects: 8, rating: 4.2, trend: "up" },
  { name: "Emily Davis", dept: "Marketing", kpi: 92, attendance: 90, projects: 10, rating: 4.5, trend: "down" },
  { name: "James Wilson", dept: "Engineering", kpi: 78, attendance: 85, projects: 6, rating: 3.8, trend: "down" },
  { name: "Lisa Park", dept: "HR", kpi: 94, attendance: 97, projects: 9, rating: 4.6, trend: "up" },
  { name: "David Brown", dept: "Operations", kpi: 85, attendance: 93, projects: 7, rating: 4.0, trend: "up" },
];

const chartData = performanceData.map((p) => ({ name: p.name.split(" ")[0], KPI: p.kpi, Attendance: p.attendance }));

const summaryStats = [
  { label: "Avg KPI Score", value: "88.8%", icon: Target, color: "text-primary", bg: "bg-primary/10" },
  { label: "Top Performers", value: "42", icon: Award, color: "text-success", bg: "bg-success/10" },
  { label: "Need Improvement", value: "18", icon: TrendingUp, color: "text-warning", bg: "bg-warning/10" },
  { label: "Avg Rating", value: "4.3/5", icon: Star, color: "text-info", bg: "bg-info/10" },
];

const Performance = () => (
  <DashboardLayout>
    <div className="space-y-6">
      <div>
        <h1 className="page-header">Performance</h1>
        <p className="page-subtitle">Employee performance metrics and KPI tracking</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {summaryStats.map((s) => (
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
        <h3 className="font-semibold text-foreground mb-4">KPI vs Attendance</h3>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(214, 20%, 90%)" />
            <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="hsl(215, 16%, 47%)" />
            <YAxis tick={{ fontSize: 12 }} stroke="hsl(215, 16%, 47%)" />
            <Tooltip />
            <Bar dataKey="KPI" fill="hsl(217, 91%, 50%)" radius={[4, 4, 0, 0]} />
            <Bar dataKey="Attendance" fill="hsl(142, 71%, 45%)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="glass-card rounded-xl p-6">
        <h3 className="font-semibold text-foreground mb-4">Employee Performance</h3>
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr><th>Employee</th><th>Department</th><th>KPI Score</th><th>Attendance</th><th>Projects</th><th>Rating</th></tr>
            </thead>
            <tbody>
              {performanceData.map((p, i) => (
                <tr key={i}>
                  <td className="font-medium text-foreground">{p.name}</td>
                  <td>{p.dept}</td>
                  <td>
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1.5 rounded-full bg-muted">
                        <div className="h-full rounded-full bg-primary" style={{ width: `${p.kpi}%` }} />
                      </div>
                      <span className="text-sm font-medium">{p.kpi}%</span>
                    </div>
                  </td>
                  <td>{p.attendance}%</td>
                  <td>{p.projects}</td>
                  <td>
                    <div className="flex items-center gap-1">
                      <Star className="h-3.5 w-3.5 text-warning fill-warning" />
                      <span className="font-medium">{p.rating}</span>
                    </div>
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

export default Performance;
