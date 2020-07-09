'use strict'

var Branch = require('../models/branch.model');
var Product = require('../models/product.model');
var Company = require('../models/company.model');

function saveBranch(req, res){
    var branch = new Branch();
    var params = req.body;
    var CompanyId = req.params.idC;

    if(CompanyId != req.user.sub){
        res.status(403).send({message:'Sin permisos de ruta'});
    }else{
        if(params.name && params.phone && params.address){
            Branch.findOne({$or:[{name: params.name}, {phone: params.phone}]} , (err, finded)=>{
                if(err){
                    res.status(500).send({message:'Error general'});
                }else if(finded){ 
                    res.send({message:'Nombre o telefono ya usados por otra sucursal'});
                }else{

                    branch.name = params.name;
                    branch.phone = params.phone;
                    branch.address = params.address;
                    branch.company = CompanyId;

                    branch.save(branch,  (err, saved)=>{
                        if(err){
                            res.status(500).send({message:'Error general'});
                        }else if(saved){
                            Company.findByIdAndUpdate(CompanyId, {$push:{branch: saved.id}}, {new:true},(err, updated)=>{
                                if(err){
                                    res.status(500).send({message:'Error general'});
                                }else if(updated){
                                    res.send({Branch: saved});
                                }else{
                                    res.status(404).send({message:'Error no esperado'});
                                }
                            })
                        }else{
                            res.send({message:'Error al guardar'});
                        }
                    })
                }
            })
        }else{
            res.send({message:'Ingrese los parametros necesarios'});
        }
    }
}

function listBranches(req, res){
    var CompanyId = req.params.id;
    
    if(CompanyId != req.user.sub){
            res.status(403).send({message:'Sin permisos de ruta'});
    }else{
        Branch.find({}, (err, finded)=>{
            if(err){
                res.status(500).send({message:'Error general'});
            }else if(finded){
                res.send({Branch: finded});
            }else{
                res.status(404).send({message:'No se encontraron sucursales'});
            }
        })
    }
}

function editBranch(req, res){
    var BranchId = req.params.idB;
    var params = req.body;
    var CompanyId = req.params.idC

    if(CompanyId != req.user.sub){
        res.status(403).send({message:'Sin permisos de ruta'});
    }else{
        Branch.findByIdAndUpdate(BranchId, params, {new:true}, (err, updated)=>{
            if(err){
                res.status(500).send({message:'Error general'});
            }else if(updated){
                res.send({branch: updated});
            }else{
                res.status(404).send({message:'No se pudo actualizar'});
            }
        })
    }
}

function deleteBranch(req, res){
    var BranchId = req.params.idB;
    var CompanyId = req.params.idC;

    if(CompanyId != req.user.sub){
        res.status(418).send({message:'Sin permisos de ruta'})
    }else{
        Branch.findByIdAndRemove(BranchId, (err, deleted)=>{
            if(err){
                res.status(500).send({message:'Error general'});
            }else if(deleted){
                res.send({message:'Se a eliminado al siguiente usuario', deleted});
            }else{
                res.status(404).send({message:'Error al eliminar'});
            }
        })
    }
}

function addProduct(req, res){
    var companyId = req.params.idC;
    var branchId = req.params.idB;
    var params = req.body;

    if(params.product && params.stock){
        Company.findById(companyId, (err, finded)=>{
            if(err){
                res.status(500).send({message:'Error general 1',err});
            }else if(finded){
                Branch.findOne({_id:branchId,products:{$elemMatch:{productId:params.product}}},(err, branchFinded)=>{
                    if(err){
                        res.status(500).send({message:'Error general 2', err});
                    }else if(branchFinded){
                        res.send({message:'El producto ya esta registrado'});
                    }else{
                        Product.findById(params.product, (err, productFinded)=>{
                            if(err){
                                res.status(500).send({message:'Error general 3',err});
                            }else if(productFinded && (productFinded.stock - params.stock >= 0)){
                                var newStock = productFinded.stock - params.stock;
                                Product.findByIdAndUpdate(params.product,{stock:newStock, $push:{branch: branchId}}, {new:true}, (err, updated)=>{
                                    if(err){
                                        res.status(500).send({message:'Error general 4', err});
                                    }else if(updated){
                                        Branch.findByIdAndUpdate(branchId,{$push:{products: {productId: params.product, stock:params.stock}}},{new:true}, (err, branchUpdated)=>{
                                            if(err){
                                                res.status(500).send({message:'Error general 5', err});
                                            }else if(branchUpdated){
                                                res.send({message:'Exitoso', branchUpdated});
                                            }else{
                                                res.send({message:'Error no esperado', branchUpdated, updated});
                                            }
                                        })
                                    }
                                })
                            }else{
                                res.status(404).send({message:'No se pudo asignar el producto'});
                            }
                        })
                    }
                })
            }else{
                res.status(404).send({message:'Compania no existente'});
            }
        })
    }else{
        res.send(400).send({message:'Ingrese los parametros solicitados'});
    }
    
}

module.exports = {
    saveBranch,
    listBranches,
    editBranch,
    deleteBranch,
    addProduct
}