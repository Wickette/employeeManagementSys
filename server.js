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
      database: process.env.DB_NAME
    },
    console.log(`Connected to the employee_db database.`)
  );

  function departmentTable() {
    db.query("SELECT * FROM departments", function (err, results) {
      if (err) {
        console.log(err);
      }
      console.table(results);
      init();
    });
  };
  function rolesTable() {
    const sql =
      "SELECT roles.id, title, salary, departments.name FROM departments INNER JOIN roles ON roles.department_id = departments.id";
    db.query(sql, (err, results) => {
      if (err) {
        console.log(err);
      } else {
        console.table(results);
        init();
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
            ORDER BY employees.id`
  db.query(sql, (err, results) => {
      if (err) {
          console.log(err);
      } else {
          console.table(results)
          init();
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
          departmentTable();
          console.log(`Added ${answers.department_name} to the departments table!`);
          init();
        })
      });
  };
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
              VALUES ("${answers.role_title}", ${answers.role_salary}, ${answers.role_id})
      `
      db.query(sql, (err, results) => {
        if (err) {
          console.log(err);
          return
        }
        rolesTable();
        console.log(`Added ${answers.role_title} to the database!`);
        init();
      });
    });
  };
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
        name: "manager",
      },    
    ])
    .then((answers) => {
      let sql = `
          INSERT INTO employees (first_name, last_name, role_id, manager_id)
          VALUES("${answers.fName}", "${answers.lName}", ${answers.role_id}, ${answers.manager})
      `
      db.query(sql, (err, results) => {
        if (err) {
          console.log(err);
          return;
        }
        employeeAllTable();
        console.log(`Added ${answers.fName} ${answers.lName} to the database!`);
        init();
      });
    });
  };
  function updateEmployee() {
    const sql = `UPDATE employee SET roles WHERE title ?`
    db.query(sql, (err, results) => {
      const employees = [...results].map((object) => {
        const obj = {
          name: object.title,
          value: object.id
        }
        return obj;
      })
      inquirer.prompt([
        {
          type: "list",
          message: "Which employee's role would you like to update?",
          name: "employees",
          choices: employees,
        },
        {
          type: "input",
          message: "What is the salary of the role?",
          name: "salary",
        },
        {
          type: "list",
          message: "Which department does the role belog too?",
          name: "department",
          choices: ["Sales", "Finance", "Engineering", "Legal"],
        },
      ])
      .then((answers) => {
        const sql = `UPDATE employee SET roles_id=? WHERE employee(id)=?`
        db.query(sql, {
          title: results.title,
          role: results.roles_id,
          salary: results.salary
        });
        employeeAllTable();
        init();
      });
    });
  };
  
const init = () => {
  inquirer
    .prompt([
      {
        type: "list",
        name: "begin",
        message: "What would you like to do?",
        choices: ["View all departments", "View all roles", "View all employees", "Add a department", "Add a role", "Add an employee", "Update an employee role", "Exit"]
      }
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
        console.log("Have a great day!")
      }
    });
};

init()

app.listen(PORT, () => console.log('Now listening'));

