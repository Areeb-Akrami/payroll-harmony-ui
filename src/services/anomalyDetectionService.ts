import { storage } from '../utils/storage';
import { employeeService } from './employeeService';
import { payrollService } from './payrollService';
import { attendanceService } from './attendanceService';
import { leaveService } from './leaveService';
import { bonusService } from './bonusService';
import { penaltyService } from './penaltyService';
import { eventBus } from '../utils/eventBus';

export interface Anomaly {
  id: string;
  type: 'duplicate_salary' | 'ghost_employee' | 'overtime_anomaly' | 'penalty_abuse' | 'leave_abuse' | 'suspicious_salary' | 'unusual_attendance' | 'fraudulent_leave' | 'duplicate_bonus' | 'policy_violation';
  severity: 'Low' | 'Medium' | 'High' | 'Critical';
  title: string;
  description: string;
  employeeId?: number;
  employeeName?: string;
  details: Record<string, any>;
  detectedAt: string;
  status: 'open' | 'investigating' | 'resolved' | 'false_positive';
  assignedTo?: string;
  notes?: string;
}

export interface AnomalyDetectionResult {
  anomalies: Anomaly[];
  summary: {
    totalAnomalies: number;
    criticalCount: number;
    highCount: number;
    mediumCount: number;
    lowCount: number;
    openCount: number;
    resolvedCount: number;
  };
}

class AnomalyDetectionService {
  private readonly STORAGE_KEY = 'anomalies' as const;

  // Get all anomalies
  getAllAnomalies = (): Anomaly[] => {
    try {
      const anomalies = storage.get<Anomaly[]>(this.STORAGE_KEY);
      return anomalies || [];
    } catch (error) {
      console.error('Error fetching anomalies:', error);
      return [];
    }
  };

  // Get anomaly by ID
  getAnomalyById = (id: string): Anomaly | null => {
    try {
      const anomalies = this.getAllAnomalies();
      return anomalies.find(anomaly => anomaly.id === id) || null;
    } catch (error) {
      console.error(`Error fetching anomaly ${id}:`, error);
      return null;
    }
  };

  // Get anomalies by type
  getAnomaliesByType = (type: Anomaly['type']): Anomaly[] => {
    try {
      const anomalies = this.getAllAnomalies();
      return anomalies.filter(anomaly => anomaly.type === type);
    } catch (error) {
      console.error(`Error fetching anomalies by type ${type}:`, error);
      return [];
    }
  };

  // Get anomalies by severity
  getAnomaliesBySeverity = (severity: Anomaly['severity']): Anomaly[] => {
    try {
      const anomalies = this.getAllAnomalies();
      return anomalies.filter(anomaly => anomaly.severity === severity);
    } catch (error) {
      console.error(`Error fetching anomalies by severity ${severity}:`, error);
      return [];
    }
  };

  // Get open anomalies
  getOpenAnomalies = (): Anomaly[] => {
    try {
      const anomalies = this.getAllAnomalies();
      return anomalies.filter(anomaly => anomaly.status === 'open' || anomaly.status === 'investigating');
    } catch (error) {
      console.error('Error fetching open anomalies:', error);
      return [];
    }
  };

  // Create new anomaly
  createAnomaly = (anomaly: Omit<Anomaly, 'id' | 'detectedAt'>): Anomaly => {
    try {
      const anomalies = this.getAllAnomalies();
      const newAnomaly: Anomaly = {
        ...anomaly,
        id: `ANM${String(Date.now() + Math.floor(Math.random() * 1000)).slice(-6)}`,
        detectedAt: new Date().toISOString()
      };

      anomalies.push(newAnomaly);
      storage.set(this.STORAGE_KEY, anomalies);
      
      return newAnomaly;
    } catch (error) {
      console.error('Error creating anomaly:', error);
      throw new Error(`Failed to create anomaly: ${error}`);
    }
  };

