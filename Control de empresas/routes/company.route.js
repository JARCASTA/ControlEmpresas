'use strict'

var express = require('express');
var companyController = require('../controllers/company.controller');
var api = express.Router();
var authentication = require('../middlewares/authenticade');

api.post('/saveCompany', companyController.saveCompany);
api.get('/listCompany', authentication.ensureCompany ,companyController.listCompany);
api.put('/editCompany/:id', authentication.ensureCompany ,companyController.editCompany);
api.delete('/deleteCompany/:id', authentication.ensureCompany ,companyController.deleteCompany);
api.post('/login', companyController.login);

api.get('/companyExcel', authentication.ensureCompany ,companyController.xlsxSave);

api.put('/addProduct/:idC', authentication.ensureCompany, companyController.saveProduct);
api.get('/countProduct/:idC/:idP', authentication.ensureCompany, companyController.countProduct);
api.put('/removeProduct/:idC/:idB/:idP', authentication.ensureCompany, companyController.removeProduct);
api.put('/updateProduct/:idC/:idP', authentication.ensureCompany, companyController.updateProduct);

module.exports = api;