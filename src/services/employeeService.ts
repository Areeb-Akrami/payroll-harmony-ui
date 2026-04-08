import { storage, generateId } from '../utils/storage';
import { eventBus } from '../utils/eventBus';

export interface Employee {
  id: number;
  name: string;
  department: string;
  role: string;
  salary: number;
  status: 'Active' | 'On Leave' | 'Inactive';
  joinDate: string;
  email?: string;
  phone?: string;
  address?: string;
}

export interface CreateEmployee {
  id?: number;
  name: string;
  role: string;
  salary: number;
  department: string;
  status: 'Active' | 'On Leave' | 'Inactive';
  joinDate: string;
}

export interface UpdateEmployeeData extends Partial<CreateEmployee> {}

class EmployeeService {
  private readonly STORAGE_KEY = 'employees' as const;

  // Get all employees
  getAllEmployees = (): Employee[] => {
    try {
      const employees = storage.get<Employee[]>(this.STORAGE_KEY);
      return employees || [];
    } catch (error) {
      console.error('Error fetching employees:', error);
      return [];
    }
  };

  // Get employee by ID
  getEmployeeById = (id: number): Employee | null => {
    try {
      const employees = this.getAllEmployees();
      return employees.find(emp => emp.id === id) || null;
    } catch (error) {
      console.error(`Error fetching employee ${id}:`, error);
      return null;
    }
  };

  // Create new employee
  createEmployee = (data: CreateEmployee): Employee => {
    try {
      const employees = this.getAllEmployees();
      const newEmployee: Employee = {
        id: data.id || generateId(),
        ...data
      };
      
      employees.push(newEmployee);
      storage.set(this.STORAGE_KEY, employees);
      eventBus.emit('DATA_UPDATED', { source: 'employeeService.createEmployee' });
      
      return newEmployee;
    } catch (error) {
      console.error('Error creating employee:', error);
      throw new Error('Failed to create employee');
    }
  };

  // Update employee
  updateEmployee = (id: number, data: UpdateEmployeeData): Employee => {
    try {
      const employees = this.getAllEmployees();
      const index = employees.findIndex(emp => emp.id === id);
      
      if (index === -1) {
        throw new Error(`Employee with ID ${id} not found`);
      }
      
      const originalEmployee = { ...employees[index] };
      const updatedEmployee = { ...employees[index], ...data, id };
      employees[index] = updatedEmployee;
      storage.set(this.STORAGE_KEY, employees);
      eventBus.emit('DATA_UPDATED', { source: 'employeeService.updateEmployee', payload: { before: originalEmployee, after: updatedEmployee } });
      
      return updatedEmployee;
    } catch (error) {
      console.error(`Error updating employee ${id}:`, error);
      throw new Error(`Failed to update employee: ${error}`);
    }
  };

  // Delete employee
  deleteEmployee = (id: number): void => {
    try {
      const employees = this.getAllEmployees();
      const filteredEmployees = employees.filter(emp => emp.id !== id);
      
      if (employees.length === filteredEmployees.length) {
        throw new Error(`Employee with ID ${id} not found`);
      }
      
      storage.set(this.STORAGE_KEY, filteredEmployees);
      eventBus.emit('DATA_UPDATED', { source: 'employeeService.deleteEmployee' });
    } catch (error) {
      console.error(`Error deleting employee ${id}:`, error);
      throw new Error(`Failed to delete employee: ${error}`);
    }
  };

  // Search employees
  searchEmployees = (query: string): Employee[] => {
    try {
      const employees = this.getAllEmployees();
      const lowercaseQuery = query.toLowerCase();
      
      return employees.filter(emp => 
        emp.name.toLowerCase().includes(lowercaseQuery) ||
        emp.department.toLowerCase().includes(lowercaseQuery) ||
        emp.role.toLowerCase().includes(lowercaseQuery) ||
        emp.email?.toLowerCase().includes(lowercaseQuery)
      );
    } catch (error) {
      console.error('Error searching employees:', error);
      return [];
    }
  };

  // Filter employees by department
  getEmployeesByDepartment = (department: string): Employee[] => {
    try {
      const employees = this.getAllEmployees();
      return employees.filter(emp => emp.department === department);
    } catch (error) {
      console.error(`Error filtering employees by department ${department}:`, error);
      return [];
    }
  };

  // Get active employees
  getActiveEmployees = (): Employee[] => {
    try {
      const employees = this.getAllEmployees();
      return employees.filter(emp => emp.status === 'Active');
    } catch (error) {
      console.error('Error fetching active employees:', error);
      return [];
    }
  };

  // Get departments list
  getDepartments = (): string[] => {
    try {
      const employees = this.getAllEmployees();
      const departments = [...new Set(employees.map(emp => emp.department))];
      return departments.sort();
    } catch (error) {
      console.error('Error fetching departments:', error);
      return [];
    }
  };


}

export const employeeService = new EmployeeService();