  // Update anomaly status
  updateAnomalyStatus = (id: string, status: Anomaly['status'], notes?: string, assignedTo?: string): Anomaly => {
    try {
      const anomalies = this.getAllAnomalies();
      const index = anomalies.findIndex(anomaly => anomaly.id === id);
      
      if (index === -1) {
        throw new Error(`Anomaly with ID ${id} not found`);
      }

      anomalies[index] = {
        ...anomalies[index],
        status,
        notes: notes || anomalies[index].notes,
        assignedTo: assignedTo || anomalies[index].assignedTo
      };

      storage.set(this.STORAGE_KEY, anomalies);
      
      return anomalies[index];
    } catch (error) {
      console.error(`Error updating anomaly ${id}:`, error);
      throw new Error(`Failed to update anomaly: ${error}`);
    }
  };

  // Delete anomaly
  deleteAnomaly = (id: string): void => {
    try {
      const anomalies = this.getAllAnomalies();
      const filteredAnomalies = anomalies.filter(anomaly => anomaly.id !== id);
      
      if (anomalies.length === filteredAnomalies.length) {
        throw new Error(`Anomaly with ID ${id} not found`);
      }

      storage.set(this.STORAGE_KEY, filteredAnomalies);
    } catch (error) {
      console.error(`Error deleting anomaly ${id}:`, error);
      throw new Error(`Failed to delete anomaly: ${error}`);
    }
  };

  // Detect duplicate salary entries (A. Duplicate Salary Entry)
  private detectDuplicateSalary = (): Anomaly[] => {
    try {
      const payrollRecords = payrollService.getAllPayroll();
      const anomalies: Anomaly[] = [];
      
      // Group by employee and pay period (same month)
      const payrollMap = new Map<string, typeof payrollRecords>();
      
      payrollRecords.forEach(record => {
        if (!record.payPeriod) return;
        
        // Extract month from payPeriod (YYYY-MM format)
        const monthKey = record.payPeriod.substring(0, 7);
        const key = `${record.employeeId}-${monthKey}`;
        
        if (!payrollMap.has(key)) {
          payrollMap.set(key, []);
        }
        payrollMap.get(key)!.push(record);
      });

      // Find duplicates for same employee in same month
      payrollMap.forEach((records, key) => {
        if (records.length > 1) {
          const [employeeId, month] = key.split('-');
          const employee = employeeService.getEmployeeById(parseInt(employeeId));
          
          anomalies.push(this.createAnomaly({
              type: 'duplicate_salary' as const,
              severity: 'Critical',
              title: 'Duplicate Salary Entry',
              description: `Employee ${employee?.name || employeeId} has ${records.length} payroll entries for month ${month}`,
              employeeId: parseInt(employeeId),
              employeeName: employee?.name || `Employee ${employeeId}`,
              details: {
                recordIds: records.map(r => r.id),
                month,
                count: records.length,
                totalAmount: records.reduce((sum, r) => sum + (r.netSalary || 0), 0)
              },
              status: 'open' as const
            }));
        }
      });

      return anomalies;
    } catch (error) {
      console.error('Error detecting duplicate salary:', error);
      return [];
    }
  };

  // Detect ghost employees (B. Ghost Employee - payroll exists but employee not found)
  private detectGhostEmployee = (): Anomaly[] => {
    try {
      const employees = employeeService.getAllEmployees();
      const payrollRecords = payrollService.getAllPayroll();
      const anomalies: Anomaly[] = [];

      // Get valid employee IDs from employees list
      const validEmployeeIds = new Set(employees.map(emp => emp.id));

      // Find payroll records for non-existent employees
      const ghostPayrollRecords = payrollRecords.filter(record => 
        !validEmployeeIds.has(record.employeeId)
      );

      // Group by employee ID to avoid duplicates
      const ghostMap = new Map<number, typeof payrollRecords>();
      ghostPayrollRecords.forEach(record => {
        if (!ghostMap.has(record.employeeId)) {
          ghostMap.set(record.employeeId, []);
        }
        ghostMap.get(record.employeeId)!.push(record);
      });

      ghostMap.forEach((records, employeeId) => {
        anomalies.push(this.createAnomaly({
          type: 'ghost_employee' as const,
          severity: 'Critical',
          title: 'Ghost Employee',
          description: `Payroll exists for non-existent employee ID ${employeeId}`,
          employeeId: employeeId,
          employeeName: `Unknown Employee ${employeeId}`,
          details: {
            recordIds: records.map(r => r.id),
            payPeriods: records.map(r => r.payPeriod),
            totalRecords: records.length,
            totalAmount: records.reduce((sum, r) => sum + (r.netSalary || 0), 0)
          },
          status: 'open' as const
        }));
      });

      return anomalies;
    } catch (error) {
      console.error('Error detecting ghost employee:', error);
      return [];
    }
  };

