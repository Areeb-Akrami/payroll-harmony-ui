const attendanceService = require('../services/attendance-service');

const getAllAttendance = async (req, res) => {
    try {
        const attendance = await attendanceService.getAllAttendance();
        res.json(attendance);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const addAttendance = async (req, res) => {
    try {
        const attendanceRecord = await attendanceService.addAttendance(req.body);
        res.status(201).json(attendanceRecord);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

module.exports = {
    getAllAttendance,
    addAttendance
};