import { DashboardLayout } from "@/components/DashboardLayout";
import { TrendingUp, Award, Target, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { performanceService, PerformanceRecord, CreatePerformanceRecord } from "@/services/performanceService";
import { employeeService } from "@/services/employeeService";
import PerformanceReviewDetailModal from "@/components/PerformanceReviewDetailModal";
import { AddPerformanceReviewForm } from "@/components/AddPerformanceReviewForm";

const Performance = () => {
  const [performanceRecords, setPerformanceRecords] = useState<PerformanceRecord[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState(() => {
    const date = new Date();
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    return `${year}-${month}`;
  });
  const [selectedRecord, setSelectedRecord] = useState<PerformanceRecord | null>(null);
  const [addingReviewFor, setAddingReviewFor] = useState<any | null>(null);

  const handleViewDetails = (record: PerformanceRecord) => {
    setSelectedRecord(record);
  };

  const handleCloseModal = () => {
    setSelectedRecord(null);
  };

  const handleAddReviewClick = (employee: any) => {
    setAddingReviewFor(employee);
  };

  const handleAddReviewSuccess = () => {
    setAddingReviewFor(null);
    fetchData();
    alert('Performance record added successfully!');
  };

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [performanceData, employeeData] = await Promise.all([
        Promise.resolve(performanceService.getAllPerformance()),
        Promise.resolve(employeeService.getAllEmployees())
      ]);
      setPerformanceRecords(performanceData);
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



  const getEmployeeName = (employeeId: number) => {
    const employee = employees.find(emp => emp.id === employeeId);
    return employee ? employee.name : `Employee ${employeeId}`;
  };

  const getPeriodStats = () => {
    const currentPeriodRecords = performanceRecords.filter(record => 
      record.period === selectedPeriod
    );

    const avgOverallScore = currentPeriodRecords.length > 0 
      ? currentPeriodRecords.reduce((sum, record) => sum + record.overallScore, 0) / currentPeriodRecords.length 
      : 0;

    const highPerformers = currentPeriodRecords.filter(record => record.overallScore >= 80).length;
    const needsImprovement = currentPeriodRecords.filter(record => record.overallScore < 70).length;
    const totalEvaluated = currentPeriodRecords.length;

    return {
      avgOverallScore: avgOverallScore.toFixed(1),
      highPerformers,
      needsImprovement,
      totalEvaluated,
      totalEmployees: employees.length
    };
  };

  const stats = getPeriodStats();

  const statCards = [
    { label: "Average Score", value: stats.avgOverallScore, icon: TrendingUp, color: "text-primary", bg: "bg-primary/10" },
    { label: "High Performers", value: stats.highPerformers, icon: Award, color: "text-success", bg: "bg-success/10" },
    { label: "Needs Improvement", value: stats.needsImprovement, icon: Target, color: "text-warning", bg: "bg-warning/10" },
    { label: "Evaluated", value: `${stats.totalEvaluated}/${stats.totalEmployees}`, icon: Users, color: "text-info", bg: "bg-info/10" },
  ];

  const getRatingColor = (rating: PerformanceRecord['rating']) => {
    switch (rating) {
      case 'Excellent': return 'text-green-500';
      case 'Good': return 'text-blue-500';
      case 'Satisfactory': return 'text-yellow-500';
      case 'Needs Improvement': return 'text-orange-500';
      case 'Poor': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  const getRatingBadge = (rating: PerformanceRecord['rating']) => {
    switch (rating) {
      case 'Excellent': return 'badge-success';
      case 'Good': return 'badge-info';
      case 'Satisfactory': return 'badge-warning';
      case 'Needs Improvement': return 'badge-orange';
      case 'Poor': return 'badge-danger';
      default: return 'badge-secondary';
    }
  };

  const generatePeriodOptions = () => {
    const currentYear = new Date().getFullYear();
    const options = [];
    for (let year = currentYear - 2; year <= currentYear + 1; year++) {
      for (let month = 1; month <= 12; month++) {
        const monthStr = month.toString().padStart(2, '0');
        options.push(`${year}-${monthStr}`);
      }
    }
    return options.reverse(); // Show most recent first
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="page-header">Performance Management</h1>
            <p className="page-subtitle">Track and evaluate employee performance metrics</p>
          </div>
          <div className="flex gap-2">
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="px-3 py-2 rounded-lg border border-input bg-background"
            >
              {generatePeriodOptions().map(period => (
                <option key={period} value={period}>{period}</option>
              ))}
            </select>
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
          <h3 className="font-semibold text-foreground mb-4">Performance Reviews</h3>
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Period</th>
                  <th>Overall Score</th>
                  <th>Rating</th>
                  <th>Comments</th>
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
                  performanceRecords
                    .filter(record => record.period === selectedPeriod)
                    .map((record) => (
                      <tr key={record.id}>
                        <td className="font-medium text-foreground">{getEmployeeName(record.employeeId)}</td>
                        <td className="text-muted-foreground">{record.period}</td>
                        <td>
                          <span className={`font-bold ${getRatingColor(record.rating)}`}>
                            {record.overallScore}/100
                          </span>
                        </td>
                        <td>
                          <span className={getRatingBadge(record.rating)}>
                            {record.rating}
                          </span>
                        </td>
                        <td className="text-muted-foreground max-w-[200px] truncate">
                          {record.comments || '-'}
                        </td>
                        <td>
                          <Button 
                            size="sm" 
                            variant="outline"
                            className="gap-1"
                            onClick={() => handleViewDetails(record)}
                          >
                            <TrendingUp className="h-3 w-3" />
                            View Details
                          </Button>
                        </td>
                      </tr>
                    ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="glass-card rounded-xl p-6">
          <h3 className="font-semibold text-foreground mb-4">Employees Without Reviews</h3>
          <div className="space-y-3">
            {employees
              .filter(employee => 
                !performanceRecords.some(record => 
                  record.employeeId === employee.id && record.period === selectedPeriod
                )
              )
              .map(employee => (
                <div key={employee.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-bold">
                        {employee.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{employee.name}</p>
                      <p className="text-sm text-muted-foreground">{employee.role}</p>
                    </div>
                  </div>
                  <Button 
                    size="sm" 
                    onClick={() => handleAddReviewClick(employee)}
                    className="gap-1"
                  >
                    <Award className="h-3 w-3" />
                    Add Review
                  </Button>
                </div>
              ))
            }
            {employees.filter(employee => 
              !performanceRecords.some(record => 
                record.employeeId === employee.id && record.period === selectedPeriod
              )
            ).length === 0 && (
              <p className="text-center text-muted-foreground py-8">
                All employees have been reviewed for this period
              </p>
            )}
          </div>
        </div>
      </div>
      {selectedRecord && (
        <PerformanceReviewDetailModal
          record={selectedRecord}
          employeeName={getEmployeeName(selectedRecord.employeeId)}
          onClose={handleCloseModal}
        />
      )}
      {addingReviewFor && (
        <AddPerformanceReviewForm
          employeeId={addingReviewFor.id}
          employeeName={addingReviewFor.name}
          period={selectedPeriod}
          onSuccess={handleAddReviewSuccess}
          onCancel={() => setAddingReviewFor(null)}
        />
      )}
    </DashboardLayout>
  );
};

export default Performance;