  // Detect unusual overtime (C. Unusual Overtime)
  private detectUnusualOvertime = (): Anomaly[] => {
    try {
      const attendanceRecords = attendanceService.getAllAttendance();
      const anomalies: Anomaly[] = [];
      
      // Group by employee
      const employeeOvertime = new Map<number, number[]>();
      
      attendanceRecords.forEach(record => {
        if (record.workingHours > 8) { // Assuming 8 hours is a standard work day
          const overtime = record.workingHours - 8;
          if (!employeeOvertime.has(record.employeeId)) {
            employeeOvertime.set(record.employeeId, []);
          }
          employeeOvertime.get(record.employeeId)!.push(overtime);
        }
      });

      // Calculate average overtime across all employees
      const allOvertime: number[] = [];
      employeeOvertime.forEach(overtimes => {
        allOvertime.push(...overtimes);
      });
      
      const averageOvertime = allOvertime.length > 0 
        ? allOvertime.reduce((sum, hours) => sum + hours, 0) / allOvertime.length 
        : 0;

      // Check each employee's overtime
      employeeOvertime.forEach((overtimes, employeeId) => {
        const employee = employeeService.getEmployeeById(employeeId);
        const maxOvertime = Math.max(...overtimes);
        const avgEmployeeOvertime = overtimes.reduce((sum, hours) => sum + hours, 0) / overtimes.length;
        
        // Check if overtime > 2x average OR > 50 hours (predefined threshold)
        const THRESHOLD = 50; // 50 hours per week threshold
        
        if (maxOvertime > THRESHOLD || maxOvertime > 2 * averageOvertime) {
          anomalies.push(this.createAnomaly({
            type: 'overtime_anomaly' as const,
            severity: 'High',
            title: 'Unusual Overtime',
            description: `Employee has unusual overtime: ${maxOvertime.toFixed(1)}h (avg: ${averageOvertime.toFixed(1)}h, threshold: ${THRESHOLD}h)`,
            employeeId: employeeId,
            employeeName: employee?.name || `Employee ${employeeId}`,
            details: {
              maxOvertime: parseFloat(maxOvertime.toFixed(1)),
              averageOvertime: averageOvertime.toFixed(1),
              employeeAverage: avgEmployeeOvertime.toFixed(1),
              threshold: THRESHOLD,
              recordsCount: overtimes.length,
              allOvertimes: overtimes
            },
            status: 'open' as const
          }));
        }
      });

      return anomalies;
    } catch (error) {
      console.error('Error detecting unusual overtime:', error);
      return [];
    }
  };

  // Detect suspicious salary amounts
  private detectSuspiciousSalary = (): Anomaly[] => {
    try {
      const employees = employeeService.getAllEmployees();
      const payrollRecords = payrollService.getAllPayroll();
      const anomalies: Anomaly[] = [];
      
      // Calculate average salary by department
      const deptSalaries = new Map<string, number[]>();
      employees.forEach(employee => {
        if (employee.salary > 0) {
          if (!deptSalaries.has(employee.department)) {
            deptSalaries.set(employee.department, []);
          }
          deptSalaries.get(employee.department)!.push(employee.salary);
        }
      });

      // Calculate average salary for each department
      const deptAverages = new Map<string, number>();
      deptSalaries.forEach((salaries, dept) => {
        const avg = salaries.reduce((sum, salary) => sum + salary, 0) / salaries.length;
        deptAverages.set(dept, avg);
      });

      // Find employees with salaries significantly different from department average
      employees.forEach(employee => {
        const deptAverage = deptAverages.get(employee.department);
        if (deptAverage) {
          const deviation = Math.abs(employee.salary - deptAverage) / deptAverage;
          
          if (deviation > 0.5) { // More than 50% deviation
            anomalies.push(this.createAnomaly({
              type: 'suspicious_salary',
              severity: deviation > 1 ? 'High' : 'Medium', // High if >100% deviation
              title: 'Suspicious Salary',
              description: `Employee salary (${employee.salary}) deviates ${Math.round(deviation * 100)}% from department average (${Math.round(deptAverage)})`,
              employeeId: employee.id,
              employeeName: employee.name,
              details: {
                salary: employee.salary,
                deptAverage: Math.round(deptAverage),
                deviation: Math.round(deviation * 100),
                department: employee.department,
                role: employee.role
              },
              status: 'open'
            }));
          }
        }
      });

      return anomalies;
    } catch (error) {
      console.error('Error detecting suspicious salary:', error);
      return [];
    }
  };

