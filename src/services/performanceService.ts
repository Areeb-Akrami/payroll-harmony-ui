import { storage, generateId, getCurrentDate } from '../utils/storage';
import { employeeService } from './employeeService';

export interface PerformanceRecord {
  id: number;
  employeeId: number;
  employeeName: string;
  period: string; // Format: "YYYY-MM"
  kpiScore: number; // 0-100
  productivity: number; // 0-100
  quality: number; // 0-100
  teamwork: number; // 0-100
  communication: number; // 0-100
  overallScore: number; // 0-100 (average of all scores)
  rating: 'Excellent' | 'Good' | 'Satisfactory' | 'Needs Improvement' | 'Poor';
  comments?: string;
  reviewedBy?: string;
  reviewDate: string;
  goalsForNextPeriod?: string[];
}

export interface CreatePerformanceRecord {
  employeeId: number;
  period: string;
  kpiScore: number;
  productivity: number;
  quality: number;
  teamwork: number;
  communication: number;
  comments?: string;
  reviewedBy?: string;
  goalsForNextPeriod?: string[];
}

export interface PerformanceStats {
  totalEmployees: number;
  averageScore: number;
  excellentCount: number;
  goodCount: number;
  satisfactoryCount: number;
  needsImprovementCount: number;
  poorCount: number;
}

class PerformanceService {
  private readonly STORAGE_KEY = 'performance' as const;

  // Get all performance records
  getAllPerformance = (): PerformanceRecord[] => {
    try {
      const performance = storage.get<PerformanceRecord[]>(this.STORAGE_KEY);
      return performance || [];
    } catch (error) {
      console.error('Error fetching performance records:', error);
      return [];
    }
  };

  // Get performance record by ID
  getPerformanceById = (id: number): PerformanceRecord | null => {
    try {
      const performance = this.getAllPerformance();
      return performance.find(record => record.id === id) || null;
    } catch (error) {
      console.error(`Error fetching performance record ${id}:`, error);
      return null;
    }
  };

  // Get performance records for specific employee
  getPerformanceByEmployee = (employeeId: number): PerformanceRecord[] => {
    try {
      const performance = this.getAllPerformance();
      return performance.filter(record => record.employeeId === employeeId);
    } catch (error) {
      console.error(`Error fetching performance records for employee ${employeeId}:`, error);
      return [];
    }
  };

  // Get performance records for specific period
  getPerformanceByPeriod = (period: string): PerformanceRecord[] => {
    try {
      const performance = this.getAllPerformance();
      return performance.filter(record => record.period === period);
    } catch (error) {
      console.error(`Error fetching performance records for period ${period}:`, error);
      return [];
    }
  };

  // Get latest performance record for employee
  getLatestPerformance = (employeeId: number): PerformanceRecord | null => {
    try {
      const employeePerformance = this.getPerformanceByEmployee(employeeId);
      if (employeePerformance.length === 0) return null;
      
      return employeePerformance.reduce((latest, current) => {
        return new Date(current.reviewDate) > new Date(latest.reviewDate) ? current : latest;
      });
    } catch (error) {
      console.error(`Error fetching latest performance for employee ${employeeId}:`, error);
      return null;
    }
  };

  // Calculate overall score and rating
  private calculateOverallScore = (kpiScore: number, productivity: number, quality: number, teamwork: number, communication: number): number => {
    return Math.round((kpiScore + productivity + quality + teamwork + communication) / 5);
  };

  private getRatingFromScore = (score: number): 'Excellent' | 'Good' | 'Satisfactory' | 'Needs Improvement' | 'Poor' => {
    if (score >= 90) return 'Excellent';
    if (score >= 80) return 'Good';
    if (score >= 70) return 'Satisfactory';
    if (score >= 60) return 'Needs Improvement';
    return 'Poor';
  };

