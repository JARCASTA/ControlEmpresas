'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var companySchema = Schema({
    name:String,
    phone:String,
    email:String,
    address:String,
    password:String,
    branch:[{type: Schema.Types.ObjectId, ref:'branch'}],
    product:[{type:Schema.Types.ObjectId, ref:'product'}]
})

module.exports = mongoose.model('company', companySchema);