  // Detect unusual attendance patterns
  private detectUnusualAttendance = (): Anomaly[] => {
    try {
      const attendanceRecords = attendanceService.getAllAttendance();
      const anomalies: Anomaly[] = [];
      
      // Group by employee
      const employeeAttendance = new Map<number, typeof attendanceRecords>();
      
      attendanceRecords.forEach(record => {
        if (!employeeAttendance.has(record.employeeId)) {
          employeeAttendance.set(record.employeeId, []);
        }
        employeeAttendance.get(record.employeeId)!.push(record);
      });

      // Analyze patterns for each employee
      employeeAttendance.forEach((records, employeeId) => {
        if (records.length < 5) return; // Need sufficient data

        // Check for patterns like always checking in/out at exact same times
        const checkInTimes = records.map(r => r.checkIn).filter(Boolean);
        const checkOutTimes = records.map(r => r.checkOut).filter(Boolean);

        // Check for suspicious patterns (e.g., always same minute)
        const uniqueCheckInMinutes = new Set(checkInTimes.map(time => time.slice(0, 5))); // HH:MM
        const uniqueCheckOutMinutes = new Set(checkOutTimes.map(time => time.slice(0, 5)));

        if (uniqueCheckInMinutes.size < 2 && checkInTimes.length > 5) {
          const employee = employeeService.getEmployeeById(employeeId);
          anomalies.push(this.createAnomaly({
            type: 'unusual_attendance',
            severity: 'Medium',
            title: 'Unusual Attendance Pattern',
            description: `Employee shows suspicious attendance pattern - always checking in at same time`,
            employeeId,
            employeeName: employee?.name || `Employee ${employeeId}`,
            details: {
              pattern: 'consistent_checkin_time',
              uniqueCheckInTimes: uniqueCheckInMinutes.size,
              totalRecords: records.length,
              checkInTimes: Array.from(uniqueCheckInMinutes)
            },
            status: 'open'
          }));
        }

        // Check for weekend attendance (potential buddy punching)
        const weekendRecords = records.filter(record => {
          const date = new Date(record.date);
          const day = date.getDay();
          return day === 0 || day === 6; // Sunday or Saturday
        });

        if (weekendRecords.length > 2) { // More than 2 weekend records
          const employee = employeeService.getEmployeeById(employeeId);
          anomalies.push(this.createAnomaly({
            type: 'unusual_attendance',
            severity: 'High',
            title: 'Unusual Weekend Attendance',
            description: `Employee has ${weekendRecords.length} weekend attendance records (potential buddy punching)`,
            employeeId,
            employeeName: employee?.name || `Employee ${employeeId}`,
            details: {
              pattern: 'weekend_attendance',
              weekendRecords: weekendRecords.length,
              weekendDates: weekendRecords.map(r => r.date)
            },
            status: 'open'
          }));
        }
      });

      return anomalies;
    } catch (error) {
      console.error('Error detecting unusual attendance:', error);
      return [];
    }
  };

