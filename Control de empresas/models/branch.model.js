'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var branchSchema = Schema({
    name:String,
    phone:String,
    address:String,
    products:[{
        productId: [{type: Schema.Types.ObjectId, ref: 'product'}],
        stock: Number
    }]
})

module.exports = mongoose.model('branch', branchSchema);