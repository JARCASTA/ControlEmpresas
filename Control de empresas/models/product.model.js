 'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var productSchema = Schema({
    name: String,
    stock: Number,
    price: Number,
    branch:[{type: Schema.Types.ObjectId, ref: 'branch'}]
})

module.exports = mongoose.model('product', productSchema);