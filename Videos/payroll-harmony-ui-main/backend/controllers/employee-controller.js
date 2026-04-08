const employeeService = require('../services/employee-service');

const getAllEmployees = async (req, res) => {
    try {
        const employees = await employeeService.getAllEmployees();
        res.json(employees);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getEmployeeById = async (req, res) => {
    try {
        const employee = await employeeService.getEmployeeById(parseInt(req.params.id));
        if (!employee) {
            return res.status(404).json({ message: 'Employee not found' });
        }
        res.json(employee);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const addEmployee = async (req, res) => {
    try {
        const employee = await employeeService.addEmployee(req.body);
        res.status(201).json(employee);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const updateEmployee = async (req, res) => {
    try {
        const employee = await employeeService.updateEmployee(parseInt(req.params.id), req.body);
        if (!employee) {
            return res.status(404).json({ message: 'Employee not found' });
        }
        res.json(employee);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const deleteEmployee = async (req, res) => {
    try {
        const success = await employeeService.deleteEmployee(parseInt(req.params.id));
        if (!success) {
            return res.status(404).json({ message: 'Employee not found' });
        }
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getAllEmployees,
    getEmployeeById,
    addEmployee,
    updateEmployee,
    deleteEmployee
};