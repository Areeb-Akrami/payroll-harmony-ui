// Service exports
export { employeeService } from './employeeService';
export { attendanceService } from './attendanceService';
export { leaveService } from './leaveService';
export { payrollService } from './payrollService';
export { bonusService } from './bonusService';
export { penaltyService } from './penaltyService';
export { performanceService } from './performanceService';
export { anomalyDetectionService } from './anomalyDetectionService';

// Type exports
export type { Employee, CreateEmployee, UpdateEmployeeData } from './employeeService';
export type { AttendanceRecord } from './attendanceService';
export type { LeaveRequest, CreateLeaveRequest, UpdateLeaveStatus } from './leaveService';
export type { PayrollRecord, CreatePayrollRecord } from './payrollService';
export type { BonusRecord, CreateBonus, UpdateBonusStatus } from './bonusService';
export type { PenaltyRecord, CreatePenalty, UpdatePenaltyStatus } from './penaltyService';
export type { PerformanceRecord, CreatePerformanceRecord } from './performanceService';
export type { Anomaly } from './anomalyDetectionService';

import { seedAllData } from './seedData';

// Initialize all services with seed data
export const initializeServices = (): void => {
  try {
    console.log('Initializing all services with seed data...');
    // seedAllData();
    console.log('All services initialized successfully');
  } catch (error) {
    console.error('Error initializing services:', error);
  }
};