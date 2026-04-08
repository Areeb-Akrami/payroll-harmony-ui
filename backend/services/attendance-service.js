const attendanceData = require('../data-layer/attendance-data');
const employeeData = require('../data-layer/employee-data');

const getAllAttendance = async () => {
    const attendanceRecords = await attendanceData.getAllAttendance();
    const employees = await employeeData.getAllEmployees();
    const employeeMap = new Map(employees.map(emp => [emp.id, emp]));

    return attendanceRecords.map(record => {
        const employee = employeeMap.get(record.employeeId);
        return {
            ...record,
            name: employee ? employee.name : 'Unknown Employee',
            dept: employee ? employee.role : 'N/A', // Using role as department
        };
    });
};

const addAttendance = async (attendanceRecord) => {
    // In a real application, you would have more complex validation here
    return await attendanceData.addAttendance(attendanceRecord);
};

module.exports = {
    getAllAttendance,
    addAttendance
};