'use strict'

var Company = require('../models/company.model');
var Product = require('../models/product.model');
var Branch = require('../models/branch.model');
var xlsx = require('mongo-xlsx');
var bcrypt = require('bcrypt-nodejs');
var jwt = require('../services/jwt');

function saveCompany(req,res){
    var company = new Company();
    var params = req.body;

    if(params.name && params.phone && params.email && params.address && params.password){
        Company.findOne({$or:[{name: params.name},{phone: params.phone}, {email:params.email}]}, (err, companyFind)=>{
            if(err){
                res.status(500).send({message:'Error general'});
            }else if(companyFind){
                res.send({message:'Nombre, telefono o correo ya utilizados por otra empresa'});
            }else{
                company.name = params.name;
                company.phone = params.phone;
                company.email = params.email;
                company.address = params.address;
                company.password = params.password;

                bcrypt.hash(params.password, null, null, (err, passwordHash)=>{
                    if(err){
                        res.status(500).send({message: 'Error al encriptar contraseña'});
                    }else if(passwordHash){
                        company.password = passwordHash;

                        company.save((err, companySaved)=>{
                            if(err){
                                res.status(500).send({message: 'Error general al guardar compania'});
                            }else if(companySaved){
                                res.send({company: companySaved});
                            }else{
                                res.status(404).send({message: 'Compania no guardado'});
                            }
                        });
                    }else{
                        res.status(418).send({message: 'Error inesperado'});
                    }
                });
            }
        })
    }else{
        res.send({message:'Ingrese todos los campos'})
    }
}

function listCompany(req, res){

    Company.find({}, (err, finded)=>{
        if(err){
            res.status(500).send({message:'Error general'});
        }else if(finded){
            res.send({company: finded});
        }else{
            res.status(404).send({message:'Sin registros'});
        }
    })
}

function editCompany(req,res){
    var companyId = req.params.id;
    var update = req.body;

    Company.findOne({$or:[{name: update.name},{phone: update.phone}, {email: update.email}]}, (err, companyFind)=>{
        if(err){
            res.status(500).send({message:'Error general'});
        }else if(companyFind){
            res.send({message:'Nombre, telefono o correo ya utilizados'});
        }else{
            Company.findByIdAndUpdate(companyId, update, {new:true}, (err, companyUpdated)=>{
                if(err){
                    res.status(500).send({message:'Error general'});
                }else if(companyUpdated){
                    res.send({company : companyUpdated});
                }else{
                    res.status(404).send({message:'No se ha podido actualizar'});
                }
            }) 
        }
    })
}

function deleteCompany(req, res){
    var companyId = req.params.id;
    Company.findByIdAndRemove(companyId, (err, companyRemoved)=>{
        if(err){
            res.status(500).send({message: 'Error general'});
        }else if(companyRemoved){
            res.send({message: 'Se a eliminado la siguiente empresa: ', companyRemoved})
        }else{
            res.status(404).send({message: 'No se pudo eliminar la empresa'});
        }
    });

}

function xlsxSave(req, res){

    var options =  {
        save: true,
        sheetName: [],
        fileName: "Companias " + new Date().getTime() + ".xlsx",
        path: "./excel/companias",
        defaultSheetName: "worksheet"
      }

    Company.find({}, (err, find)=>{
        if(err){
            res.status(500).send({message:'Error general'});
        }else if(find){
            var model = xlsx.buildDynamicModel(find);

            xlsx.mongoData2Xlsx(find, model, options, (err, saved)=>{
                if(err){
                    res.status(500).send({message:'Error'});
                }else if(saved){
                    res.send({message: 'Exitoso'});
                }else{
                    res.send({message:'Error'});
                }
            } );
        }else{
            res.send({message:'Error'});
        }
    })

}

