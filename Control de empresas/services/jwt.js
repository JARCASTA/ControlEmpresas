'use strict'

var jwt = require('jwt-simple');
var moment = require('moment');
var key = 'Clave_que_nadie_debe_saber';

exports.createToken = (company) =>{
    var payload = {
        sub: company._id,
        name: company.name,
        phone: company.phone,
        email: company.email,
        address: company.address,
        iat: moment().unix(),
        exp: moment().add(4, 'hours').unix()
    }
    return jwt.encode(payload, key)
}