  // Detect leave abuse (E. Leave Abuse)
  private detectLeaveAbuse = (): Anomaly[] => {
    try {
      const leaveRecords = leaveService.getAllLeaves();
      const anomalies: Anomaly[] = [];
      
      // Group by employee
      const employeeLeaves = new Map<number, typeof leaveRecords>();
      
      leaveRecords.forEach(record => {
        if (!employeeLeaves.has(record.employeeId)) {
          employeeLeaves.set(record.employeeId, []);
        }
        employeeLeaves.get(record.employeeId)!.push(record);
      });

      // Analyze leave patterns for each employee
      employeeLeaves.forEach((leaves, employeeId) => {
        const employee = employeeService.getEmployeeById(employeeId);
        
        // Check for too many leave requests in current month
        const currentMonth = new Date().toISOString().slice(0, 7);
        const monthlyLeaves = leaves.filter(leave => {
          const leaveDate = new Date(leave.startDate);
          return leaveDate.toISOString().slice(0, 7) === currentMonth;
        });

        const LEAVE_THRESHOLD = 3; // 3+ leaves in a month is suspicious
        
        if (monthlyLeaves.length >= LEAVE_THRESHOLD) {
          anomalies.push(this.createAnomaly({
            type: 'leave_abuse' as const,
            severity: 'High',
            title: 'Leave Abuse',
            description: `Employee has ${monthlyLeaves.length} leave requests in ${currentMonth}`,
            employeeId: employeeId,
            employeeName: employee?.name || `Employee ${employeeId}`,
            details: {
              monthlyLeaves: monthlyLeaves.length,
              currentMonth: currentMonth,
              leaveDates: monthlyLeaves.map(l => ({ start: l.startDate, end: l.endDate, type: l.type })),
              totalDays: monthlyLeaves.reduce((sum, l) => {
                const start = new Date(l.startDate);
                const end = new Date(l.endDate);
                return sum + Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
              }, 0)
            },
            status: 'open' as const
          }));
        }
      });

      return anomalies;
    } catch (error) {
      console.error('Error detecting leave abuse:', error);
      return [];
    }
  };

  // Detect fraudulent leave patterns
  private detectFraudulentLeave = (): Anomaly[] => {
    try {
      const leaveRequests = leaveService.getAllLeaves();
      const anomalies: Anomaly[] = [];
      
      // Group by employee
      const employeeLeaves = new Map<number, typeof leaveRequests>();
      
      leaveRequests.forEach(request => {
        if (!employeeLeaves.has(request.employeeId)) {
          employeeLeaves.set(request.employeeId, []);
        }
        employeeLeaves.get(request.employeeId)!.push(request);
      });

      // Analyze patterns
      employeeLeaves.forEach((leaves, employeeId) => {
        if (leaves.length < 2) return;

        // Check for patterns like always requesting leave around weekends
        const suspiciousPatterns = leaves.filter(leave => {
          const startDate = new Date(leave.startDate);
          const endDate = new Date(leave.endDate);
          
          // Check if leave starts on Friday or ends on Monday
          const startDay = startDate.getDay();
          const endDay = endDate.getDay();
          
          return (startDay === 5 || endDay === 1); // Friday or Monday
        });

        if (suspiciousPatterns.length > 2) {
          const employee = employeeService.getEmployeeById(employeeId);
          anomalies.push(this.createAnomaly({
            type: 'fraudulent_leave',
            severity: 'High',
            title: 'Fraudulent Leave Pattern',
            description: `Employee has ${suspiciousPatterns.length} leaves adjacent to weekends`,
            employeeId,
            employeeName: employee?.name || `Employee ${employeeId}`,
            details: {
              pattern: 'weekend_adjacent_leave',
              count: suspiciousPatterns.length,
              leaveDates: suspiciousPatterns.map(l => ({ start: l.startDate, end: l.endDate }))
            },
            status: 'open'
          }));
        }

        // Check for excessive sick leave
        const sickLeaves = leaves.filter(leave => leave.type === 'Sick Leave');
        if (sickLeaves.length > 5) { // More than 5 sick leaves
          const employee = employeeService.getEmployeeById(employeeId);
          anomalies.push(this.createAnomaly({
            type: 'fraudulent_leave',
            severity: 'Medium',
            title: 'Excessive Sick Leave',
            description: `Employee has taken ${sickLeaves.length} sick leaves`,
            employeeId,
            employeeName: employee?.name || `Employee ${employeeId}`,
            details: {
              pattern: 'excessive_sick_leave',
              count: sickLeaves.length,
              leaveDates: sickLeaves.map(l => ({ start: l.startDate, end: l.endDate }))
            },
            status: 'open'
          }));
        }
      });

      return anomalies;
    } catch (error) {
      console.error('Error detecting fraudulent leave:', error);
      return [];
    }
  };

