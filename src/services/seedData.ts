import { Employee } from './employeeService';
import { PayrollRecord } from './payrollService';
import { storage, generateId, getCurrentDate } from '../utils/storage';

// --- EMPLOYEE DATA ---
export const initialEmployees: Omit<Employee, 'id'>[] = [
  {
    name: 'Alice Johnson',
    department: 'Engineering',
    role: 'Senior Developer',
    salary: 95000,
    status: 'Active',
    joinDate: '2022-01-15',
    email: 'alice.j@example.com',
  },
  {
    name: 'Bob Williams',
    department: 'Marketing',
    role: 'Marketing Manager',
    salary: 82000,
    status: 'Active',
    joinDate: '2021-06-20',
    email: 'bob.w@example.com',
  },
  {
    name: 'Charlie Brown',
    department: 'Sales',
    role: 'Sales Representative',
    salary: 70000,
    status: 'Active',
    joinDate: '2023-03-10',
    email: 'charlie.b@example.com',
  },
  {
    name: 'Diana Miller',
    department: 'HR',
    role: 'HR Specialist',
    salary: 65000,
    status: 'Active',
    joinDate: '2022-11-05',
    email: 'diana.m@example.com',
  },
  {
    name: 'Ethan Jones',
    department: 'Engineering',
    role: 'Junior Developer',
    salary: 60000,
    status: 'Active',
    joinDate: '2023-08-01',
    email: 'ethan.j@example.com',
  },
  {
    name: 'Fiona Davis',
    department: 'Finance',
    role: 'Accountant',
    salary: 75000,
    status: 'Active',
    joinDate: '2020-02-18',
    email: 'fiona.d@example.com',
  },
];

/**
 * Clears all data from storage.
 * This function should be called once when the application starts to ensure a clean state.
 */
export const seedAllData = () => {
  storage.clear();
  console.log('🗑️ All storage data cleared.');
};