  // Create new performance record
  createPerformanceRecord = (data: CreatePerformanceRecord): PerformanceRecord => {
    try {
      // Validate scores
      const scores = [data.kpiScore, data.productivity, data.quality, data.teamwork, data.communication];
      if (scores.some(score => score < 0 || score > 100)) {
        throw new Error('All scores must be between 0 and 100');
      }

      const performance = this.getAllPerformance();
      const employeeName = this.getEmployeeName(data.employeeId);
      const overallScore = this.calculateOverallScore(data.kpiScore, data.productivity, data.quality, data.teamwork, data.communication);
      const rating = this.getRatingFromScore(overallScore);

      // Check if performance record already exists for this employee and period
      const existingRecord = performance.find(record => 
        record.employeeId === data.employeeId && record.period === data.period
      );

      if (existingRecord) {
        throw new Error(`Performance record already exists for employee ${data.employeeId} for period ${data.period}`);
      }

      const newRecord: PerformanceRecord = {
        id: generateId(),
        employeeId: data.employeeId,
        employeeName,
        period: data.period,
        kpiScore: data.kpiScore,
        productivity: data.productivity,
        quality: data.quality,
        teamwork: data.teamwork,
        communication: data.communication,
        overallScore,
        rating,
        comments: data.comments,
        reviewedBy: data.reviewedBy,
        reviewDate: getCurrentDate(),
        goalsForNextPeriod: data.goalsForNextPeriod
      };

      performance.push(newRecord);
      storage.set(this.STORAGE_KEY, performance);
      
      return newRecord;
    } catch (error) {
      console.error('Error creating performance record:', error);
      throw new Error(`Failed to create performance record: ${error}`);
    }
  };

  // Update performance record
  updatePerformanceRecord = (id: number, data: Partial<CreatePerformanceRecord>): PerformanceRecord => {
    try {
      const performance = this.getAllPerformance();
      const index = performance.findIndex(record => record.id === id);
      
      if (index === -1) {
        throw new Error(`Performance record with ID ${id} not found`);
      }

      // Recalculate overall score and rating if any scores changed
      const updatedScores = {
        kpiScore: data.kpiScore ?? performance[index].kpiScore,
        productivity: data.productivity ?? performance[index].productivity,
        quality: data.quality ?? performance[index].quality,
        teamwork: data.teamwork ?? performance[index].teamwork,
        communication: data.communication ?? performance[index].communication
      };

      const overallScore = this.calculateOverallScore(
        updatedScores.kpiScore,
        updatedScores.productivity,
        updatedScores.quality,
        updatedScores.teamwork,
        updatedScores.communication
      );

      performance[index] = {
        ...performance[index],
        ...data,
        overallScore,
        rating: this.getRatingFromScore(overallScore)
      };

      storage.set(this.STORAGE_KEY, performance);
      
      return performance[index];
    } catch (error) {
      console.error(`Error updating performance record ${id}:`, error);
      throw new Error(`Failed to update performance record: ${error}`);
    }
  };

  // Delete performance record
  deletePerformanceRecord = (id: number): void => {
    try {
      const performance = this.getAllPerformance();
      const filteredPerformance = performance.filter(record => record.id !== id);
      
      if (performance.length === filteredPerformance.length) {
        throw new Error(`Performance record with ID ${id} not found`);
      }

      storage.set(this.STORAGE_KEY, filteredPerformance);
    } catch (error) {
      console.error(`Error deleting performance record ${id}:`, error);
      throw new Error(`Failed to delete performance record: ${error}`);
    }
  };