function login(req, res){
    var params = req.body;

    if(params.email){
        if(params.password){
            Company.findOne({email:params.email}, (err, finded)=>{
                if(err){
                    res.status(500).send({message:'Error general'});
                }else if(finded){
                    bcrypt.compare(params.password, finded.password, (err, passwordOk)=>{
                        if(err){
                            res.status(500).send({message:'Error al comparar'});
                        }else if(passwordOk){
                            if(params.getToken = true){
                                res.send({token: jwt.createToken(finded)});
                            }else{
                                res.send({message:'Bienvenido', user});
                            }
                        }else{
                            res.send({message:'Contrasenia incorrecta'});
                        }
                    })
                }else{
                    res.send({message:'Datos incorrectos'});
                }
            })
        }else{
            res.send({message:'Ingrese su contrasenia'});   
        }
    }else{
        res.send({message:'Ingrese su correo de empresa'});
    }
}

function saveProduct(req, res){
    var companyId = req.params.idC;
    var product = new Product();
    var params = req.body

    if(params.name && params.stock && params.price && params.company){
        Product.findOne({name:params.name}, (err, finded)=>{
            if(err){
                res.status(500).send({message:'Error general', err});
            }else if(finded){
                res.send({message:'Nombre ya usado'});
            }else{
                
                product.name = params.name;
                product.stock = params.stock;
                product.price = params.price;
                product.company = params.company;

                product.save(product, (err, saved)=>{
                    if(err){
                        res.status(500).send({message:'Error general'});
                    }else if(saved){
                        Company.findByIdAndUpdate(companyId, {$push:{product: saved.id}}, {new:true},(err, updated)=>{
                            if(err){
                                res.status(500).send({message:'Error general'});
                            }else if(updated){
                                res.send({Branch: saved});
                            }else{
                                res.status(404).send({message:'Error no esperado'});
                            }
                        })
                    }else{
                        res.status(404).send({message:'Error no esperado'});
                    }
                })
            }
        })
    }else{
        res.send({message:'Ingrese los parametros solicitados'});
    }
}

function countProduct(req,res){
    var companyId =req.params.idC;
    var productId = req.params.idP;

    Company.findById(companyId,(err,finded)=>{
        if (err) {
            res.status(500).send({message:'Error general 1', err });
        }else if(finded) {
            Product.findById(productId,(err,productFinded)=>{
                if (err) {
                    res.status(500).send({message: 'Error general 2', err });
                } else if (finded) {
                    res.send({ 'Productos sin asignar':productFinded.stock,'Productos en sucursales': productFinded.branch});
                } else {
                    res.status(404).send({message: 'Error no esperado' })
                }
            }).populate('branch','name products.stock');
        } else {
            res.status(404).send({message: 'No se encontro la empresa' })
        }
    });
}

function updateProduct(req, res){
   var companyId = req.params.idC;
   var productId = req.params.idP;
   var params = req.body;
   
   if(companyId != req.user.sub){
       res.status(403).send({message:'Sin permisos de ruta'});
   }else{
       Product.findByIdAndUpdate(productId,params,{new:true}, (err, updated)=>{
           if(err){
               res.status(500).send({message:'Error general'});
           }else if(updated){
               res.send({message:'Exitoso', updated});
           }else{
               res.status(404).send({message:'No se encontro el producto'});
           }
       })
   }
}

function removeProduct(req,res){
    var companyId = req.params.idC;
    var branchId = req.params.idB;
    var productIdP = req.params.idP;

    Company.findOne({_id:companyId,branch:branchId},(err,finded)=>{
        if(err){
            res.status(500).send({message:'Error general 1', err });
        }else if(finded){
            Branch.findByIdAndUpdate(branchId,{$pull:{products:{productId:productIdP}}},{new:true},(err,updated)=>{
                if(err){
                    res.status(500).send({message:'Error general 2', err });
                }else if (updated) {
                    res.send({message:'Exitoso', updated});
                }else{
                    res.status(404).send({ message:'No se encontro la sucursal'})
                }
            });
        }else{
            res.status(404).send({message:'Compania no encontrada.'});
        }
    })
}


module.exports = {
    saveCompany,
    listCompany,
    editCompany,
    deleteCompany,
    xlsxSave,
    login,
    saveProduct,
    countProduct,
    removeProduct,
    updateProduct
}