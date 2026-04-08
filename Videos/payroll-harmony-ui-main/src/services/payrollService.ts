import { storage, generateId, getCurrentDate } from '../utils/storage';
import { employeeService } from './employeeService';
import { bonusService } from './bonusService';
import { penaltyService } from './penaltyService';
import { attendanceService } from './attendanceService';
import { eventBus } from '../utils/eventBus';

export interface PayrollRecord {
  id: number;
  employeeId: number;
  employeeName: string;
  payPeriod: string; // Format: "YYYY-MM"
  baseSalary: number;
  bonus: number;
  overtime: number;
  deductions: number;
  netSalary: number;
  status: 'Paid' | 'Pending' | 'Processing';
  paymentDate?: string;
  notes?: string;
  createdAt: string;
}

export interface CreatePayrollRecord {
  employeeId: number;
  payPeriod: string;
  baseSalary: number;
  bonus?: number;
  overtime?: number;
  deductions?: number;
  notes?: string;
}

export interface PayrollCalculation {
  baseSalary: number;
  bonus: number;
  overtime: number;
  deductions: number;
  netSalary: number;
  breakdown: {
    base: number;
    bonus: number;
    overtime: number;
    deductions: {
      penalties: number;
      taxes: number;
      other: number;
    };
  };
}

class PayrollService {
  private readonly STORAGE_KEY = 'payroll' as const;
  private readonly TAX_RATE = 0; // 0% tax rate (removed)

  constructor() {
    eventBus.on('DATA_UPDATED', this.handleDataUpdate);
  }

  private handleDataUpdate = (data: any) => {
    console.log('Payroll service received data update event', data);
    // Here you could add logic to automatically recalculate payroll
    // For now, we'll just log the event
  };

  // Get all payroll records
  getAllPayroll = (): PayrollRecord[] => {
    try {
      const payroll = storage.get<PayrollRecord[]>(this.STORAGE_KEY);
      return payroll || [];
    } catch (error) {
      console.error('Error fetching payroll:', error);
      return [];
    }
  };

  // Get payroll record by ID
  getPayrollById = (id: number): PayrollRecord | null => {
    try {
      const payroll = this.getAllPayroll();
      return payroll.find(record => record.id === id) || null;
    } catch (error) {
      console.error(`Error fetching payroll ${id}:`, error);
      return null;
    }
  };

  // Get payroll records for specific employee
  getPayrollByEmployee = (employeeId: number): PayrollRecord[] => {
    try {
      const payroll = this.getAllPayroll();
      return payroll.filter(record => record.employeeId === employeeId);
    } catch (error) {
      console.error(`Error fetching payroll for employee ${employeeId}:`, error);
      return [];
    }
  };

  // Get payroll records for specific pay period
  getPayrollByPeriod = (payPeriod: string): PayrollRecord[] => {
    try {
      const payroll = this.getAllPayroll();
      return payroll.filter(record => record.payPeriod === payPeriod);
    } catch (error) {
      console.error(`Error fetching payroll for period ${payPeriod}:`, error);
      return [];
    }
  };

  // Calculate payroll for an employee
  // Calculate payroll for an employee
  calculatePayroll = (employeeId: number, payPeriod: string): PayrollCalculation => {
    try {
      // This will be integrated with other services
      const baseSalary = this.getEmployeeBaseSalary(employeeId);
      const bonus = this.getEmployeeBonus(employeeId, payPeriod);
      const overtime = this.getEmployeeOvertime(employeeId, payPeriod);
      const deductions = this.getEmployeeDeductions(employeeId, payPeriod);

      const taxableIncome = baseSalary + bonus + overtime;
      const taxDeduction = taxableIncome * this.TAX_RATE;
      const totalDeductions = deductions + taxDeduction;
      const netSalary = baseSalary + bonus + overtime - totalDeductions;

      return {
        baseSalary,
        bonus,
        overtime,
        deductions: totalDeductions,
        netSalary: Math.max(0, netSalary),
        breakdown: {
          base: baseSalary,
          bonus,
          overtime,
          deductions: {
            penalties: deductions,
            taxes: taxDeduction,
            other: 0
          }
        }
      };
    } catch (error) {
      console.error(`Error calculating payroll for employee ${employeeId}:`, error);
      return {
        baseSalary: 0,
        bonus: 0,
        overtime: 0,
        deductions: 0,
        netSalary: 0,
        breakdown: {
          base: 0,
          bonus: 0,
          overtime: 0,
          deductions: {
            penalties: 0,
            taxes: 0,
            other: 0
          }
        }
      };
    }
  };

