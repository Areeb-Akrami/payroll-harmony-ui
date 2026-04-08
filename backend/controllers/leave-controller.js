const leaveService = require('../services/leave-service');

const getAllLeaves = async (req, res) => {
    try {
        const leaves = await leaveService.getAllLeaves();
        res.json(leaves);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const addLeave = async (req, res) => {
    try {
        const newLeave = await leaveService.addLeave(req.body);
        res.status(201).json(newLeave);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const updateLeaveStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const updatedLeave = await leaveService.updateLeaveStatus(parseInt(id), status);
        if (!updatedLeave) {
            return res.status(404).json({ message: 'Leave not found' });
        }
        res.json(updatedLeave);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getAllLeaves,
    addLeave,
    updateLeaveStatus
};