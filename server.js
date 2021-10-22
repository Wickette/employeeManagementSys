const inquirer = require("inquirer");
const express = require("express");
require("dotenv").config();
const cTable = require("console.table");
const mysql = require("mysql2");

const PORT = process.env.PORT || 4000;
const app = express();

// Express middleware
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

const db = mysql.createConnection(
  {
    host: process.env.DB_HOST,
    // MySQL username,
    user: process.env.DB_USER,
    // MySQL password
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
  },
  console.log(`Connected to the employee_db database.`)
);

function departmentTable() {
  db.query("SELECT * FROM departments ORDER BY departments.id", function (err, results) {
    if (err) {
      console.log(err);
      return;
    }
    console.table(results);
    init();
    return;
  });
};
function rolesTable() {
  const sql =
    "SELECT roles.id, title, salary, departments.name FROM departments INNER JOIN roles ON roles.department_id = departments.id ORDER BY roles.id";
  db.query(sql, (err, results) => {
    if (err) {
      console.log(err);
      return;
    } else {
      console.table(results);
      init();
      return;
    }
  });
};
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
            ON employees.manager_id = managers.id
            ORDER BY employees.id`;
  db.query(sql, (err, results) => {
    if (err) {
      console.log(err);
      return;
    } else {
      console.table(results);
      init();
      return;
    }
  });
};
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
          return;
        }
        console.table(results);
        init();
      });
    });
};
function addRole() {
  const rolesArray = [];
  let sql = `SELECT * from departments`;
  db.query(sql, (err, results) => {
    if (err) {
      console.log(err);
      return
    }
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
        type: "list",
        message: "What department is this role associated with?",
        name: "role_id",
        choices: results.map((department) => {
          return {
            name: department.name,
            value: department.id
          }
        })
      },
    ])
    .then((answers) => {
      const sql = `
              INSERT INTO roles (title, salary, department_id)
              VALUES ("${answers.role_title}", ${answers.role_salary}, ${answers.role_id})
      `;
      db.query(sql, (err, results) => {
        if (err) {
          console.log(err);
          return;
        }
        console.table(results);
        init();
        return;
      });

  })
  
    });
};
function addEmployee() {
  const sql = `SELECT * FROM roles`;
  db.query(sql, (err, roleResults) => {
    if (err) {
      console.log(err);
      return;
    }
    const sql = `SELECT * FROM employees`;
    db.query(sql, (err, managerResults) => {
      if (err) {
        console.log(err);
        return;
      }
      console.log(managerResults)
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
        type: "list",
        message: "What is the employees role?",
        name: "role_title",
        choices: roleResults.map((role) => {
          return {
            name: role.title,
            value: role.id
          }
        })
      },
      {
        type: "list",
        message: "Who is the employees manager?",
        name: "manager",
        choices: [{ name: "None", value: null }, ...managerResults.map((manager) => {
          return {
            name: manager.first_name + " " + manager.last_name,
            value: manager.id
          }
        })]
      },
    ])
    .then((answers) => {
      let sql = `
          INSERT INTO employees (first_name, last_name, role_id, manager_id)
          VALUES("${answers.fName}", "${answers.lName}", ${answers.role_title}, ${answers.manager})`;
      db.query(sql, (err, results) => {
        if (err) {
          console.log(err);
          return;
        }
        init();
        return;
      });
    });
    })
  })
}  ;
function updateEmployee() {
  let roles = [];
  let employeeData = [];
  let sql = `SELECT id, title from roles`;
  db.query(sql, (err, results) => {
    if (err) {
      console.log(err);
      return;
    }
    for (let i = 0; i < results.length; i++) {
      roles.push({
        name: results[i].title,
        value: results[i].id,
      });
    }
    let sql = `SELECT id, first_name, last_name from employees`;
    db.query(sql, (err, results) => {
      if (err) {
        console.log(err);
        return;
      }
      for (let i = 0; i < results.length; i++) {
        employeeData.push({
          name: results[i].first_name + " " + results[i].last_name,
          value: results[i].id,
        });
      }
      inquirer
        .prompt([
          {
            type: "list",
            message: "Which employee's role would you like to update?",
            name: "original_role",
            choices: employeeData,
          },
          {
            type: "list",
            message: "What would you like to change their role too?",
            name: "updated_role",
            choices: roles,
          },
        ])
        .then((answers) => {
          let sql = `UPDATE employee SET role_id=? WHERE id)?`;
          db.query(sql, (answers.updated_role, answers.original_role), (err, results) => {
            if (err) {
              console.log(err);
            }
            init();
            return;
          });
        });
    });
  });
};

const titlePage = () => {
  console.log(`

  /$$$$$$$$                         /$$                                               /$$      /$$                                                                  
 | $$_____/                        | $$                                              | $$$    /$$$                                                                  
 | $$       /$$$$$$/$$$$   /$$$$$$ | $$  /$$$$$$  /$$   /$$  /$$$$$$   /$$$$$$       | $$$$  /$$$$  /$$$$$$  /$$$$$$$   /$$$$$$   /$$$$$$   /$$$$$$   /$$$$$$       
 | $$$$$   | $$_  $$_  $$ /$$__  $$| $$ /$$__  $$| $$  | $$ /$$__  $$ /$$__  $$      | $$ $$/$$ $$ |____  $$| $$__  $$ |____  $$ /$$__  $$ /$$__  $$ /$$__  $$      
 | $$__/   | $$ \ $$ \ $$| $$  \ $$| $$| $$  \ $$| $$  | $$| $$$$$$$$| $$$$$$$$      | $$  $$$| $$  /$$$$$$$| $$  \ $$  /$$$$$$$| $$  \ $$| $$$$$$$$| $$  \__/      
 | $$      | $$ | $$ | $$| $$  | $$| $$| $$  | $$| $$  | $$| $$_____/| $$_____/      | $$\  $ | $$ /$$__  $$| $$  | $$ /$$__  $$| $$  | $$| $$_____/| $$            
 | $$$$$$$$| $$ | $$ | $$| $$$$$$$/| $$|  $$$$$$/|  $$$$$$$|  $$$$$$$|  $$$$$$$      | $$ \/  | $$|  $$$$$$$| $$  | $$|  $$$$$$$|  $$$$$$$|  $$$$$$$| $$            
 |________/|__/ |__/ |__/| $$____/ |__/ \______/  \____  $$ \_______/ \_______/      |__/     |__/ \_______/|__/  |__/ \_______/ \____  $$ \_______/|__/            
                         | $$                     /$$  | $$                                                                      /$$  \ $$                          
                         | $$                    |  $$$$$$/                                                                     |  $$$$$$/                          
                         |__/                     \______/                                                                       \______/                           
 
 `)
}

const init = () => {

  inquirer
    .prompt([
      {
        type: "list",
        name: "begin",
        message: "Choose an option...",
        choices: [
          "View all departments",
          "View all roles",
          "View all employees",
          "Add a department",
          "Add a role",
          "Add an employee",
          "Update an employee role",
          "Exit",
        ],
      },
    ])
    .then((answers) => {
      if (answers.begin === "View all departments") {
        departmentTable();
      } else if (answers.begin === "View all roles") {
        rolesTable();
      } else if (answers.begin === "View all employees") {
        employeeAllTable();
      } else if (answers.begin === "Add a department") {
        addDepartment();
      } else if (answers.begin === "Add a role") {
        addRole();
      } else if (answers.begin === "Add an employee") {
        addEmployee();
      } else if (answers.begin === "Update an employee role") {
        updateEmployee();
      } else {
        console.log("Have a great day!");
      }
      return;
    });
};

titlePage();
init();


app.listen(PORT, () => console.log("Now listening"));