  // Create payroll record
  createPayrollRecord = (data: CreatePayrollRecord): PayrollRecord => {
    try {
      // Check if payroll already exists for this employee and period
      const existing = this.getPayrollByEmployee(data.employeeId)
        .find(record => record.payPeriod === data.payPeriod);
      
      if (existing) {
        throw new Error(`Payroll record already exists for employee ${data.employeeId} for period ${data.payPeriod}`);
      }

      const calculation = this.calculatePayroll(data.employeeId, data.payPeriod);
      const employeeName = this.getEmployeeName(data.employeeId);

      const payrollRecord: PayrollRecord = {
        id: generateId(),
        employeeId: data.employeeId,
        employeeName,
        payPeriod: data.payPeriod,
        baseSalary: calculation.baseSalary,
        bonus: calculation.bonus,
        overtime: calculation.overtime,
        deductions: calculation.deductions,
        netSalary: calculation.netSalary,
        status: 'Pending',
        createdAt: getCurrentDate(),
        notes: data.notes
      };

      const payroll = this.getAllPayroll();
      payroll.push(payrollRecord);
      storage.set(this.STORAGE_KEY, payroll);
      eventBus.emit('DATA_UPDATED', { source: 'payrollService.createPayrollRecord' });
      
      return payrollRecord;
    } catch (error) {
      console.error('Error creating payroll record:', error);
      throw new Error(`Failed to create payroll record: ${error}`);
    }
  };

  // Update payroll status
  updatePayrollStatus = (id: number, status: 'Paid' | 'Pending' | 'Processing', paymentDate?: string): PayrollRecord => {
    try {
      const payroll = this.getAllPayroll();
      const index = payroll.findIndex(record => record.id === id);
      
      if (index === -1) {
        throw new Error(`Payroll record with ID ${id} not found`);
      }

      payroll[index] = {
        ...payroll[index],
        status,
        paymentDate: paymentDate || (status === 'Paid' ? getCurrentDate() : undefined)
      };

      storage.set(this.STORAGE_KEY, payroll);
      
      return payroll[index];
    } catch (error) {
      console.error(`Error updating payroll status ${id}:`, error);
      throw new Error(`Failed to update payroll status: ${error}`);
    }
  };

  // Run payroll for all active employees for a specific period
  runPayroll = (payPeriod: string): PayrollRecord[] => {
    try {
      // This will be integrated with employee service
      const activeEmployees = this.getActiveEmployees();
      const processedRecords: PayrollRecord[] = [];
      const allPayroll = this.getAllPayroll();

      for (const employee of activeEmployees) {
        try {
          const existingRecordIndex = allPayroll.findIndex(
            r => r.employeeId === employee.id && r.payPeriod === payPeriod
          );

          if (existingRecordIndex !== -1) {
            // Update existing record, but don't overwrite a 'Paid' one
            const recordToUpdate = allPayroll[existingRecordIndex];
            if (recordToUpdate.status === 'Paid') {
              processedRecords.push(recordToUpdate);
              continue;
            }

            const calculation = this.calculatePayroll(employee.id, payPeriod);
            const updatedRecord = {
              ...recordToUpdate,
              baseSalary: calculation.baseSalary,
              bonus: calculation.bonus,
              overtime: calculation.overtime,
              deductions: calculation.deductions,
              netSalary: calculation.netSalary
            };
            allPayroll[existingRecordIndex] = updatedRecord;
            processedRecords.push(updatedRecord);
          } else {
            // Create new record since it doesn't exist
            const calculation = this.calculatePayroll(employee.id, payPeriod);
            const employeeName = this.getEmployeeName(employee.id);

            const newRecord: PayrollRecord = {
              id: generateId(),
              employeeId: employee.id,
              employeeName,
              payPeriod: payPeriod,
              baseSalary: calculation.baseSalary,
              bonus: calculation.bonus,
              overtime: calculation.overtime,
              deductions: calculation.deductions,
              netSalary: calculation.netSalary,
              status: 'Pending',
              createdAt: getCurrentDate()
            };
            allPayroll.push(newRecord);
            processedRecords.push(newRecord);
          }
        } catch (error) {
          console.error(`Error processing payroll for employee ${employee.id}:`, error);
        }
      }

      storage.set(this.STORAGE_KEY, allPayroll);
      eventBus.emit('DATA_UPDATED', { source: 'payrollService.runPayroll', payload: processedRecords });
      return processedRecords;
    } catch (error) {
      console.error(`Error running payroll for period ${payPeriod}:`, error);
      return [];
    }
  };