  // Detect excessive penalties (D. Excessive Penalties)
  private detectExcessivePenalties = (): Anomaly[] => {
    try {
      const penaltyRecords = penaltyService.getAllPenalties();
      const anomalies: Anomaly[] = [];
      
      // Group by employee
      const employeePenalties = new Map<number, typeof penaltyRecords>();
      
      penaltyRecords.forEach(record => {
        if (!employeePenalties.has(record.employeeId)) {
          employeePenalties.set(record.employeeId, []);
        }
        employeePenalties.get(record.employeeId)!.push(record);
      });

      // Analyze penalties for each employee
      employeePenalties.forEach((penalties, employeeId) => {
        const PENALTY_THRESHOLD = 3; // 3+ penalties in 30 days is suspicious
        
        if (penalties.length > PENALTY_THRESHOLD) {
          const employee = employeeService.getEmployeeById(employeeId);
          
          anomalies.push(this.createAnomaly({
            type: 'penalty_abuse' as const,
            severity: 'Medium',
            title: 'Penalty Abuse',
            description: `Employee has ${penalties.length} penalties in the last 30 days`,
            employeeId: employeeId,
            employeeName: employee?.name || `Employee ${employeeId}`,
            details: {
              count: penalties.length,
              threshold: PENALTY_THRESHOLD,
              totalAmount: penalties.reduce((sum, p) => sum + p.amount, 0),
              penaltyTypes: penalties.map(p => p.type)
            },
            status: 'open' as const
          }));
        }
      });

      return anomalies;
    } catch (error) {
      console.error('Error detecting excessive penalties:', error);
      return [];
    }
  };

  // Detect duplicate bonus payments
  private detectDuplicateBonus = (): Anomaly[] => {
    try {
      const bonusRecords = bonusService.getAllBonuses();
      const anomalies: Anomaly[] = [];
      
      // Group by employee and pay period
      const bonusMap = new Map<string, number[]>();
      
      bonusRecords.forEach(record => {
        const key = `${record.employeeId}-${record.payPeriod}-${record.type}`;
        if (!bonusMap.has(key)) {
          bonusMap.set(key, []);
        }
        bonusMap.get(key)!.push(record.id);
      });

      // Find duplicates of same type for same employee in same period
      bonusMap.forEach((recordIds, key) => {
        if (recordIds.length > 1) {
          const [employeeId, payPeriod, type] = key.split('-');
          const employee = employeeService.getEmployeeById(parseInt(employeeId));
          
          anomalies.push(this.createAnomaly({
            type: 'duplicate_bonus',
            severity: 'High',
            title: 'Duplicate Bonus',
            description: `Duplicate ${type} bonus payments for employee ${employeeId} in period ${payPeriod}`,
            employeeId: parseInt(employeeId),
            employeeName: employee?.name || `Employee ${employeeId}`,
            details: {
              recordIds,
              payPeriod,
              bonusType: type,
              count: recordIds.length
            },
            status: 'open'
          }));
        }
      });

      return anomalies;
    } catch (error) {
      console.error('Error detecting duplicate bonus:', error);
      return [];
    }
  };

  // Helper method to calculate average notice period
  private calculateAverageNotice = (leaves: any[]): number => {
    if (leaves.length === 0) return 0;
    
    const totalNotice = leaves.reduce((sum, leave) => {
      const requestDate = new Date(leave.createdAt);
      const startDate = new Date(leave.startDate);
      const daysNotice = Math.floor((startDate.getTime() - requestDate.getTime()) / (1000 * 60 * 60 * 24));
      return sum + daysNotice;
    }, 0);
    
    return Math.round(totalNotice / leaves.length);
  };

  // Run all anomaly detection rules (alias for compatibility)
  runDetection = (): AnomalyDetectionResult => {
    return this.runAnomalyDetection();
  };

