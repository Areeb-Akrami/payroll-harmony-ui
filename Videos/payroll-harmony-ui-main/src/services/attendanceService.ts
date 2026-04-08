import { storage, generateId, getCurrentDate } from '../utils/storage';
import { eventBus } from '../utils/eventBus';
import { employeeService } from './employeeService';

export interface AttendanceRecord {
  id: number;
  employeeId: number;
  employeeName: string;
  date: string;
  checkIn: string | null;
  checkOut: string | null;
  workingHours: number;
  status: 'Present' | 'Absent' | 'Late' | 'On Leave';
  notes?: string;
}

export interface CheckInData {
  employeeId: number;
  checkIn: string;
  notes?: string;
}

export interface CheckOutData {
  employeeId: number;
  checkOut: string;
  notes?: string;
}

export interface DailySummary {
  totalEmployees: number;
  present: number;
  absent: number;
  late: number;
  onLeave: number;
}

class AttendanceService {
  private readonly STORAGE_KEY = 'attendance' as const;
  private readonly STANDARD_START_TIME = '09:00'; // Standard start time
  private readonly GRACE_PERIOD_MINUTES = 15; // 15 minutes grace period

  // Get all attendance records
  getAllAttendance = (): AttendanceRecord[] => {
    try {
      const attendance = storage.get<AttendanceRecord[]>(this.STORAGE_KEY);
      return attendance || [];
    } catch (error) {
      console.error('Error fetching attendance:', error);
      return [];
    }
  };

  // Get attendance by ID
  getAttendanceById = (id: number): AttendanceRecord | null => {
    try {
      const attendance = this.getAllAttendance();
      return attendance.find(record => record.id === id) || null;
    } catch (error) {
      console.error(`Error fetching attendance ${id}:`, error);
      return null;
    }
  };

  // Get attendance for specific employee
  getAttendanceByEmployee = (employeeId: number): AttendanceRecord[] => {
    try {
      const attendance = this.getAllAttendance();
      return attendance.filter(record => record.employeeId === employeeId);
    } catch (error) {
      console.error(`Error fetching attendance for employee ${employeeId}:`, error);
      return [];
    }
  };

  // Get attendance for specific date
  getAttendanceByDate = (date: string): AttendanceRecord[] => {
    try {
      const attendance = this.getAllAttendance();
      return attendance.filter(record => record.date === date);
    } catch (error) {
      console.error(`Error fetching attendance for date ${date}:`, error);
      return [];
    }
  };

  // Get today's attendance
  getTodayAttendance = (): AttendanceRecord[] => {
    return this.getAttendanceByDate(getCurrentDate());
  };

  // Check if employee has checked in today
  hasCheckedInToday = (employeeId: number): boolean => {
    try {
      const todayAttendance = this.getTodayAttendance();
      const employeeRecord = todayAttendance.find(record => record.employeeId === employeeId);
      return employeeRecord?.checkIn !== null && employeeRecord?.checkIn !== undefined;
    } catch (error) {
      console.error(`Error checking if employee ${employeeId} has checked in today:`, error);
      return false;
    }
  };

  // Check if employee has checked out today
  hasCheckedOutToday = (employeeId: number): boolean => {
    try {
      const todayAttendance = this.getTodayAttendance();
      const employeeRecord = todayAttendance.find(record => record.employeeId === employeeId);
      return employeeRecord?.checkOut !== null && employeeRecord?.checkOut !== undefined;
    } catch (error) {
      console.error(`Error checking if employee ${employeeId} has checked out today:`, error);
      return false;
    }
  };

