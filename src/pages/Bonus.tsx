import { DashboardLayout } from "@/components/DashboardLayout";
import { Gift, TrendingUp, Calendar, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { bonusService, BonusRecord } from "@/services/bonusService";
import { employeeService } from "@/services/employeeService";

const Bonus = () => {
  const [bonusRecords, setBonusRecords] = useState<BonusRecord[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [bonusData, employeeData] = await Promise.all([
        Promise.resolve(bonusService.getAllBonuses()),
        Promise.resolve(employeeService.getAllEmployees())
      ]);
      setBonusRecords(bonusData);
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

  const handleAddBonus = async () => {
    try {
      const employeeId = prompt('Enter Employee ID:');
      if (!employeeId || isNaN(Number(employeeId))) {
        alert('Please enter a valid Employee ID');
        return;
      }

      const amount = prompt('Enter Bonus Amount:');
      if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
        alert('Please enter a valid bonus amount');
        return;
      }

      const type = prompt('Enter Bonus Type (Performance/Holiday/Referral/Other):');
      if (!type || !['Performance', 'Holiday', 'Referral', 'Other'].includes(type)) {
        alert('Please enter a valid bonus type (Performance/Holiday/Referral/Other)');
        return;
      }

      const description = prompt('Enter bonus description:');
      if (!description) {
        alert('Please enter a description for the bonus');
        return;
      }

      const reason = prompt('Enter Reason (optional):') || '';

      bonusService.createBonus({
        employeeId: Number(employeeId),
        amount: Number(amount),
        type: type as any,
        description,
        reason,
        date: new Date().toISOString().split('T')[0],
        status: 'Pending'
      });

      fetchData();
      alert('Bonus added successfully!');
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to add bonus');
    }
  };

  const getEmployeeName = (employeeId: number) => {
    const employee = employees.find(emp => emp.id === employeeId);
    return employee ? employee.name : `Employee ${employeeId}`;
  };

  const getMonthlyStats = () => {
    const currentMonthRecords = bonusRecords.filter(record => 
      record.date.startsWith(selectedMonth)
    );

    const totalBonuses = currentMonthRecords.reduce((sum, record) => sum + record.amount, 0);
    const approvedCount = currentMonthRecords.filter(record => record.status === 'Approved').length;
    const pendingCount = currentMonthRecords.filter(record => record.status === 'Pending').length;
    const rejectedCount = currentMonthRecords.filter(record => record.status === 'Rejected').length;

    return {
      totalBonuses,
      approvedCount,
      pendingCount,
      rejectedCount,
      totalCount: currentMonthRecords.length
    };
  };

  const stats = getMonthlyStats();

  const statCards = [
    { label: "Total Bonuses", value: `$${stats.totalBonuses.toLocaleString()}`, icon: Gift, color: "text-primary", bg: "bg-primary/10" },
    { label: "Approved", value: stats.approvedCount, icon: TrendingUp, color: "text-success", bg: "bg-success/10" },
    { label: "Pending", value: stats.pendingCount, icon: Calendar, color: "text-warning", bg: "bg-warning/10" },
    { label: "Rejected", value: stats.rejectedCount, icon: Users, color: "text-destructive", bg: "bg-destructive/10" },
  ];

  const updateBonusStatus = async (id: number, status: 'Approved' | 'Rejected') => {
    try {
      let reason;
      if (status === 'Rejected') {
        reason = prompt('Enter reason for rejection:');
        if (!reason) {
          alert('Rejection reason is required.');
          return;
        }
      }
      bonusService.updateBonusStatus(id, { status, reason });
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
            <h1 className="page-header">Bonus Management</h1>
            <p className="page-subtitle">Manage employee bonuses and incentives</p>
          </div>
          <div className="flex gap-2">
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="px-3 py-2 rounded-lg border border-input bg-background"
            />
            <Button onClick={handleAddBonus} className="gap-2">
              <Gift className="h-4 w-4" />
              Add Bonus
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
          <h3 className="font-semibold text-foreground mb-4">Bonus Records</h3>
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Date</th>
                  <th>Type</th>
                  <th>Amount</th>
                  <th>Reason</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={7} className="text-center py-12">Loading...</td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td colSpan={7} className="text-center py-12 text-red-500">Error: {error}</td>
                  </tr>
                ) : (
                  bonusRecords
                    .filter(record => record.date.startsWith(selectedMonth))
                    .map((record) => (
                      <tr key={record.id}>
                        <td className="font-medium text-foreground">{getEmployeeName(record.employeeId)}</td>
                        <td className="text-muted-foreground">{record.date}</td>
                        <td>{record.type}</td>
                        <td className="font-bold">${record.amount.toLocaleString()}</td>
                        <td className="text-muted-foreground max-w-[200px] truncate">
                          {record.reason || '-'}
                        </td>
                        <td>
                          <span className={
                            record.status === 'Approved' ? 'badge-success' :
                            record.status === 'Rejected' ? 'badge-danger' :
                            'badge-warning'
                          }>
                            {record.status}
                          </span>
                        </td>
                        <td>
                          <div className="flex gap-2">
                            {record.status === 'Pending' && (
                              <>
                                <Button 
                                  size="sm" 
                                  onClick={() => updateBonusStatus(record.id, 'Approved')}
                                  className="gap-1"
                                >
                                  Approve
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => updateBonusStatus(record.id, 'Rejected')}
                                  className="gap-1"
                                >
                                  Reject
                                </Button>
                              </>
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

export default Bonus;