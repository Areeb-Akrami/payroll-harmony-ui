const fs = require('fs').promises;
const path = require('path');

const dataFilePath = (fileName) => path.join(__dirname, '..', 'data', fileName);

const readData = async (fileName) => {
    try {
        const filePath = dataFilePath(fileName);
        const data = await fs.readFile(filePath, 'utf-8');
        return JSON.parse(data);
    } catch (error) {
        if (error.code === 'ENOENT') {
            // File doesn't exist, return empty array
            return [];
        }
        throw error;
    }
};

const writeData = async (fileName, data) => {
    const filePath = dataFilePath(fileName);
    await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');
};

module.exports = { readData, writeData };