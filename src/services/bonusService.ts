import { storage, generateId, getCurrentDate, getCurrentPayPeriod } from '../utils/storage';
import { employeeService } from './employeeService';
import { eventBus } from '../utils/eventBus';

export interface BonusRecord {
  id: number;
  employeeId: number;
  employeeName: string;
  type: 'Performance' | 'Referral' | 'Holiday' | 'Retention' | 'Project Completion' | 'Other';
  amount: number;
  description: string;
  date: string;
  payPeriod: string; // Format: "YYYY-MM"
  status: 'Pending' | 'Approved' | 'Paid' | 'Rejected';
  approvedBy?: string;
  approvedDate?: string;
  notes?: string;
  reason?: string;
}

export interface CreateBonus {
  employeeId: number;
  type: 'Performance' | 'Referral' | 'Holiday' | 'Retention' | 'Project Completion' | 'Other';
  amount: number;
  description: string;
  date?: string;
  payPeriod?: string;
  notes?: string;
  reason?: string;
  status?: 'Pending' | 'Approved' | 'Paid' | 'Rejected';
}

export interface UpdateBonusStatus {
  status: 'Approved' | 'Paid' | 'Rejected';
  approvedBy?: string;
  notes?: string;
  reason?: string;
}

class BonusService {
  private readonly STORAGE_KEY = 'bonuses' as const;

  // Get all bonus records
  getAllBonuses = (): BonusRecord[] => {
    try {
      const bonuses = storage.get<BonusRecord[]>(this.STORAGE_KEY);
      return bonuses || [];
    } catch (error) {
      console.error('Error fetching bonuses:', error);
      return [];
    }
  };

  // Get bonus record by ID
  getBonusById = (id: number): BonusRecord | null => {
    try {
      const bonuses = this.getAllBonuses();
      return bonuses.find(bonus => bonus.id === id) || null;
    } catch (error) {
      console.error(`Error fetching bonus ${id}:`, error);
      return null;
    }
  };

  // Get bonus records for specific employee
  getBonusesByEmployee = (employeeId: number): BonusRecord[] => {
    try {
      const bonuses = this.getAllBonuses();
      return bonuses.filter(bonus => bonus.employeeId === employeeId);
    } catch (error) {
      console.error(`Error fetching bonuses for employee ${employeeId}:`, error);
      return [];
    }
  };

  // Get bonus records for specific pay period
  getBonusesByPeriod = (payPeriod: string): BonusRecord[] => {
    try {
      const bonuses = this.getAllBonuses();
      return bonuses.filter(bonus => bonus.payPeriod === payPeriod && bonus.status === 'Paid');
    } catch (error) {
      console.error(`Error fetching bonuses for period ${payPeriod}:`, error);
      return [];
    }
  };

  // Get pending bonuses
  getPendingBonuses = (): BonusRecord[] => {
    try {
      const bonuses = this.getAllBonuses();
      return bonuses.filter(bonus => bonus.status === 'Pending');
    } catch (error) {
      console.error('Error fetching pending bonuses:', error);
      return [];
    }
  };

  // Get approved bonuses
  getApprovedBonuses = (): BonusRecord[] => {
    try {
      const bonuses = this.getAllBonuses();
      return bonuses.filter(bonus => bonus.status === 'Approved');
    } catch (error) {
      console.error('Error fetching approved bonuses:', error);
      return [];
    }
  };

  // Create new bonus record
  createBonus = (data: CreateBonus): BonusRecord => {
    try {
      const bonuses = this.getAllBonuses();
      const employee = employeeService.getEmployeeById(data.employeeId);
      if (!employee) {
        throw new Error(`Employee with ID ${data.employeeId} not found`);
      }
      const employeeName = employee.name;

      const newBonus: BonusRecord = {
        id: generateId(),
        employeeId: data.employeeId,
        employeeName,
        type: data.type,
        amount: data.amount,
        description: data.description,
        date: data.date || getCurrentDate(),
        payPeriod: data.payPeriod || getCurrentPayPeriod(),
        status: data.status || 'Pending',
        notes: data.notes,
        reason: data.reason
      };

      bonuses.push(newBonus);
      storage.set(this.STORAGE_KEY, bonuses);
      eventBus.emit('DATA_UPDATED', { source: 'bonusService.createBonus' });
      
      return newBonus;
    } catch (error) {
      console.error('Error creating bonus:', error);
      throw new Error(`Failed to create bonus: ${error}`);
    }
  };

