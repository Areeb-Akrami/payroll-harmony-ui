import { DashboardLayout } from "@/components/DashboardLayout";
import { ShieldAlert, AlertTriangle, CheckCircle2, Eye, Clock, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { anomalyService, Anomaly } from "@/services/anomalyService";
import { eventBus } from "@/utils/eventBus";

const severityColor = (s: Anomaly['severity']) => s === "Critical" ? "badge-danger" : s === "High" ? "badge-warning" : s === "Medium" ? "badge-info" : "badge-success";
const statusIcon = (s: Anomaly['status']) => s === "Open" ? <AlertTriangle className="h-3.5 w-3.5" /> : s === "Investigating" ? <Eye className="h-3.5 w-3.5" /> : <CheckCircle2 className="h-3.5 w-3.5" />;

const AnomalyPage = () => {
  const [anomalies, setAnomalies] = useState<Anomaly[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnomalies = () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = anomalyService.getAllAnomalies();
      setAnomalies(data.sort((a, b) => new Date(b.detectedDate).getTime() - new Date(a.detectedDate).getTime()));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch anomalies');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAnomalies();
    const handleUpdate = () => fetchAnomalies();
    eventBus.on('DATA_UPDATED', handleUpdate);
    eventBus.on('ANOMALY_DETECTED', handleUpdate);
    return () => {
      eventBus.off('DATA_UPDATED', handleUpdate);
      eventBus.off('ANOMALY_DETECTED', handleUpdate);
    };
  }, []);

  const handleUpdateStatus = (id: string, status: Anomaly['status']) => {
    try {
      anomalyService.updateAnomalyStatus(id, status);
      fetchAnomalies();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to update status');
    }
  };

  const openAnomalies = anomalies.filter(a => a.status === 'Open').length;
  const investigating = anomalies.filter(a => a.status === 'Investigating').length;
  const resolvedThisMonth = anomalies.filter(a => a.status === 'Resolved' && new Date(a.resolvedDate!).getMonth() === new Date().getMonth()).length;

  const anomalyStats = [
    { label: "Open Anomalies", value: openAnomalies, icon: ShieldAlert, color: "text-destructive", bg: "bg-destructive/10" },
    { label: "Investigating", value: investigating, icon: Eye, color: "text-warning", bg: "bg-warning/10" },
    { label: "Resolved (Month)", value: resolvedThisMonth, icon: CheckCircle2, color: "text-success", bg: "bg-success/10" },
    // Avg Resolution calculation would be more complex, skipping for now
    { label: "Avg Resolution", value: "N/A", icon: Clock, color: "text-info", bg: "bg-info/10" },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="page-header">Anomaly Detection</h1>
            <p className="page-subtitle">AI-powered payroll and attendance anomaly monitoring</p>
          </div>
          <Button variant="outline" onClick={fetchAnomalies} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {anomalyStats.map((s) => (
            <div key={s.label} className="stat-card">
              {/* ... stat card JSX ... */}
            </div>
          ))}
        </div>

        <div className="space-y-3">
          {isLoading ? <p>Loading anomalies...</p> : error ? <p className="text-red-500">{error}</p> : anomalies.map((a) => (
            <div key={a.id} className={`${a.severity === "Critical" ? "anomaly-card" : "glass-card"} rounded-xl p-5`}>
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-mono text-muted-foreground">{a.id}</span>
                    <span className={severityColor(a.severity)}>{a.severity}</span>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      {statusIcon(a.status)}
                      <span>{a.status}</span>
                    </div>
                  </div>
                  <h4 className="font-semibold text-foreground">{a.title}</h4>
                  <p className="text-sm text-muted-foreground mt-1">{a.description}</p>
                  <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                    <span>Employee: <span className="font-medium text-foreground">{a.employeeName || 'N/A'}</span></span>
                    <span>Dept: {a.department || 'N/A'}</span>
                    <span>Detected: {new Date(a.detectedDate).toLocaleDateString()}</span>
                  </div>
                </div>
                {a.status !== "Resolved" && a.status !== "Closed" && (
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => handleUpdateStatus(a.id, 'Investigating')}>
                      Investigate
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleUpdateStatus(a.id, 'Resolved')}>
                      Mark as Resolved
                    </Button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AnomalyPage;