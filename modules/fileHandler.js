const fs = require('fs').promises;
const path = require('path');

const DATA_FILE = path.join(__dirname, '../employees.json');

// Read all employees
exports.getEmployees = async () => {
    try {
        const data = await fs.readFile(DATA_FILE, 'utf8');
        return JSON.parse(data);
    } catch (err) {
        // If file doesn't exist, return empty array
        if (err.code === 'ENOENT') return [];
        throw err;
    }
};

// Write employees to file
exports.saveEmployees = async (employees) => {
    try {
        await fs.writeFile(DATA_FILE, JSON.stringify(employees, null, 2));
    } catch (err) {
        console.error("Error writing to file:", err);
        throw err;
    }
};