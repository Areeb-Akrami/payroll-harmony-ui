import { storage, generateId, getCurrentDate } from '../utils/storage';
import { employeeService } from './employeeService';
import { eventBus } from '../utils/eventBus';

export interface PenaltyRecord {
  id: number;
  employeeId: number;
  employeeName: string;
  type: 'Late' | 'Absence' | 'Early Leave' | 'Policy Violation' | 'Performance' | 'Other';
  amount: number;
  reason: string;
  date: string;
  payPeriod: string; // Format: "YYYY-MM"
  status: 'Pending' | 'Approved' | 'Deducted';
  approvedBy?: string;
  approvedDate?: string;
  occurrence: number; // Number of times this type of penalty occurred
  notes?: string;
}

export interface CreatePenalty {
  employeeId: number;
  type: 'Late' | 'Absence' | 'Early Leave' | 'Policy Violation' | 'Performance' | 'Other';
  amount: number;
  reason: string;
  date?: string;
  payPeriod?: string;
  notes?: string;
}

export interface UpdatePenaltyStatus {
  status: 'Approved' | 'Deducted';
  approvedBy?: string;
  notes?: string;
}

class PenaltyService {
  private readonly STORAGE_KEY = 'penalties' as const;
  private readonly PENALTY_RATES = {
    Late: 50,
    Absence: 200,
    'Early Leave': 75,
    'Policy Violation': 100,
    Performance: 150,
    Other: 100
  };

  // Get all penalty records
  getAllPenalties = (): PenaltyRecord[] => {
    try {
      const penalties = storage.get<PenaltyRecord[]>(this.STORAGE_KEY);
      return penalties || [];
    } catch (error) {
      console.error('Error fetching penalties:', error);
      return [];
    }
  };

  // Get penalty record by ID
  getPenaltyById = (id: number): PenaltyRecord | null => {
    try {
      const penalties = this.getAllPenalties();
      return penalties.find(penalty => penalty.id === id) || null;
    } catch (error) {
      console.error(`Error fetching penalty ${id}:`, error);
      return null;
    }
  };

  // Get penalty records for specific employee
  getPenaltiesByEmployee = (employeeId: number): PenaltyRecord[] => {
    try {
      const penalties = this.getAllPenalties();
      return penalties.filter(penalty => penalty.employeeId === employeeId);
    } catch (error) {
      console.error(`Error fetching penalties for employee ${employeeId}:`, error);
      return [];
    }
  };

  // Get penalty records for specific pay period
  getPenaltiesByPeriod = (payPeriod: string): PenaltyRecord[] => {
    try {
      const penalties = this.getAllPenalties();
      return penalties.filter(penalty => penalty.payPeriod === payPeriod && penalty.status === 'Deducted');
    } catch (error) {
      console.error(`Error fetching penalties for period ${payPeriod}:`, error);
      return [];
    }
  };

  // Get pending penalties
  getPendingPenalties = (): PenaltyRecord[] => {
    try {
      const penalties = this.getAllPenalties();
      return penalties.filter(penalty => penalty.status === 'Pending');
    } catch (error) {
      console.error('Error fetching pending penalties:', error);
      return [];
    }
  };

  // Get approved penalties
  getApprovedPenalties = (): PenaltyRecord[] => {
    try {
      const penalties = this.getAllPenalties();
      return penalties.filter(penalty => penalty.status === 'Approved');
    } catch (error) {
      console.error('Error fetching approved penalties:', error);
      return [];
    }
  };

  // Create new penalty record
  createPenalty = (data: CreatePenalty): PenaltyRecord => {
    try {
      const penalties = this.getAllPenalties();
      const currentDate = data.date || getCurrentDate();
      const payPeriod = data.payPeriod || currentDate.slice(0, 7); // YYYY-MM format
      const employee = employeeService.getEmployeeById(data.employeeId);
      if (!employee) {
        throw new Error(`Employee with ID ${data.employeeId} not found`);
      }
      const employeeName = employee.name;

      // Calculate occurrence count for this type of penalty
      const employeePenalties = this.getPenaltiesByEmployee(data.employeeId);
      const occurrence = employeePenalties.filter(p => p.type === data.type).length + 1;

      const newPenalty: PenaltyRecord = {
        id: generateId(),
        employeeId: data.employeeId,
        employeeName,
        type: data.type,
        amount: data.amount,
        reason: data.reason,
        date: currentDate,
        payPeriod,
        status: 'Pending',
        occurrence,
        notes: data.notes
      };

      penalties.push(newPenalty);
      storage.set(this.STORAGE_KEY, penalties);
      eventBus.emit('DATA_UPDATED', { source: 'penaltyService.createPenalty' });
      
      return newPenalty;
    } catch (error) {
      console.error('Error creating penalty:', error);
      throw new Error(`Failed to create penalty: ${error}`);
    }
  };

  // Auto-create penalty based on attendance (late, absence, etc.)
  createAutoPenalty = (employeeId: number, type: 'Late' | 'Absence' | 'Early Leave', date: string, reason: string): PenaltyRecord => {
    try {
      const amount = this.PENALTY_RATES[type];
      return this.createPenalty({
        employeeId,
        type,
        amount,
        reason,
        date
      });
    } catch (error) {
      console.error(`Error creating auto penalty for employee ${employeeId}:`, error);
      throw new Error(`Failed to create auto penalty: ${error}`);
    }
  };

