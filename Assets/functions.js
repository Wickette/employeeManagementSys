//view all departments

const inquirer = require("inquirer");
const Choices = require("inquirer/lib/objects/choices");
const { INITIALLY_DEFERRED } = require("sequelize/types/lib/deferrable");

//table shows department_names and department_ids
function departmentTable() {
  db.query("SELECT * FROM department", function (err, results) {
    if (err) throw err;
    console.table(results);
  });
}
//view all roles
//table shows job_title. role_id, department the role belogs too, salary
function rolesTable() {
  const sql =
    "SELECT roles.id, title, salary, department.name FROM department INNER JOIN roles ON roles.department_id = department.id";
  db.query(sql, (err, results) => {
    if (err) {
      console.log(err);
    } else {
      console.table(results);
    }
  });
}

//view all employees
//table shows employee_ids, first_name, lat_name, job_title, departments, salaries and managers
function employeeAllTable() {
  const sql = `
            SELECT employees.id AS ID,
                employees.first_name AS First_Name,
                employees.last_name AS Last_Name,
                roles.title AS Title,
                departments.name AS Department,
                roles.salary AS Salary,
            CONCAT(managers.first_name, " ", managers.last_name) AS Manager
            FROM employees
            INNER JOIN roles
            ON employees.role_id = roles.id
            INNER JOIN departments
            ON roles.department_id = departments.id
            LEFT OUTER JOIN employees AS Managers
            ON employees.manager_id = managers.id;`;
  db.query(sql, (err, results) => {
    if (err) {
      console.log(err);
    } else {
      console.table(results);
    }
  });
}

//add a department
//prompted for name of the department
function addDepartment() {
  inquirer
    .prompt([
      {
        type: "input",
        name: "department_name",
        message: "What is the name of the department?",
      },
    ])
    .then((answers) => {
      const sql = `
                INSERT INTO departments (name)
                VALUES ("${answers.department_name}")`;
      db.query(sql, (err, results) => {
        if (err) {
          console.log(err);
          return
        }
        console.log(`Added ${answers.department_name} to the departments table!`)
        init();
      })
    });
};

//add a role
//prompted for name, salary, and department the role belongs too
function addRole() {
  inquirer.prompt([
    {
      type: "input",
      message: "What is the title of the role?",
      name: "role_title",
    },
    {
      type: "input",
      message: "What is the salary for this role?",
      name: "role_salary",
    },
    {
      type: "input",
      message: "What department_id is this role associated with?",
      name: "role_id"
    }
  ])
  .then((answers) => {
    const sql = `
            INSERT INTO roles (title, salary, department_id)
            VALUES ("${answers.role_title}, ${answers.role_salary}, ${answers.role_id}")
    `
    db.query(sql, (err, results) => {
      if (err) {
        console.log(err);
        return
      }
      console.log(`Added ${answers.role_title} to the database!`)
      init();
    });
  });
};

// add an employee
//prompted for first name, last name, role and manager
function addEmployee() {
  inquirer.prompt([
    {
      type: "input",
      message: "What is the employees first name?",
      name: "fName",
    },
    {
      type: "input",
      message: "What is the employees last name?",
      name: "lName",
    },
    {
      type: "input",
      message: "What is the employees role?",
      name: "fName",
    },
    {
      type: "input",
      message: "What is the employees role id?",
      name: "role_id",
    },
    {
      type: "input",
      message: "What is the employees managers id?",
      name: "manager_id",
    },    
  ])
  .then((answers) => {
    let sql = `
        INSERT INTO employees (first_name, last_name, role_id, manager_id)
        VALUES ("${answers.fName}", "${answers.lName}", ${answers.role_id}, ${manager_id})
    `
    db.query(sql, (err, results) => {
      if (err) {
        console.log(err);
        return
      }
      console.log(`Added ${answers.fName} ${answers.lName} to the database!`);
      init();
    });
  });
};

//update an employee
//prompted to select the employee that needs updating and update their role