  // Calculate working hours
  private calculateWorkingHours = (checkIn: string, checkOut: string): number => {
    try {
      const [checkInHour, checkInMin] = checkIn.split(':').map(Number);
      const [checkOutHour, checkOutMin] = checkOut.split(':').map(Number);
      
      const checkInTotalMinutes = checkInHour * 60 + checkInMin;
      const checkOutTotalMinutes = checkOutHour * 60 + checkOutMin;
      
      const workingMinutes = checkOutTotalMinutes - checkInTotalMinutes;
      return Math.max(0, workingMinutes / 60); // Convert to hours
    } catch (error) {
      console.error('Error calculating working hours:', error);
      return 0;
    }
  };

  // Determine attendance status
  private determineStatus = (checkIn: string | null, checkOut: string | null): 'Present' | 'Absent' | 'Late' => {
    if (!checkIn) return 'Absent';
    
    // Check if late
    if (checkIn) {
      const [checkInHour, checkInMin] = checkIn.split(':').map(Number);
      const [standardHour, standardMin] = this.STANDARD_START_TIME.split(':').map(Number);
      
      const checkInTotalMinutes = checkInHour * 60 + checkInMin;
      const standardTotalMinutes = standardHour * 60 + standardMin + this.GRACE_PERIOD_MINUTES;
      
      if (checkInTotalMinutes > standardTotalMinutes) {
        return 'Late';
      }
    }
    
    return 'Present';
  };

  // Check in employee
  checkIn = (data: CheckInData): AttendanceRecord => {
    try {
      if (this.hasCheckedInToday(data.employeeId)) {
        throw new Error('Employee has already checked in today');
      }

      const attendance = this.getAllAttendance();
      const today = getCurrentDate();
      
      const employee = employeeService.getEmployeeById(data.employeeId);
      if (!employee) {
        throw new Error(`Employee with ID ${data.employeeId} not found`);
      }
      
      const newRecord: AttendanceRecord = {
        id: generateId(),
        employeeId: data.employeeId,
        employeeName: employee.name,
        date: today,
        checkIn: data.checkIn,
        checkOut: null,
        workingHours: 0,
        status: 'Present',
        notes: data.notes
      };

      attendance.push(newRecord);
      storage.set(this.STORAGE_KEY, attendance);
      eventBus.emit('DATA_UPDATED', { source: 'attendanceService.checkIn' });
      
      return newRecord;
    } catch (error) {
      console.error('Error checking in employee:', error);
      throw new Error(`Failed to check in: ${error}`);
    }
  };

  // Check out employee
  checkOut = (data: CheckOutData): AttendanceRecord => {
    try {
      if (!this.hasCheckedInToday(data.employeeId)) {
        throw new Error('Employee has not checked in today');
      }

      if (this.hasCheckedOutToday(data.employeeId)) {
        throw new Error('Employee has already checked out today');
      }

      const attendance = this.getAllAttendance();
      const today = getCurrentDate();
      
      const recordIndex = attendance.findIndex(
        record => record.employeeId === data.employeeId && record.date === today
      );

      if (recordIndex === -1) {
        throw new Error('No check-in record found for today');
      }

      const record = attendance[recordIndex];
      const workingHours = this.calculateWorkingHours(record.checkIn!, data.checkOut);
      const status = this.determineStatus(record.checkIn, data.checkOut);

      attendance[recordIndex] = {
        ...record,
        checkOut: data.checkOut,
        workingHours,
        status,
        notes: data.notes || record.notes
      };

      storage.set(this.STORAGE_KEY, attendance);
      eventBus.emit('DATA_UPDATED', { source: 'attendanceService.checkOut' });
      
      return attendance[recordIndex];
    } catch (error) {
      console.error('Error checking out employee:', error);
      throw new Error(`Failed to check out: ${error}`);
    }
  };