  // Run all anomaly detection rules
  runAnomalyDetection = (): AnomalyDetectionResult => {
    try {
      console.log('Running anomaly detection...');

      // Clear existing anomalies to prevent duplication on each run.
      storage.set(this.STORAGE_KEY, []);

      // Run all detection methods and collect the created anomalies
      const anomalies: Anomaly[] = [
        ...this.detectDuplicateSalary(),
        ...this.detectGhostEmployee(),
        ...this.detectUnusualOvertime(),
        ...this.detectExcessivePenalties(),
        ...this.detectLeaveAbuse(),
        ...this.detectSuspiciousSalary(),
        ...this.detectUnusualAttendance(),
        ...this.detectFraudulentLeave(),
        ...this.detectDuplicateBonus(),
      ];

      // Calculate summary statistics
      const summary = {
        totalAnomalies: anomalies.length,
        criticalCount: anomalies.filter(a => a.severity === 'Critical').length,
        highCount: anomalies.filter(a => a.severity === 'High').length,
        mediumCount: anomalies.filter(a => a.severity === 'Medium').length,
        lowCount: anomalies.filter(a => a.severity === 'Low').length,
        openCount: anomalies.filter(a => a.status === 'open' || a.status === 'investigating').length,
        resolvedCount: anomalies.filter(a => a.status === 'resolved' || a.status === 'false_positive').length
      };

      console.log(`Anomaly detection completed. Found ${anomalies.length} anomalies.`);

      return {
        anomalies,
        summary
      };
    } catch (error) {
      console.error('Error running anomaly detection:', error);
      return {
        anomalies: [],
        summary: {
          totalAnomalies: 0,
          criticalCount: 0,
          highCount: 0,
          mediumCount: 0,
          lowCount: 0,
          openCount: 0,
          resolvedCount: 0
        }
      };
    }
  };

  // Get anomaly statistics
  getAnomalyStats = () => {
    try {
      const anomalies = this.getAllAnomalies();
      const currentMonth = new Date().toISOString().slice(0, 7);
      
      const thisMonthAnomalies = anomalies.filter(anomaly => 
        anomaly.detectedAt.startsWith(currentMonth)
      );

      return {
        totalAnomalies: anomalies.length,
        thisMonthAnomalies: thisMonthAnomalies.length,
        byType: anomalies.reduce((acc, anomaly) => {
          acc[anomaly.type] = (acc[anomaly.type] || 0) + 1;
          return acc;
        }, {} as Record<string, number>),
        bySeverity: anomalies.reduce((acc, anomaly) => {
          acc[anomaly.severity] = (acc[anomaly.severity] || 0) + 1;
          return acc;
        }, {} as Record<string, number>),
        byStatus: anomalies.reduce((acc, anomaly) => {
          acc[anomaly.status] = (acc[anomaly.status] || 0) + 1;
          return acc;
        }, {} as Record<string, number>)
      };
    } catch (error) {
      console.error('Error getting anomaly statistics:', error);
      return {
        totalAnomalies: 0,
        thisMonthAnomalies: 0,
        byType: {},
        bySeverity: {},
        byStatus: {}
      };
    }
  };

  // Seed initial anomaly data
  seedInitialData = (): void => {
    try {
      if (!storage.exists(this.STORAGE_KEY)) {
        const initialAnomalies: Anomaly[] = [
          {
            id: `ANM${String(Date.now() + 1).slice(-6)}`,
            type: 'duplicate_salary',
            severity: 'High',
            title: 'Duplicate Salary Entry',
            description: 'Duplicate payroll entry detected for employee John Smith for March 2024',
            employeeId: 1,
            employeeName: 'John Smith',
            details: {
              payPeriod: '2024-03',
              recordIds: [101, 102],
              duplicateAmount: 5000
            },
            detectedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
            status: 'open',
            assignedTo: 'HR Manager'
          },
          {
            id: `ANM${String(Date.now() + 2).slice(-6)}`,
            type: 'overtime_anomaly',
            severity: 'Medium',
            title: 'Abnormal Overtime',
            description: 'Employee worked 14 hours on March 15, 2024',
            employeeId: 2,
            employeeName: 'Sarah Johnson',
            details: {
              hours: 14,
              date: '2024-03-15',
              limitExceeded: 2
            },
            detectedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
            status: 'investigating',
            assignedTo: 'Department Manager'
          }
        ];
        
        storage.set(this.STORAGE_KEY, initialAnomalies);
        console.log('Initial anomaly data seeded');
      }
    } catch (error) {
      console.error('Error seeding initial anomaly data:', error);
    }
  };
}

export const anomalyDetectionService = new AnomalyDetectionService();