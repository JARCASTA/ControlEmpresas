'use strict'

var express = require('express');
var branchController = require('../controllers/branch.controller');
var api = express.Router();
var authentication = require('../middlewares/authenticade');

api.post('/saveBranch/:idC', authentication.ensureCompany, branchController.saveBranch);
api.get('/listBranches/:id', authentication.ensureCompany, branchController.listBranches);
api.put('/editBranches/:idB/:idC', authentication.ensureCompany, branchController.editBranch);
api.delete('/deleteBranch/:idB/:idC'    , authentication.ensureCompany, branchController.deleteBranch);

api.put('/addProductToBranch/:idC/:idB', authentication.ensureCompany, branchController.addProduct);

module.exports = api;