  // Update bonus status
  updateBonusStatus = (id: number, data: UpdateBonusStatus): BonusRecord => {
    try {
      const bonuses = this.getAllBonuses();
      const index = bonuses.findIndex(bonus => bonus.id === id);
      
      if (index === -1) {
        throw new Error(`Bonus record with ID ${id} not found`);
      }

      if (bonuses[index].status === 'Paid') {
        throw new Error('Paid bonuses cannot be updated');
      }

      bonuses[index] = {
        ...bonuses[index],
        status: data.status,
        approvedBy: data.approvedBy,
        approvedDate: data.status === 'Approved' ? getCurrentDate() : bonuses[index].approvedDate,
        notes: data.notes || bonuses[index].notes,
        reason: data.reason || bonuses[index].reason
      };

      storage.set(this.STORAGE_KEY, bonuses);
      eventBus.emit('DATA_UPDATED', { source: 'bonusService.updateBonusStatus' });
      
      return bonuses[index];
    } catch (error) {
      console.error(`Error updating bonus status ${id}:`, error);
      throw new Error(`Failed to update bonus status: ${error}`);
    }
  };

  // Delete bonus record (only if not paid)
  deleteBonus = (id: number): void => {
    try {
      const bonuses = this.getAllBonuses();
      const bonus = bonuses.find(b => b.id === id);
      
      if (!bonus) {
        throw new Error(`Bonus record with ID ${id} not found`);
      }

      if (bonus.status === 'Paid') {
        throw new Error('Paid bonuses cannot be deleted');
      }

      const filteredBonuses = bonuses.filter(b => b.id !== id);
      storage.set(this.STORAGE_KEY, filteredBonuses);
    } catch (error) {
      console.error(`Error deleting bonus ${id}:`, error);
      throw new Error(`Failed to delete bonus: ${error}`);
    }
  };

  // Get total bonuses for employee in specific period
  getEmployeeTotalBonus = (employeeId: number, payPeriod: string): number => {
    try {
      const bonuses = this.getBonusesByEmployee(employeeId);
      return bonuses
        .filter(bonus => bonus.payPeriod === payPeriod && bonus.status === 'Paid')
        .reduce((sum, bonus) => sum + bonus.amount, 0);
    } catch (error) {
      console.error(`Error calculating total bonus for employee ${employeeId}:`, error);
      return 0;
    }
  };

  // Get bonus statistics
  getBonusStats = () => {
    try {
      const bonuses = this.getAllBonuses();
      const currentMonth = new Date().toISOString().slice(0, 7);

      const thisMonthBonuses = bonuses.filter(bonus => bonus.payPeriod === currentMonth);

      const stats = {
        totalBonuses: bonuses.length,
        totalAmount: bonuses.reduce((sum, bonus) => sum + bonus.amount, 0),
        pendingBonuses: bonuses.filter(b => b.status === 'Pending').length,
        approvedBonuses: bonuses.filter(b => b.status === 'Approved').length,
        paidBonuses: bonuses.filter(b => b.status === 'Paid').length,
        thisMonthBonuses: thisMonthBonuses.length,
        thisMonthAmount: thisMonthBonuses.reduce((sum, bonus) => sum + bonus.amount, 0),
        averageBonusAmount: bonuses.length > 0 ? bonuses.reduce((sum, bonus) => sum + bonus.amount, 0) / bonuses.length : 0
      };

      return stats;
    } catch (error) {
      console.error('Error getting bonus statistics:', error);
      return {
        totalBonuses: 0,
        totalAmount: 0,
        pendingBonuses: 0,
        approvedBonuses: 0,
        paidBonuses: 0,
        thisMonthBonuses: 0,
        thisMonthAmount: 0,
        averageBonusAmount: 0
      };
    }
  };

  // Get bonus breakdown by type
  getBonusBreakdownByType = () => {
    try {
      const bonuses = this.getAllBonuses();
      const breakdown: Record<string, { count: number; totalAmount: number }> = {};

      bonuses.forEach(bonus => {
        if (!breakdown[bonus.type]) {
          breakdown[bonus.type] = { count: 0, totalAmount: 0 };
        }
        breakdown[bonus.type].count++;
        breakdown[bonus.type].totalAmount += bonus.amount;
      });

      return breakdown;
    } catch (error) {
      console.error('Error getting bonus breakdown by type:', error);
      return {};
    }
  };




}

export const bonusService = new BonusService();