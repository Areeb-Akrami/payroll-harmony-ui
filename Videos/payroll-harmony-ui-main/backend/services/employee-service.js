const employeeData = require('../data-layer/employee-data');

const getAllEmployees = async () => {
    return await employeeData.getAllEmployees();
};

const getEmployeeById = async (id) => {
    return await employeeData.getEmployeeById(id);
};

const addEmployee = async (employee) => {
    // In a real application, you would have more complex validation here
    return await employeeData.addEmployee(employee);
};

const updateEmployee = async (id, employee) => {
    return await employeeData.updateEmployee(id, employee);
};

const deleteEmployee = async (id) => {
    return await employeeData.deleteEmployee(id);
};

module.exports = {
    getAllEmployees,
    getEmployeeById,
    addEmployee,
    updateEmployee,
    deleteEmployee
};