  // Get performance statistics
  getPerformanceStats = (): PerformanceStats => {
    try {
      const performance = this.getAllPerformance();
      
      if (performance.length === 0) {
        return {
          totalEmployees: 0,
          averageScore: 0,
          excellentCount: 0,
          goodCount: 0,
          satisfactoryCount: 0,
          needsImprovementCount: 0,
          poorCount: 0
        };
      }

      const totalScore = performance.reduce((sum, record) => sum + record.overallScore, 0);
      const averageScore = Math.round(totalScore / performance.length);

      const ratingCounts = performance.reduce((acc, record) => {
        acc[record.rating] = (acc[record.rating] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      return {
        totalEmployees: performance.length,
        averageScore,
        excellentCount: ratingCounts['Excellent'] || 0,
        goodCount: ratingCounts['Good'] || 0,
        satisfactoryCount: ratingCounts['Satisfactory'] || 0,
        needsImprovementCount: ratingCounts['Needs Improvement'] || 0,
        poorCount: ratingCounts['Poor'] || 0
      };
    } catch (error) {
      console.error('Error getting performance statistics:', error);
      return {
        totalEmployees: 0,
        averageScore: 0,
        excellentCount: 0,
        goodCount: 0,
        satisfactoryCount: 0,
        needsImprovementCount: 0,
        poorCount: 0
      };
    }
  };

  // Get performance trends for employee
  getEmployeePerformanceTrend = (employeeId: number) => {
    try {
      const employeePerformance = this.getPerformanceByEmployee(employeeId);
      
      if (employeePerformance.length === 0) {
        return { trend: [], averageScore: 0, improvement: 0 };
      }

      // Sort by period
      const sortedPerformance = employeePerformance.sort((a, b) => a.period.localeCompare(b.period));
      
      const trend = sortedPerformance.map(record => ({
        period: record.period,
        score: record.overallScore,
        rating: record.rating
      }));

      const averageScore = sortedPerformance.reduce((sum, record) => sum + record.overallScore, 0) / sortedPerformance.length;
      
      // Calculate improvement (if there are at least 2 records)
      let improvement = 0;
      if (sortedPerformance.length >= 2) {
        const firstScore = sortedPerformance[0].overallScore;
        const lastScore = sortedPerformance[sortedPerformance.length - 1].overallScore;
        improvement = lastScore - firstScore;
      }

      return { trend, averageScore: Math.round(averageScore), improvement };
    } catch (error) {
      console.error(`Error getting performance trend for employee ${employeeId}:`, error);
      return { trend: [], averageScore: 0, improvement: 0 };
    }
  };

  // Get top performers
  getTopPerformers = (limit: number = 10) => {
    try {
      const performance = this.getAllPerformance();
      
      if (performance.length === 0) {
        return [];
      }

      // Group by employee and get latest performance record for each
      const employeePerformance: Record<number, PerformanceRecord> = {};
      performance.forEach(record => {
        if (!employeePerformance[record.employeeId] || 
            new Date(record.reviewDate) > new Date(employeePerformance[record.employeeId].reviewDate)) {
          employeePerformance[record.employeeId] = record;
        }
      });

      return Object.values(employeePerformance)
        .sort((a, b) => b.overallScore - a.overallScore)
        .slice(0, limit)
        .map(record => ({
          employeeId: record.employeeId,
          employeeName: record.employeeName,
          overallScore: record.overallScore,
          rating: record.rating,
          reviewDate: record.reviewDate
        }));
    } catch (error) {
      console.error('Error getting top performers:', error);
      return [];
    }
  };

  // Get employees needing improvement
  getEmployeesNeedingImprovement = () => {
    try {
      const performance = this.getAllPerformance();
      
      if (performance.length === 0) {
        return [];
      }

      // Group by employee and get latest performance record for each
      const employeePerformance: Record<number, PerformanceRecord> = {};
      performance.forEach(record => {
        if (!employeePerformance[record.employeeId] || 
            new Date(record.reviewDate) > new Date(employeePerformance[record.employeeId].reviewDate)) {
          employeePerformance[record.employeeId] = record;
        }
      });

      return Object.values(employeePerformance)
        .filter(record => record.overallScore < 70) // Score below 70 needs improvement
        .sort((a, b) => a.overallScore - b.overallScore)
        .map(record => ({
          employeeId: record.employeeId,
          employeeName: record.employeeName,
          overallScore: record.overallScore,
          rating: record.rating,
          reviewDate: record.reviewDate,
          comments: record.comments
        }));
    } catch (error) {
      console.error('Error getting employees needing improvement:', error);
      return [];
    }
  };

  // Helper method to get employee name (will be integrated with employee service)
  private getEmployeeName = (employeeId: number): string => {
    const employee = employeeService.getEmployeeById(employeeId);
    return employee ? employee.name : 'Unknown Employee';
  };
}

export const performanceService = new PerformanceService();