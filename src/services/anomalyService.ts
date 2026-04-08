import { storage, generateId, getCurrentDate } from '../utils/storage';
import { eventBus } from '../utils/eventBus';
import { employeeService } from './employeeService';

export interface Anomaly {
  id: string;
  title: string;
  description: string;
  severity: 'Low' | 'Medium' | 'High' | 'Critical';
  status: 'Open' | 'Investigating' | 'Resolved' | 'Closed';
  employeeId?: number | string;
  employeeName?: string;
  department?: string;
  detectedDate: string;
  resolvedDate?: string;
  details?: Record<string, any>;
}

export interface CreateAnomaly {
  title: string;
  description: string;
  severity: 'Low' | 'Medium' | 'High' | 'Critical';
  employeeId?: number | string;
  employeeName?: string;
  department?: string;
  details?: Record<string, any>;
}

class AnomalyService {
  private readonly STORAGE_KEY = 'anomalies' as const;

  constructor() {
    this.detectAnomalies = this.detectAnomalies.bind(this);
    eventBus.on('DATA_UPDATED', this.detectAnomalies);
  }

  getAllAnomalies = (): Anomaly[] => {
    return storage.get<Anomaly[]>(this.STORAGE_KEY) || [];
  };

  createAnomaly = (data: CreateAnomaly): Anomaly => {
    const anomalies = this.getAllAnomalies();
    const newAnomaly: Anomaly = {
      id: `ANM${String(generateId()).padStart(3, '0')}`,
      status: 'Open',
      detectedDate: getCurrentDate(),
      ...data,
    };
    anomalies.push(newAnomaly);
    storage.set(this.STORAGE_KEY, anomalies);
    eventBus.emit('ANOMALY_DETECTED', newAnomaly);
    return newAnomaly;
  };

  updateAnomalyStatus = (id: string, status: Anomaly['status']): Anomaly | null => {
    const anomalies = this.getAllAnomalies();
    const index = anomalies.findIndex(a => a.id === id);
    if (index === -1) return null;

    anomalies[index].status = status;
    if (status === 'Resolved' || status === 'Closed') {
      anomalies[index].resolvedDate = getCurrentDate();
    }
    storage.set(this.STORAGE_KEY, anomalies);
    eventBus.emit('DATA_UPDATED', { source: 'anomalyService.updateAnomalyStatus' });
    return anomalies[index];
  };

  private detectAnomalies(event?: any) {
    if (event?.source === 'payrollService.processPayroll') {
      const payrollData = event.payload;
      const employees = employeeService.getAllEmployees();

      // Detect Ghost Employees
      payrollData.forEach((p: any) => {
        const employeeExists = employees.some(e => e.id === p.employeeId);
        if (!employeeExists) {
          this.createAnomaly({
            title: 'Ghost Employee Detected',
            description: `Payroll entry found for non-existent employee ID: ${p.employeeId}`,
            severity: 'Critical',
            employeeId: p.employeeId,
            details: { payrollRecord: p }
          });
        }
      });

      // Detect Duplicate Salary Entries
      const salaryEntries = new Map<string, number>();
      payrollData.forEach((p: any) => {
        const key = `${p.employeeId}-${p.payPeriod}`;
        if (salaryEntries.has(key)) {
          this.createAnomaly({
            title: 'Duplicate Salary Entry',
            description: `Multiple salary entries detected for employee ${p.employeeName} in pay period ${p.payPeriod}.`,
            severity: 'Critical',
            employeeId: p.employeeId,
            employeeName: p.employeeName,
            department: p.department,
            details: { payrollRecord: p }
          });
        } else {
          salaryEntries.set(key, 1);
        }
      });
    } else if (event?.source === 'employeeService.updateEmployee') {
      const { before, after } = event.payload;
      if (before.salary && after.salary) {
        const percentageChange = ((after.salary - before.salary) / before.salary) * 100;
        if (Math.abs(percentageChange) > 30) { // 30% threshold
          this.createAnomaly({
            title: 'Significant Salary Change',
            description: `Salary for ${after.name} changed by ${percentageChange.toFixed(2)}%, from $${before.salary} to $${after.salary}.`,
            severity: 'High',
            employeeId: after.id,
            employeeName: after.name,
            department: after.department,
            details: {
              previousSalary: before.salary,
              newSalary: after.salary,
              percentageChange,
            }
          });
        }
      }
    }
  }
}

export const anomalyService = new AnomalyService();