import { DashboardLayout } from "@/components/DashboardLayout";
import { Search, Calendar, Clock, UserCheck, UserX } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState } from "react";

const attendanceData = [
  { name: "Sarah Chen", dept: "Engineering", checkIn: "09:02 AM", checkOut: "06:15 PM", hours: "9h 13m", status: "Present", overtime: "1h 13m" },
  { name: "Mike Johnson", dept: "Sales", checkIn: "08:55 AM", checkOut: "05:30 PM", hours: "8h 35m", status: "Present", overtime: "—" },
  { name: "Emily Davis", dept: "Marketing", checkIn: "—", checkOut: "—", hours: "—", status: "Absent", overtime: "—" },
  { name: "James Wilson", dept: "Engineering", checkIn: "09:45 AM", checkOut: "06:00 PM", hours: "8h 15m", status: "Late", overtime: "—" },
  { name: "Lisa Park", dept: "HR", checkIn: "08:50 AM", checkOut: "05:00 PM", hours: "8h 10m", status: "Present", overtime: "—" },
  { name: "David Brown", dept: "Operations", checkIn: "09:00 AM", checkOut: "07:30 PM", hours: "10h 30m", status: "Present", overtime: "2h 30m" },
  { name: "Anna Lee", dept: "Engineering", checkIn: "10:20 AM", checkOut: "05:00 PM", hours: "6h 40m", status: "Half Day", overtime: "—" },
];

const summaryStats = [
  { label: "Present", value: "1,172", icon: UserCheck, color: "text-success", bg: "bg-success/10" },
  { label: "Absent", value: "38", icon: UserX, color: "text-destructive", bg: "bg-destructive/10" },
  { label: "Late Arrivals", value: "24", icon: Clock, color: "text-warning", bg: "bg-warning/10" },
  { label: "On Leave", value: "14", icon: Calendar, color: "text-info", bg: "bg-info/10" },
];

const Attendance = () => {
  const [search, setSearch] = useState("");
  const filtered = attendanceData.filter((a) => a.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="page-header">Attendance</h1>
          <p className="page-subtitle">Today's attendance overview — March 28, 2026</p>
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
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search employee..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 h-10 bg-muted/50 border-0" />
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr><th>Employee</th><th>Department</th><th>Check In</th><th>Check Out</th><th>Hours</th><th>Status</th><th>Overtime</th></tr>
              </thead>
              <tbody>
                {filtered.map((a, i) => (
                  <tr key={i}>
                    <td className="font-medium text-foreground">{a.name}</td>
                    <td>{a.dept}</td>
                    <td className="font-mono text-sm">{a.checkIn}</td>
                    <td className="font-mono text-sm">{a.checkOut}</td>
                    <td className="font-medium">{a.hours}</td>
                    <td>
                      <span className={a.status === "Present" ? "badge-success" : a.status === "Absent" ? "badge-danger" : a.status === "Late" ? "badge-warning" : "badge-info"}>
                        {a.status}
                      </span>
                    </td>
                    <td className="text-muted-foreground">{a.overtime}</td>
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

export default Attendance;
