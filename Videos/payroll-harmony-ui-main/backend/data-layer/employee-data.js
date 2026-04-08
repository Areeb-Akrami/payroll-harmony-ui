const { readData, writeData } = require('../utils/file-handler');
const FILENAME = 'employees.json';

const getAllEmployees = async () => {
    return await readData(FILENAME);
};

const getEmployeeById = async (id) => {
    const employees = await getAllEmployees();
    return employees.find(emp => emp.id === id);
};

const addEmployee = async (employee) => {
    const employees = await getAllEmployees();
    employee.id = new Date().getTime(); // Simple unique ID
    const newEmployee = {
        id: new Date().getTime(),
        name: employee.name,
        role: employee.role,
        salary: employee.salary,
        dept: employee.dept,
        status: employee.status,
        joined: employee.joined
    };
    employees.push(newEmployee);
    await writeData(FILENAME, employees);
    return newEmployee;
};

const updateEmployee = async (id, updatedEmployee) => {
    const employees = await getAllEmployees();
    const index = employees.findIndex(emp => emp.id === id);
    if (index === -1) {
        return null;
    }
    employees[index] = { ...employees[index], ...updatedEmployee };
    await writeData(FILENAME, employees);
    return employees[index];
};

const deleteEmployee = async (id) => {
    const employees = await getAllEmployees();
    const index = employees.findIndex(emp => emp.id === id);
    if (index === -1) {
        return false;
    }
    employees.splice(index, 1);
    await writeData(FILENAME, employees);
    return true;
};

module.exports = {
    getAllEmployees,
    getEmployeeById,
    addEmployee,
    updateEmployee,
    deleteEmployee
};