  // Get payroll statistics
  getPayrollStats = () => {
    try {
      const payroll = this.getAllPayroll();
      const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM format

      const thisMonthPayroll = payroll.filter(record => record.payPeriod === currentMonth);

      const stats = {
        totalRecords: payroll.length,
        totalPaid: payroll.filter(r => r.status === 'Paid').length,
        totalPending: payroll.filter(r => r.status === 'Pending').length,
        totalProcessing: payroll.filter(r => r.status === 'Processing').length,
        totalSalary: payroll.reduce((sum, record) => sum + record.netSalary, 0),
        thisMonthSalary: thisMonthPayroll.reduce((sum, record) => sum + record.netSalary, 0),
        averageSalary: payroll.length > 0 ? payroll.reduce((sum, record) => sum + record.netSalary, 0) / payroll.length : 0
      };

      return stats;
    } catch (error) {
      console.error('Error getting payroll statistics:', error);
      return {
        totalRecords: 0,
        totalPaid: 0,
        totalPending: 0,
        totalProcessing: 0,
        totalSalary: 0,
        thisMonthSalary: 0,
        averageSalary: 0
      };
    }
  };

  // Check for duplicate payroll entries
  checkForDuplicates = (employeeId: number, payPeriod: string): boolean => {
    try {
      const payroll = this.getAllPayroll();
      return payroll.some(record => 
        record.employeeId === employeeId && record.payPeriod === payPeriod
      );
    } catch (error) {
      console.error(`Error checking for duplicate payroll:`, error);
      return false;
    }
  };



  // Helper methods (will be integrated with other services)
  private getEmployeeBaseSalary = (employeeId: number): number => {
    const employee = employeeService.getEmployeeById(employeeId);
    if (!employee) throw new Error(`Employee not found: ${employeeId}`);
    return employee.salary;
  };

  private getEmployeeName = (employeeId: number): string => {
    const employee = employeeService.getEmployeeById(employeeId);
    return employee ? employee.name : `Employee ${employeeId}`;
  };

  private getEmployeeBonus = (employeeId: number, payPeriod: string): number => {
    return bonusService.getEmployeeTotalBonus(employeeId, payPeriod);
  };

  private getEmployeeOvertime = (employeeId: number, payPeriod: string): number => {
    const overtimeRate = 20; // Example overtime rate per hour
    const totalOvertimeHours = attendanceService.getEmployeeOvertimeForPeriod(employeeId, payPeriod);
    return totalOvertimeHours * overtimeRate;
  };

  private getEmployeeDeductions = (employeeId: number, payPeriod: string): number => {
    console.log(`Calculating deductions for employee ${employeeId} for period ${payPeriod}`);
    // Only deduct penalties with 'Deducted' status
    const penalties = penaltyService.getPenaltiesByEmployee(employeeId);
    console.log('All penalties for employee:', penalties);

    const deductiblePenalties = penalties
      .filter(p => p.payPeriod === payPeriod && p.status === 'Deducted');
    
    console.log('Deductible penalties for period:', deductiblePenalties);

    const totalDeductions = deductiblePenalties.reduce((total, p) => total + p.amount, 0);

    console.log('Total deductions:', totalDeductions);

    return totalDeductions;
  };

  private getActiveEmployees = () => {
    return employeeService.getActiveEmployees();
  };
}

export const payrollService = new PayrollService();