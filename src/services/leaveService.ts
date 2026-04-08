import { storage, generateId, getCurrentDate, calculateDaysBetween } from '../utils/storage';
import { employeeService } from './employeeService';
import { attendanceService } from './attendanceService';
import { eventBus } from '../utils/eventBus';

export interface LeaveRequest {
  id: number;
  employeeId: number;
  employeeName: string;
  type: 'Sick Leave' | 'Vacation' | 'Personal' | 'Emergency' | 'Maternity' | 'Paternity';
  startDate: string;
  endDate: string;
  days: number;
  reason: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  requestedDate: string;
  approvedBy?: string;
  approvedDate?: string;
  comments?: string;
}

export interface CreateLeaveRequest {
  employeeId: number;
  type: 'Sick Leave' | 'Vacation' | 'Personal' | 'Emergency' | 'Maternity' | 'Paternity';
  startDate: string;
  endDate: string;
  reason: string;
  comments?: string;
}

export interface UpdateLeaveStatus {
  status: 'Approved' | 'Rejected';
  approvedBy?: string;
  comments?: string;
}

class LeaveService {
  private readonly STORAGE_KEY = 'leaves' as const;

  // Get all leave requests
  getAllLeaves = (): LeaveRequest[] => {
    try {
      const leaves = storage.get<LeaveRequest[]>(this.STORAGE_KEY);
      return leaves || [];
    } catch (error) {
      console.error('Error fetching leaves:', error);
      return [];
    }
  };

  // Get leave request by ID
  getLeaveById = (id: number): LeaveRequest | null => {
    try {
      const leaves = this.getAllLeaves();
      return leaves.find(leave => leave.id === id) || null;
    } catch (error) {
      console.error(`Error fetching leave ${id}:`, error);
      return null;
    }
  };

  // Get leave requests for specific employee
  getLeavesByEmployee = (employeeId: number): LeaveRequest[] => {
    try {
      const leaves = this.getAllLeaves();
      return leaves.filter(leave => leave.employeeId === employeeId);
    } catch (error) {
      console.error(`Error fetching leaves for employee ${employeeId}:`, error);
      return [];
    }
  };

  // Get pending leave requests
  getPendingLeaves = (): LeaveRequest[] => {
    try {
      const leaves = this.getAllLeaves();
      return leaves.filter(leave => leave.status === 'Pending');
    } catch (error) {
      console.error('Error fetching pending leaves:', error);
      return [];
    }
  };

  // Get approved leave requests
  getApprovedLeaves = (): LeaveRequest[] => {
    try {
      const leaves = this.getAllLeaves();
      return leaves.filter(leave => leave.status === 'Approved');
    } catch (error) {
      console.error('Error fetching approved leaves:', error);
      return [];
    }
  };

  // Create new leave request
  createLeave = (data: CreateLeaveRequest): LeaveRequest => {
    try {
      // Validate dates
      const startDate = new Date(data.startDate);
      const endDate = new Date(data.endDate);
      
      if (startDate > endDate) {
        throw new Error('Start date cannot be after end date');
      }

      if (startDate < new Date(getCurrentDate())) {
        throw new Error('Start date cannot be in the past');
      }

      const leaves = this.getAllLeaves();
      const days = calculateDaysBetween(data.startDate, data.endDate);
      
      const employee = employeeService.getEmployeeById(data.employeeId);
      if (!employee) {
        throw new Error(`Employee with ID ${data.employeeId} not found`);
      }

      const newLeave: LeaveRequest = {
        id: generateId(),
        employeeId: data.employeeId,
        employeeName: employee.name,
        type: data.type,
        startDate: data.startDate,
        endDate: data.endDate,
        days,
        reason: data.reason,
        status: 'Pending',
        requestedDate: getCurrentDate(),
        comments: data.comments
      };

      leaves.push(newLeave);
      storage.set(this.STORAGE_KEY, leaves);
      eventBus.emit('DATA_UPDATED', { source: 'leaveService.createLeave' });
      
      return newLeave;
    } catch (error) {
      console.error('Error creating leave request:', error);
      throw new Error(`Failed to create leave request: ${error}`);
    }
  };

