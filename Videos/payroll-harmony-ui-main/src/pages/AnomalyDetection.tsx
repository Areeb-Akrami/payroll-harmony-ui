import { DashboardLayout } from "@/components/DashboardLayout";
import { AlertTriangle, Shield, Search, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { anomalyDetectionService, Anomaly } from "@/services/anomalyDetectionService";

const AnomalyDetection = () => {
  const [anomalies, setAnomalies] = useState<Anomaly[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastScan, setLastScan] = useState<Date | null>(null);

  const runDetection = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const detectedAnomalies = anomalyDetectionService.runDetection();
      setAnomalies(detectedAnomalies.anomalies);
      setLastScan(new Date());
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to run anomaly detection');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Run initial detection on component mount
    runDetection();
  }, []);

  const getSeverityColor = (severity: 'Critical' | 'High' | 'Medium' | 'Low') => {
    switch (severity) {
      case 'Critical': return 'text-destructive';
      case 'High': return 'text-destructive';
      case 'Medium': return 'text-warning';
      case 'Low': return 'text-info';
    }
  };

  const getSeverityBg = (severity: 'Critical' | 'High' | 'Medium' | 'Low') => {
    switch (severity) {
      case 'Critical': return 'bg-destructive/10';
      case 'High': return 'bg-destructive/10';
      case 'Medium': return 'bg-warning/10';
      case 'Low': return 'bg-info/10';
    }
  };

  const getSeverityIcon = (severity: 'Critical' | 'High' | 'Medium' | 'Low') => {
    switch (severity) {
      case 'Critical': return AlertTriangle;
      case 'High': return AlertTriangle;
      case 'Medium': return Shield;
      case 'Low': return Activity;
    }
  };

  const getRecommendedAction = (type: string) => {
    switch (type) {
      case 'duplicate_salary':
        return 'Review payroll records and remove duplicates';
      case 'ghost_employee':
        return 'Verify employee records and remove invalid entries';
      case 'overtime_anomaly':
        return 'Review attendance records and validate overtime hours';
      case 'penalty_abuse':
        return 'Review penalty records and validate reasons';
      case 'leave_abuse':
        return 'Review leave requests and validate patterns';
      case 'suspicious_salary':
        return 'Review salary changes and validate reasons';
      case 'unusual_attendance':
        return 'Review attendance patterns and validate records';
      case 'fraudulent_leave':
        return 'Investigate leave patterns and validate requests';
      case 'duplicate_bonus':
        return 'Investigate bonus records and verify approval';
      default:
        return 'Review related records and take appropriate action';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'open': return 'bg-blue-100 text-blue-800';
      case 'investigating': return 'bg-yellow-100 text-yellow-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      case 'false_positive': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleInvestigate = (anomalyId: string) => {
    try {
      anomalyDetectionService.updateAnomalyStatus(anomalyId, 'investigating');
      // Refresh anomalies
      const updatedAnomalies = anomalyDetectionService.getAllAnomalies();
      setAnomalies(updatedAnomalies);
    } catch (error) {
      console.error('Error updating anomaly status:', error);
      setError('Failed to update anomaly status');
    }
  };

  const handleResolve = (anomalyId: string) => {
    try {
      anomalyDetectionService.updateAnomalyStatus(anomalyId, 'resolved');
      // Refresh anomalies
      const updatedAnomalies = anomalyDetectionService.getAllAnomalies();
      setAnomalies(updatedAnomalies);
    } catch (error) {
      console.error('Error updating anomaly status:', error);
      setError('Failed to update anomaly status');
    }
  };

  const stats = {
    total: anomalies.length,
    critical: anomalies.filter(a => a.severity === 'Critical').length,
    high: anomalies.filter(a => a.severity === 'High').length,
    medium: anomalies.filter(a => a.severity === 'Medium').length,
    low: anomalies.filter(a => a.severity === 'Low').length,
    open: anomalies.filter(a => a.status === 'open').length,
    investigating: anomalies.filter(a => a.status === 'investigating').length,
    resolved: anomalies.filter(a => a.status === 'resolved').length,
    resolvedThisMonth: anomalies.filter(a => {
      if (a.status !== 'resolved') return false;
      const resolvedDate = new Date(a.detectedAt); // Using detectedAt as proxy since we don't have resolvedAt
      const now = new Date();
      return resolvedDate.getMonth() === now.getMonth() && resolvedDate.getFullYear() === now.getFullYear();
    }).length
  };

  // Calculate average resolution time (in hours) - simplified calculation
  const avgResolutionTime = (() => {
    const resolvedAnomalies = anomalies.filter(a => a.status === 'resolved');
    if (resolvedAnomalies.length === 0) return 0;
    
    // Since we don't have resolvedAt timestamp, we'll use a simplified calculation
    // In a real implementation, you would track when the status was changed to resolved
    const totalHours = resolvedAnomalies.reduce((sum, anomaly) => {
      const detectedAt = new Date(anomaly.detectedAt);
      const now = new Date();
      const hoursDiff = (now.getTime() - detectedAt.getTime()) / (1000 * 60 * 60);
      return sum + Math.min(hoursDiff, 24); // Cap at 24 hours for this simplified calculation
    }, 0);
    
    return Math.round(totalHours / resolvedAnomalies.length);
  })();

  const statCards = [
    { label: "Total Anomalies", value: stats.total, icon: Search, color: "text-primary", bg: "bg-primary/10" },
    { label: "Open", value: stats.open, icon: AlertTriangle, color: "text-warning", bg: "bg-warning/10" },
    { label: "Investigating", value: stats.investigating, icon: Shield, color: "text-info", bg: "bg-info/10" },
    { label: "Resolved This Month", value: stats.resolvedThisMonth, icon: Activity, color: "text-success", bg: "bg-success/10" },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="page-header">Anomaly Detection</h1>
            <p className="page-subtitle">Monitor and detect suspicious payroll activities</p>
          </div>

        {stats.resolved > 0 && (
          <div className="bg-card border rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Average Resolution Time</p>
                <p className="text-2xl font-bold text-foreground">{avgResolutionTime} hours</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
                <Activity className="h-5 w-5 text-success" />
              </div>
            </div>
          </div>
        )}
          <div className="flex gap-2">
            <Button onClick={runDetection} className="gap-2" disabled={isLoading}>
              <Search className="h-4 w-4" />
              {isLoading ? 'Scanning...' : 'Run Scan'}
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
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-foreground">Detected Anomalies</h3>
            {lastScan && (
              <p className="text-sm text-muted-foreground">
                Last scan: {lastScan.toLocaleString()}
              </p>
            )}
          </div>
          
          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Scanning for anomalies...</p>
            </div>
          ) : error ? (
            <div className="text-center py-12 text-red-500">
              <AlertTriangle className="h-8 w-8 mx-auto mb-4" />
              <p>Error: {error}</p>
            </div>
          ) : anomalies.length === 0 ? (
            <div className="text-center py-12">
              <Shield className="h-8 w-8 text-success mx-auto mb-4" />
              <p className="text-muted-foreground">No anomalies detected</p>
              <p className="text-sm text-muted-foreground mt-2">System is running normally</p>
            </div>
          ) : (
            <div className="space-y-4">
              {anomalies.map((anomaly) => {
                const Icon = getSeverityIcon(anomaly.severity);
                return (
                  <div key={anomaly.id} className="border rounded-lg p-4 bg-card">
                    <div className="flex items-start gap-3">
                      <div className={`w-10 h-10 rounded-lg ${getSeverityBg(anomaly.severity)} flex items-center justify-center flex-shrink-0`}>
                        <Icon className={`h-5 w-5 ${getSeverityColor(anomaly.severity)}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-semibold text-foreground capitalize">
                            {anomaly.title}
                          </h4>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityBadge(anomaly.severity)}`}>
                            {anomaly.severity.toUpperCase()}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">
                          {anomaly.description}
                        </p>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span>Employee: {anomaly.employeeId || 'N/A'}</span>
                          <span>Detected: {new Date(anomaly.detectedAt).toLocaleString()}</span>
                        </div>
                        <div className="mt-3 p-3 bg-muted rounded-lg">
                          <p className="text-sm font-medium text-foreground mb-1">Recommended Action:</p>
                          <p className="text-sm text-muted-foreground">
                            {getRecommendedAction(anomaly.type)}
                          </p>
                        </div>
                        <div className="mt-4 flex gap-2">
                          {anomaly.status === 'open' && (
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleInvestigate(anomaly.id)}
                              disabled={isLoading}
                            >
                              Investigate
                            </Button>
                          )}
                          {anomaly.status === 'investigating' && (
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleResolve(anomaly.id)}
                              disabled={isLoading}
                            >
                              Resolve
                            </Button>
                          )}
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(anomaly.status)}`}>
                            {anomaly.status.toUpperCase()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

const getSeverityBadge = (severity: 'Critical' | 'High' | 'Medium' | 'Low') => {
  switch (severity) {
    case 'Critical': return 'bg-destructive/10 text-destructive';
    case 'High': return 'bg-destructive/10 text-destructive';
    case 'Medium': return 'bg-warning/10 text-warning';
    case 'Low': return 'bg-info/10 text-info';
  }
};

export default AnomalyDetection;