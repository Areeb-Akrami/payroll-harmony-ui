// Storage utility wrapper for localStorage
// This makes it easy to replace with API calls later

export interface StorageKey {
  employees: 'employees';
  attendance: 'attendance';
  leaves: 'leaves';
  payroll: 'payroll';
  bonuses: 'bonuses';
  penalties: 'penalties';
  performance: 'performance';
  anomalies: 'anomalies';
}

export type StorageKeys = keyof StorageKey;

export const storage = {
  // Generic get method
  get: <T>(key: StorageKeys): T | null => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error(`Error reading ${key} from localStorage:`, error);
      return null;
    }
  },

  // Generic set method
  set: <T>(key: StorageKeys, value: T): void => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Error saving ${key} to localStorage:`, error);
      throw new Error(`Failed to save ${key}: ${error}`);
    }
  },

  // Generic remove method
  remove: (key: StorageKeys): void => {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error(`Error removing ${key} from localStorage:`, error);
    }
  },

  // Clear all storage
  clear: (): void => {
    try {
      localStorage.clear();
    } catch (error) {
      console.error('Error clearing localStorage:', error);
    }
  },

  // Check if key exists
  exists: (key: StorageKeys): boolean => {
    return localStorage.getItem(key) !== null;
  },

  // Get all keys
  keys: (): string[] => {
    return Object.keys(localStorage);
  }
};

// Helper function to generate unique IDs
export const generateId = (): number => {
  return Date.now() + Math.floor(Math.random() * 1000);
};

// Helper function to get current date in YYYY-MM-DD format
export const getCurrentDate = (): string => {
  return new Date().toISOString().split('T')[0];
};

// Helper function to get current pay period in YYYY-MM format
export const getCurrentPayPeriod = (): string => {
  const now = new Date();
  const year = now.getFullYear();
  const month = (now.getMonth() + 1).toString().padStart(2, '0');
  return `${year}-${month}`;
};

// Helper function to calculate days between two dates
export const calculateDaysBetween = (startDate: string, endDate: string): number => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = Math.abs(end.getTime() - start.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays + 1; // Include both start and end dates
};