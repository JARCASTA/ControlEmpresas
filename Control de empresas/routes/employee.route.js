'use strict'

var express = require('express');
var employeeController = require('../controllers/employee.controller');
var api = express.Router();

api.post('/saveEmployee', employeeController.saveEmployee);
api.put('/editEmployee/:id', employeeController.editEmployee);
api.delete('/deleteEmployee/:id', employeeController.deleteEmployee);
api.post('/searchEmployee', employeeController.searchEmployees);

api.get('/countEmployees/:id', employeeController.countEmployees);

api.get('/employeesExcel', employeeController.xlsxSave);

module.exports = api;