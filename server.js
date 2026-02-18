const express = require('express');
const path = require('path');
const fileHandler = require('./modules/fileHandler');

const app = express();
const PORT = 3000;

// Middleware
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));

// --- ROUTES ---

// 1. Dashboard (Read & Display)
app.get('/', async (req, res) => {
    const employees = await fileHandler.getEmployees();
    
    // Calculate Tax (12%) and Net Salary for display only
    const processedEmployees = employees.map(emp => {
        const salary = Number(emp.salary);
        const tax = salary * 0.12; 
        return {
            ...emp,
            tax: tax,
            netSalary: salary - tax
        };
    });

    res.render('index', { employees: processedEmployees });
});

// 2. Add Employee Form
app.get('/add', (req, res) => {
    res.render('add');
});

// 3. Process Add Employee (Create)
// UPDATED: Now accepts 'startDate' directly
app.post('/add', async (req, res) => {
    const { name, gender, department, salary, startDate, notes } = req.body;

    // Validation
    if (!name || !salary || Number(salary) < 0) {
        return res.send("Error: Name is required and Salary cannot be negative.");
    }

    const newEmployee = {
        id: Date.now(),
        name,
        gender,
        // Handle department as array even if single checkbox checked
        department: Array.isArray(department) ? department : (department ? [department] : []), 
        salary: Number(salary),
        startDate: startDate, // DIRECTLY SAVED (Format: YYYY-MM-DD)
        notes,
        profilePic: `https://ui-avatars.com/api/?name=${name}&background=random`
    };

    const employees = await fileHandler.getEmployees();
    employees.push(newEmployee);
    await fileHandler.saveEmployees(employees);

    res.redirect('/');
});

// 4. Edit Employee Form (Read Single)
// UPDATED: No longer splits the date. Passes the employee object "as is".
app.get('/edit/:id', async (req, res) => {
    const employees = await fileHandler.getEmployees();
    const employee = employees.find(e => e.id == req.params.id);
    
    if (!employee) return res.redirect('/');
    
    // We send the employee object. The EJS file will use employee.startDate directly.
    res.render('edit', { employee });
});

// 5. Process Edit (Update)
// UPDATED: Now reads 'startDate' from body
app.post('/edit/:id', async (req, res) => {
    const { name, gender, department, salary, startDate, notes } = req.body;
    let employees = await fileHandler.getEmployees();

    const index = employees.findIndex(e => e.id == req.params.id);
    if (index !== -1) {
        employees[index] = {
            ...employees[index],
            name,
            gender,
            department: Array.isArray(department) ? department : (department ? [department] : []),
            salary: Number(salary),
            startDate: startDate, // DIRECTLY UPDATED
            notes
        };
        await fileHandler.saveEmployees(employees);
    }
    res.redirect('/');
});

// 6. Delete Employee
app.get('/delete/:id', async (req, res) => {
    let employees = await fileHandler.getEmployees();
    employees = employees.filter(e => e.id != req.params.id);
    await fileHandler.saveEmployees(employees);
    res.redirect('/');
});

app.listen(PORT, () => {
    console.log(`Payroll App running at http://localhost:${PORT}`);
});
