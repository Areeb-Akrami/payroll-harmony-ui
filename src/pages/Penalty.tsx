import { DashboardLayout } from "@/components/DashboardLayout";
import { AlertTriangle, DollarSign, Calendar, Users, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
import { penaltyService, PenaltyRecord, CreatePenalty } from "@/services/penaltyService";
import { employeeService, Employee } from "@/services/employeeService";

const Penalty = () => {
  const [penaltyRecords, setPenaltyRecords] = useState<PenaltyRecord[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState<Omit<CreatePenalty, 'date' | 'status'>>({
    employeeId: 0,
    type: 'Other',
    amount: 0,
    reason: '',
  });

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [penaltyData, employeeData] = await Promise.all([
        Promise.resolve(penaltyService.getAllPenalties()),
        Promise.resolve(employeeService.getAllEmployees())
      ]);
      setPenaltyRecords(penaltyData);
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

  const openModal = () => {
    setFormData({ employeeId: 0, type: 'Other', amount: 0, reason: '' });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!formData.employeeId || !formData.amount || !formData.reason) {
        alert('Please fill all fields');
        return;
      }
      penaltyService.createPenalty({
        ...formData,
        date: new Date().toISOString().split('T')[0],
      });
      fetchData();
      closeModal();
      alert('Penalty added successfully!');
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to add penalty');
    }
  };

  const getEmployeeName = (employeeId: number) => {
    const employee = employees.find(emp => emp.id === employeeId);
    return employee ? employee.name : `Employee ${employeeId}`;
  };

  const getMonthlyStats = () => {
    const currentMonthRecords = penaltyRecords.filter(record => 
      record.date.startsWith(selectedMonth)
    );

    const totalPenalties = currentMonthRecords.reduce((sum, record) => sum + record.amount, 0);
    const approvedCount = currentMonthRecords.filter(record => record.status === 'Approved').length;
    const pendingCount = currentMonthRecords.filter(record => record.status === 'Pending').length;
    const deductedCount = currentMonthRecords.filter(record => record.status === 'Deducted').length;

    return {
      totalPenalties,
      approvedCount,
      pendingCount,
      deductedCount,
      totalCount: currentMonthRecords.length
    };
  };

  const stats = getMonthlyStats();

  const statCards = [
    { label: "Total Penalties", value: `$${stats.totalPenalties.toLocaleString()}`, icon: DollarSign, color: "text-primary", bg: "bg-primary/10" },
    { label: "Approved", value: stats.approvedCount, icon: AlertTriangle, color: "text-success", bg: "bg-success/10" },
    { label: "Pending", value: stats.pendingCount, icon: Calendar, color: "text-warning", bg: "bg-warning/10" },
    { label: "Deducted", value: stats.deductedCount, icon: Users, color: "text-destructive", bg: "bg-destructive/10" },
  ];

  const updatePenaltyStatus = async (id: number, status: 'Approved' | 'Deducted') => {
    try {
      penaltyService.updatePenaltyStatus(id, { status });
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
            <h1 className="page-header">Penalty Management</h1>
            <p className="page-subtitle">Manage employee penalties and salary deductions</p>
          </div>
          <div className="flex gap-2">
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="px-3 py-2 rounded-lg border border-input bg-background"
            />
            <Button onClick={openModal} className="gap-2">
              <AlertTriangle className="h-4 w-4" />
              Add Penalty
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
          <h3 className="font-semibold text-foreground mb-4">Penalty Records</h3>
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Date</th>
                  <th>Amount</th>
                  <th>Reason</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="text-center py-12">Loading...</td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td colSpan={6} className="text-center py-12 text-red-500">Error: {error}</td>
                  </tr>
                ) : (
                  penaltyRecords
                    .filter(record => record.date.startsWith(selectedMonth))
                    .map((record) => (
                      <tr key={record.id}>
                        <td className="font-medium text-foreground">{getEmployeeName(record.employeeId)}</td>
                        <td className="text-muted-foreground">{record.date}</td>
                        <td className="font-bold text-destructive">${record.amount.toLocaleString()}</td>
                        <td className="text-muted-foreground max-w-[300px] truncate">
                          {record.reason}
                        </td>
                        <td>
                          <span className={
                            record.status === 'Approved' ? 'badge-success' :
                            record.status === 'Deducted' ? 'badge-danger' :
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
                                  onClick={() => updatePenaltyStatus(record.id, 'Approved')}
                                  className="gap-1"
                                >
                                  Approve
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => updatePenaltyStatus(record.id, 'Deducted')}
                                  className="gap-1"
                                >
                                  Deduct
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

        {isModalOpen && (
          <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center">
            <div className="glass-card rounded-xl p-8 w-full max-w-md">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-foreground">Add New Penalty</h2>
                <Button variant="ghost" size="icon" onClick={closeModal}>
                  <X className="h-5 w-5" />
                </Button>
              </div>
              <form onSubmit={handleFormSubmit} className="space-y-4">
                <div>
                  <label className="label-text">Employee</label>
                  <select
                    value={formData.employeeId}
                    onChange={(e) => setFormData({ ...formData, employeeId: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-lg border border-input bg-background"
                  >
                    <option value={0} disabled>Select Employee</option>
                    {employees.map(emp => (
                      <option key={emp.id} value={emp.id}>{emp.name} (ID: {emp.id})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="label-text">Penalty Type</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as CreatePenalty['type'] })}
                    className="w-full px-3 py-2 rounded-lg border border-input bg-background"
                  >
                    <option value="Late">Late</option>
                    <option value="Absence">Absence</option>
                    <option value="Early Leave">Early Leave</option>
                    <option value="Policy Violation">Policy Violation</option>
                    <option value="Performance">Performance</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="label-text">Amount</label>
                  <Input
                    type="number"
                    placeholder="Penalty Amount"
                    value={formData.amount || ''}
                    onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) })}
                  />
                </div>
                <div>
                  <label className="label-text">Reason</label>
                  <Input
                    placeholder="Reason for penalty"
                    value={formData.reason}
                    onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  />
                </div>
                <div className="flex justify-end gap-2 pt-4">
                  <Button type="button" variant="outline" onClick={closeModal}>Cancel</Button>
                  <Button type="submit">Add Penalty</Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Penalty;