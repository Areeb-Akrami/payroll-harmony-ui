import { DashboardLayout } from "@/components/DashboardLayout";
import { DollarSign, Calendar, TrendingUp, Users, CheckCircle, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { payrollService, PayrollRecord } from "@/services/payrollService";
import { employeeService } from "@/services/employeeService";

const Payroll = () => {
  const [payrollRecords, setPayrollRecords] = useState<PayrollRecord[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [payrollData, employeeData] = await Promise.all([
        Promise.resolve(payrollService.getAllPayroll()),
        Promise.resolve(employeeService.getAllEmployees())
      ]);
      setPayrollRecords(payrollData);
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

  const handleRunPayroll = async () => {
    try {
      payrollService.runPayroll(selectedMonth);
      fetchData();
      alert('Payroll run successfully!');
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to run payroll');
    }
  };

  const getEmployeeName = (employeeId: number) => {
    if (!employees || !Array.isArray(employees)) {
      return `Employee ${employeeId}`;
    }
    const employee = employees.find(emp => emp && emp.id === employeeId);
    return employee ? employee.name : `Employee ${employeeId}`;
  };

  const getMonthlyStats = () => {
    if (!payrollRecords || !Array.isArray(payrollRecords)) {
      return {
        totalSalary: 0,
        paidCount: 0,
        pendingCount: 0,
        processingCount: 0,
        totalCount: 0
      };
    }

    const currentMonthRecords = payrollRecords.filter(record => 
      record && record.payPeriod && record.payPeriod.startsWith(selectedMonth)
    );

    const totalSalary = currentMonthRecords.reduce((sum, record) => sum + (record.netSalary || 0), 0);
    const paidCount = currentMonthRecords.filter(record => record.status === 'Paid').length;
    const pendingCount = currentMonthRecords.filter(record => record.status === 'Pending').length;
    const processingCount = currentMonthRecords.filter(record => record.status === 'Processing').length;

    return {
      totalSalary,
      paidCount,
      pendingCount,
      processingCount,
      totalCount: currentMonthRecords.length
    };
  };

  const stats = getMonthlyStats();

  const statCards = [
    { label: "Total Salary", value: `$${stats.totalSalary.toLocaleString()}`, icon: DollarSign, color: "text-primary", bg: "bg-primary/10" },
    { label: "Paid", value: stats.paidCount, icon: CheckCircle, color: "text-success", bg: "bg-success/10" },
    { label: "Pending", value: stats.pendingCount, icon: Clock, color: "text-warning", bg: "bg-warning/10" },
    { label: "Processing", value: stats.processingCount, icon: TrendingUp, color: "text-info", bg: "bg-info/10" },
  ];

  const updatePayrollStatus = async (id: number, status: 'Paid' | 'Pending' | 'Processing') => {
    try {
      payrollService.updatePayrollStatus(id, status);
      fetchData();
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to update status');
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="page-header">Payroll Management</h1>
            <p className="page-subtitle">Manage employee payroll and salary calculations</p>
          </div>
          <div className="flex gap-2">
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="px-3 py-2 rounded-lg border border-input bg-background"
            />
            <Button onClick={handleRunPayroll} className="gap-2">
              <DollarSign className="h-4 w-4" />
              Run Payroll
            </Button>
          </div>
        </div>

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

        <div className="glass-card rounded-xl p-6">
          <h3 className="font-semibold text-foreground mb-4">Payroll Records</h3>
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Pay Period</th>
                  <th>Base Salary</th>
                  <th>Bonus</th>
                  <th>Deductions</th>
                  <th>Net Pay</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
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
                ) : !payrollRecords || payrollRecords.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center py-12 text-muted-foreground">
                      No payroll records found. Click "Run Payroll" to generate records for this month.
                    </td>
                  </tr>
                ) : (
                  payrollRecords
                    .filter(record => record.payPeriod && record.payPeriod.startsWith(selectedMonth))
                    .map((record) => (
                      <tr key={record.id}>
                        <td className="font-medium text-foreground">{getEmployeeName(record.employeeId)}</td>
                        <td className="text-muted-foreground">{record.payPeriod || 'N/A'}</td>
                        <td>${(record.baseSalary || 0).toLocaleString()}</td>
                        <td>${(record.bonus || 0).toLocaleString()}</td>
                        <td>${(record.deductions || 0).toLocaleString()}</td>
                        <td className="font-bold">${(record.netSalary || 0).toLocaleString()}</td>
                        <td>
                          <span className={
                            record.status === 'Paid' ? 'badge-success' :
                            record.status === 'Pending' ? 'badge-warning' :
                            'badge-info'
                          }>
                            {record.status}
                          </span>
                        </td>
                        <td>
                          <div className="flex gap-2">
                            {record.status === 'Pending' && (
                              <Button 
                                size="sm" 
                                onClick={() => updatePayrollStatus(record.id, 'Processing')}
                                className="gap-1"
                              >
                                Process
                              </Button>
                            )}
                            {record.status === 'Processing' && (
                              <Button 
                                size="sm" 
                                onClick={() => updatePayrollStatus(record.id, 'Paid')}
                                className="gap-1"
                              >
                                Mark Paid
                              </Button>
                            )}
                          </div>
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

export default Payroll;