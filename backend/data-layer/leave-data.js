const { readData, writeData } = require('../utils/file-handler');
const FILENAME = 'leaves.json';

const getAllLeaves = async () => {
    return await readData(FILENAME);
};

const addLeave = async (leave) => {
    const leaves = await getAllLeaves();
    leave.id = new Date().getTime(); // Simple unique ID
    leaves.push(leave);
    await writeData(FILENAME, leaves);
    return leave;
};

const updateLeaveStatus = async (id, status) => {
    const leaves = await getAllLeaves();
    const index = leaves.findIndex(l => l.id === id);
    if (index === -1) {
        return null;
    }
    leaves[index].status = status;
    await writeData(FILENAME, leaves);
    return leaves[index];
};

module.exports = {
    getAllLeaves,
    addLeave,
    updateLeaveStatus
};