  // Update penalty status
  updatePenaltyStatus = (id: number, data: UpdatePenaltyStatus): PenaltyRecord => {
    try {
      const penalties = this.getAllPenalties();
      const index = penalties.findIndex(penalty => penalty.id === id);
      
      if (index === -1) {
        throw new Error(`Penalty record with ID ${id} not found`);
      }

      if (penalties[index].status === 'Deducted') {
        throw new Error('Deducted penalties cannot be updated');
      }

      penalties[index] = {
        ...penalties[index],
        status: data.status,
        approvedBy: data.approvedBy,
        approvedDate: data.status === 'Approved' ? getCurrentDate() : penalties[index].approvedDate,
        notes: data.notes || penalties[index].notes
      };

      storage.set(this.STORAGE_KEY, penalties);
      eventBus.emit('DATA_UPDATED', { source: 'penaltyService.updatePenaltyStatus' });
      
      return penalties[index];
    } catch (error) {
      console.error(`Error updating penalty status ${id}:`, error);
      throw new Error(`Failed to update penalty status: ${error}`);
    }
  };

  // Delete penalty record (only if not deducted)
  deletePenalty = (id: number): void => {
    try {
      const penalties = this.getAllPenalties();
      const penalty = penalties.find(p => p.id === id);
      
      if (!penalty) {
        throw new Error(`Penalty record with ID ${id} not found`);
      }

      if (penalty.status === 'Deducted') {
        throw new Error('Deducted penalties cannot be deleted');
      }

      const filteredPenalties = penalties.filter(p => p.id !== id);
      storage.set(this.STORAGE_KEY, filteredPenalties);
    } catch (error) {
      console.error(`Error deleting penalty ${id}:`, error);
      throw new Error(`Failed to delete penalty: ${error}`);
    }
  };

  // Get total penalties for employee in specific period
  getEmployeeTotalPenalties = (employeeId: number, payPeriod: string): number => {
    try {
      const penalties = this.getPenaltiesByEmployee(employeeId);
      return penalties
        .filter(penalty => penalty.payPeriod === payPeriod && penalty.status === 'Deducted')
        .reduce((sum, penalty) => sum + penalty.amount, 0);
    } catch (error) {
      console.error(`Error calculating total penalties for employee ${employeeId}:`, error);
      return 0;
    }
  };

  // Get penalty statistics
  getPenaltyStats = () => {
    try {
      const penalties = this.getAllPenalties();
      const currentMonth = new Date().toISOString().slice(0, 7);

      const thisMonthPenalties = penalties.filter(penalty => penalty.payPeriod === currentMonth);

      const stats = {
        totalPenalties: penalties.length,
        totalAmount: penalties.reduce((sum, penalty) => sum + penalty.amount, 0),
        pendingPenalties: penalties.filter(p => p.status === 'Pending').length,
        approvedPenalties: penalties.filter(p => p.status === 'Approved').length,
        deductedPenalties: penalties.filter(p => p.status === 'Deducted').length,
        thisMonthPenalties: thisMonthPenalties.length,
        thisMonthAmount: thisMonthPenalties.reduce((sum, penalty) => sum + penalty.amount, 0),
        averagePenaltyAmount: penalties.length > 0 ? penalties.reduce((sum, penalty) => sum + penalty.amount, 0) / penalties.length : 0
      };

      return stats;
    } catch (error) {
      console.error('Error getting penalty statistics:', error);
      return {
        totalPenalties: 0,
        totalAmount: 0,
        pendingPenalties: 0,
        approvedPenalties: 0,
        deductedPenalties: 0,
        thisMonthPenalties: 0,
        thisMonthAmount: 0,
        averagePenaltyAmount: 0
      };
    }
  };

  // Get penalty breakdown by type
  getPenaltyBreakdownByType = () => {
    try {
      const penalties = this.getAllPenalties();
      const breakdown: Record<string, { count: number; totalAmount: number; averageAmount: number }> = {};

      penalties.forEach(penalty => {
        if (!breakdown[penalty.type]) {
          breakdown[penalty.type] = { count: 0, totalAmount: 0, averageAmount: 0 };
        }
        breakdown[penalty.type].count++;
        breakdown[penalty.type].totalAmount += penalty.amount;
      });

      // Calculate averages
      Object.keys(breakdown).forEach(type => {
        breakdown[type].averageAmount = breakdown[type].totalAmount / breakdown[type].count;
      });

      return breakdown;
    } catch (error) {
      console.error('Error getting penalty breakdown by type:', error);
      return {};
    }
  };

  // Get top employees with most penalties
  getTopPenalizedEmployees = (limit: number = 10) => {
    try {
      const penalties = this.getAllPenalties();
      const employeePenalties: Record<number, { employeeName: string; count: number; totalAmount: number }> = {};

      penalties.forEach(penalty => {
        if (!employeePenalties[penalty.employeeId]) {
          employeePenalties[penalty.employeeId] = {
            employeeName: penalty.employeeName,
            count: 0,
            totalAmount: 0
          };
        }
        employeePenalties[penalty.employeeId].count++;
        employeePenalties[penalty.employeeId].totalAmount += penalty.amount;
      });

      return Object.entries(employeePenalties)
        .map(([employeeId, data]) => ({
          employeeId: parseInt(employeeId),
          ...data
        }))
        .sort((a, b) => b.totalAmount - a.totalAmount)
        .slice(0, limit);
    } catch (error) {
      console.error('Error getting top penalized employees:', error);
      return [];
    }
  };


}

export const penaltyService = new PenaltyService();