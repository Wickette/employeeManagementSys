DROP DATABASE IF EXISTS employee_db;
CREATE DATABASE employee_db;

USE employee_db;

-- Create Department Table
CREATE TABLE department (
    id INT AUTO_INCREMENT PRIMARY KEY,
    department_name VARCHAR(30) NOT NULL
);

-- Create Role Table
CREATE TABLE roles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    roles_title VARCHAR(30) NOT NULL,
    roles_salary DECIMAL NOT NULL,
    department_id INT,
        FOREIGN KEY (department_id)
        REFERENCES department(id)
        ON DELETE SET NULL
);

-- Create Employee Table
CREATE TABLE employee (
    id INT AUTO_INCREMENT PRIMARY KEY,
    first_name VARCHAR(30) NOT NULL,
    last_name VARCHAR(30) NOT NULL,
    role_id INT,
    manager_id INT,
        FOREIGN KEY (role_id)
        REFERENCES roles(id)
        ON DELETE SET NULL,
        FOREIGN KEY (manager_id)
        REFERENCES employee(id)
        ON DELETE SET NULL    
);