  // Set employee status to "On Leave" for a date range
  setEmployeeOnLeave = (employeeId: number, startDate: string, endDate: string): void => {
    try {
      const start = new Date(startDate);
      const end = new Date(endDate);
      const attendance = this.getAllAttendance();
      const employee = employeeService.getEmployeeById(employeeId);
      if (!employee) {
        throw new Error(`Employee with ID ${employeeId} not found`);
      }

      for (let d = start; d <= end; d.setDate(d.getDate() + 1)) {
        const dateStr = d.toISOString().split('T')[0];
        const recordIndex = attendance.findIndex(
          record => record.employeeId === employeeId && record.date === dateStr
        );

        if (recordIndex !== -1) {
          attendance[recordIndex].status = 'On Leave';
        } else {
          const newRecord: AttendanceRecord = {
            id: generateId(),
            employeeId,
            employeeName: employee.name,
            date: dateStr,
            checkIn: null,
            checkOut: null,
            workingHours: 0,
            status: 'On Leave',
          };
          attendance.push(newRecord);
        }
      }

      storage.set(this.STORAGE_KEY, attendance);
      eventBus.emit('DATA_UPDATED', { source: 'attendanceService.setEmployeeOnLeave' });
    } catch (error) {
      console.error(`Error setting employee on leave: ${error}`);
      throw new Error(`Failed to set employee on leave: ${error}`);
    }
  };

  // Get daily summary
  getDailySummary = (date: string = getCurrentDate()): DailySummary => {
    try {
      const attendance = this.getAttendanceByDate(date);
      const summary: DailySummary = {
        totalEmployees: 0,
        present: 0,
        absent: 0,
        late: 0,
        onLeave: 0
      };

      // This would need to be integrated with employee service
      // For now, we'll calculate based on attendance records
      attendance.forEach(record => {
        switch (record.status) {
          case 'Present':
            summary.present++;
            break;
          case 'Late':
            summary.late++;
            break;
          case 'Absent':
            summary.absent++;
            break;
          case 'On Leave':
            summary.onLeave++;
            break;
        }
      });

      summary.totalEmployees = attendance.length;
      return summary;
    } catch (error) {
      console.error(`Error getting daily summary for ${date}:`, error);
      return { totalEmployees: 0, present: 0, absent: 0, late: 0, onLeave: 0 };
    }
  };

  // Get attendance statistics for a date range
  getAttendanceStats = (startDate: string, endDate: string) => {
    try {
      const attendance = this.getAllAttendance();
      const filtered = attendance.filter(record => {
        const recordDate = new Date(record.date);
        const start = new Date(startDate);
        const end = new Date(endDate);
        return recordDate >= start && recordDate <= end;
      });

      const stats = {
        totalDays: filtered.length,
        totalPresent: filtered.filter(r => r.status === 'Present').length,
        totalLate: filtered.filter(r => r.status === 'Late').length,
        totalAbsent: filtered.filter(r => r.status === 'Absent').length,
        averageWorkingHours: 0
      };

      if (filtered.length > 0) {
        const totalHours = filtered.reduce((sum, record) => sum + record.workingHours, 0);
        stats.averageWorkingHours = totalHours / filtered.length;
      }

      return stats;
    } catch (error) {
      console.error(`Error getting attendance stats:`, error);
      return { totalDays: 0, totalPresent: 0, totalLate: 0, totalAbsent: 0, averageWorkingHours: 0 };
    }
  };

  // Get employee overtime for a specific period
  getEmployeeOvertimeForPeriod = (employeeId: number, payPeriod: string): number => {
    try {
      const attendance = this.getAttendanceByEmployee(employeeId);
      const [year, month] = payPeriod.split('-');
      
      const overtimeHours = attendance
        .filter(record => {
          const recordDate = new Date(record.date);
          return recordDate.getFullYear() === parseInt(year) && (recordDate.getMonth() + 1) === parseInt(month);
        })
        .reduce((total, record) => {
          const overtime = Math.max(0, record.workingHours - 8); // Assuming 8 hours is a standard day
          return total + overtime;
        }, 0);

      return overtimeHours;
    } catch (error) {
      console.error(`Error calculating overtime for employee ${employeeId}:`, error);
      return 0;
    }
  };
}

export const attendanceService = new AttendanceService();