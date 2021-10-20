const mysql = require("mysql2");
const inquirer = require("inquirer");
const express = require("express");
require("dotenv").config();
const cTable = require("console.table");

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

db.query('SELECT * FROM employee', function (err, results) {
  console.table(results);
});
  

app.listen(PORT, () => console.log('Now listening'));