  // Update leave request status
  updateLeaveStatus = (id: number, data: UpdateLeaveStatus): LeaveRequest => {
    try {
      const leaves = this.getAllLeaves();
      const index = leaves.findIndex(leave => leave.id === id);
      
      if (index === -1) {
        throw new Error(`Leave request with ID ${id} not found`);
      }

      if (leaves[index].status !== 'Pending') {
        throw new Error('Only pending leave requests can be updated');
      }

      leaves[index] = {
        ...leaves[index],
        status: data.status,
        approvedBy: data.approvedBy,
        approvedDate: getCurrentDate(),
        comments: data.comments
      };

      if (data.status === 'Approved') {
        attendanceService.setEmployeeOnLeave(
          leaves[index].employeeId,
          leaves[index].startDate,
          leaves[index].endDate
        );
      }

      storage.set(this.STORAGE_KEY, leaves);
      eventBus.emit('DATA_UPDATED', { source: 'leaveService.updateLeaveStatus' });
      
      return leaves[index];
    } catch (error) {
      console.error(`Error updating leave status ${id}:`, error);
      throw new Error(`Failed to update leave status: ${error}`);
    }
  };

  // Get leave statistics
  getLeaveStats = () => {
    try {
      const leaves = this.getAllLeaves();
      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();

      const thisMonthLeaves = leaves.filter(leave => {
        const startDate = new Date(leave.startDate);
        return startDate.getMonth() === currentMonth && startDate.getFullYear() === currentYear;
      });

      const stats = {
        totalRequests: leaves.length,
        pendingRequests: leaves.filter(l => l.status === 'Pending').length,
        approvedRequests: leaves.filter(l => l.status === 'Approved').length,
        rejectedRequests: leaves.filter(l => l.status === 'Rejected').length,
        thisMonthRequests: thisMonthLeaves.length,
        totalDays: leaves.reduce((sum, leave) => sum + leave.days, 0),
        averageDaysPerRequest: leaves.length > 0 ? leaves.reduce((sum, leave) => sum + leave.days, 0) / leaves.length : 0
      };

      return stats;
    } catch (error) {
      console.error('Error getting leave statistics:', error);
      return {
        totalRequests: 0,
        pendingRequests: 0,
        approvedRequests: 0,
        rejectedRequests: 0,
        thisMonthRequests: 0,
        totalDays: 0,
        averageDaysPerRequest: 0
      };
    }
  };

  // Check if employee is on leave on specific date
  isEmployeeOnLeave = (employeeId: number, date: string): boolean => {
    try {
      const leaves = this.getLeavesByEmployee(employeeId);
      const checkDate = new Date(date);

      return leaves.some(leave => {
        if (leave.status !== 'Approved') return false;
        
        const startDate = new Date(leave.startDate);
        const endDate = new Date(leave.endDate);
        
        return checkDate >= startDate && checkDate <= endDate;
      });
    } catch (error) {
      console.error(`Error checking if employee ${employeeId} is on leave on ${date}:`, error);
      return false;
    }
  };

  // Get employee's remaining leave days (simplified - could be enhanced with leave policies)
  getEmployeeRemainingLeaveDays = (employeeId: number): number => {
    try {
      const leaves = this.getLeavesByEmployee(employeeId);
      const approvedLeaves = leaves.filter(leave => leave.status === 'Approved');
      const totalDaysUsed = approvedLeaves.reduce((sum, leave) => sum + leave.days, 0);
      
      // Assume 21 days annual leave (can be configured per employee later)
      const annualLeave = 21;
      return Math.max(0, annualLeave - totalDaysUsed);
    } catch (error) {
      console.error(`Error getting remaining leave days for employee ${employeeId}:`, error);
      return 0;
    }
  };
}
export const leaveService = new LeaveService();