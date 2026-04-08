import { DashboardLayout } from "@/components/DashboardLayout";
import { Clock, UserCheck, UserX, Clock3, Calendar, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { attendanceService, AttendanceRecord } from "@/services/attendanceService";
import { employeeService } from "@/services/employeeService";

const Attendance = () => {
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Use Promise.all to fetch from services
      const [attendanceData, employeeData] = await Promise.all([
        Promise.resolve(attendanceService.getAllAttendance()),
        Promise.resolve(employeeService.getAllEmployees())
      ]);
      setAttendanceRecords(attendanceData);
      setEmployees(employeeData);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to fetch data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCheckIn = async (employeeId: number) => {
    try {
      const currentTime = new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' });
      await attendanceService.checkIn({ employeeId, checkIn: currentTime });
      fetchData(); // Refetch to update UI
    } catch (error) {
      alert(`Failed to check in: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleCheckOut = async (employeeId: number) => {
    try {
      const currentTime = new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' });
      await attendanceService.checkOut({ employeeId, checkOut: currentTime });
      fetchData(); // Refetch to update UI
    } catch (error) {
      alert(`Failed to check out: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  // Helper to get status for an employee on the selected date
  const getEmployeeStatus = (employeeId: number, date: string) => {
    const record = attendanceRecords.find(r => r.employeeId === employeeId && r.date === date);
    return record ? record.status : 'Absent';
  };

  // Calculate stats for the selected date
  const getStatsForDate = (date: string) => {
    const recordsForDate = attendanceRecords.filter(record => record.date === date);
    const present = recordsForDate.filter(r => r.status === 'Present').length;
    const late = recordsForDate.filter(r => r.status === 'Late').length;
    const onLeave = employees.filter(emp => emp.status === 'On Leave').length; 
    const absent = employees.length - recordsForDate.length - onLeave; 

    return { present, late, absent, onLeave };
  };

  const stats = getStatsForDate(selectedDate);

  const statCards = [
    { label: "Present", value: stats.present, icon: UserCheck, color: "text-success", bg: "bg-success/10" },
    { label: "Late", value: stats.late, icon: Clock3, color: "text-warning", bg: "bg-warning/10" },
    { label: "Absent", value: stats.absent, icon: UserX, color: "text-destructive", bg: "bg-destructive/10" },
    { label: "On Leave", value: stats.onLeave, icon: Calendar, color: "text-primary", bg: "bg-primary/10" },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="page-header">Attendance Management</h1>
            <p className="page-subtitle">Track employee attendance and working hours</p>
          </div>
          <div className="flex gap-2">
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-3 py-2 rounded-lg border border-input bg-background"
            />
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map((s) => (
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

        {/* Attendance Table */}
        <div className="glass-card rounded-xl p-6">
          <h3 className="font-semibold text-foreground mb-4">Employee Attendance for {selectedDate}</h3>
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Status</th>
                  <th>Check In</th>
                  <th>Check Out</th>
                  <th>Working Hours</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr><td colSpan={6} className="text-center py-12">Loading...</td></tr>
                ) : error ? (
                  <tr><td colSpan={6} className="text-center py-12 text-red-500">Error: {error}</td></tr>
                ) : (
                  employees.map((employee) => {
                    const record = attendanceRecords.find(r => 
                      r.employeeId === employee.id && r.date === selectedDate
                    );
                    const status = getEmployeeStatus(employee.id, selectedDate);

                    return (
                      <tr key={employee.id}>
                        <td className="font-medium text-foreground">{employee.name}</td>
                        <td>
                          <span className={
                            status === 'Present' ? 'badge-success' :
                            status === 'Late' ? 'badge-warning' :
                            status === 'Absent' ? 'badge-danger' :
                            'badge-info'
                          }>
                            {status}
                          </span>
                        </td>
                        <td className="text-muted-foreground">{record?.checkIn || '—'}</td>
                        <td className="text-muted-foreground">{record?.checkOut || '—'}</td>
                        <td className="font-medium">{record?.workingHours ? `${record.workingHours.toFixed(2)}h` : '—'}</td>
                        <td>
                          <div className="flex gap-2">
                            {!record && (
                              <Button size="sm" onClick={() => handleCheckIn(employee.id)} className="gap-1">
                                <Clock className="h-3 w-3" /> Check In
                              </Button>
                            )}
                            {record && !record.checkOut && (
                              <Button size="sm" variant="outline" onClick={() => handleCheckOut(employee.id)} className="gap-1">
                                <CheckCircle className="h-3 w-3" /> Check Out
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Attendance;