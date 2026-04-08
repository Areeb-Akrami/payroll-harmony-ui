const { readData, writeData } = require('../utils/file-handler');
const FILENAME = 'attendance.json';

const getAllAttendance = async () => {
    return await readData(FILENAME);
};

const addAttendance = async (attendanceRecord) => {
    const attendance = await getAllAttendance();
    attendanceRecord.id = new Date().getTime(); // Simple unique ID
    attendance.push(attendanceRecord);
    await writeData(FILENAME, attendance);
    return attendanceRecord;
};

module.exports = {
    getAllAttendance,
    addAttendance
};