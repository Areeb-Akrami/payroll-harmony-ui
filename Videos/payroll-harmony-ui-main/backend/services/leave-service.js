const leaveData = require('../data-layer/leave-data');
const employeeData = require('../data-layer/employee-data');

const getAllLeaves = async () => {
    const leaves = await leaveData.getAllLeaves();
    const employees = await employeeData.getAllEmployees();
    const employeeMap = new Map(employees.map(emp => [emp.id, emp]));

    return leaves.map(leave => {
        const employee = employeeMap.get(leave.employeeId);
        return {
            ...leave,
            employeeName: employee ? employee.name : 'Unknown Employee'
        };
    });
};

const addLeave = async (leave) => {
    return await leaveData.addLeave(leave);
};

const updateLeaveStatus = async (id, status) => {
    return await leaveData.updateLeaveStatus(id, status);
};

module.exports = {
    getAllLeaves,
    addLeave,
    updateLeaveStatus
};