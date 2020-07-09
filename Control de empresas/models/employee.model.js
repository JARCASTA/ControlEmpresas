'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var employeesSchema = Schema({
    name:String,
    lastName:String,
    phone:String,
    role:String,
    department:String,
    email:String,
    company:[{type: Schema.Types.ObjectId, ref: 'company'}]
})

module.exports = mongoose.model('employee', employeesSchema);