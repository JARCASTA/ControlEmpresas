'use strict'

var Employee = require('../models/employee.model');
var ObjectId = require('mongoose').Types.ObjectId;
var xlsx = require('mongo-xlsx');

function saveEmployee(req,res){
    var employee = new Employee();
    var params = req.body;

    if(params.name && params.phone && params.role && params.department && params.email && params.company){
        Employee.findOne({$or:[{phone:params.phone},{email:params.email}]}, (err, employeeFind)=>{
            if(err){
                res.status(500).send({message:'Error general', err});
            }else if(employeeFind){
                res.send({message:'Telefono o correo ya utilizados'});
            }else{
                employee.name = params.name;
                employee.lastName = params.lastName;
                employee.phone = params.phone;
                employee.role = params.role;
                employee.department = params.department;
                employee.email = params.email;
                employee.company = params.company;

                employee.save(employee, (err, employeeSave) =>{
                    if(err){
                        res.status(500).send({message:'Error general', err});
                    }else if(employeeSave){
                        res.send({employee: employeeSave});
                    }else{
                        res.send({message:'Error al guardar al empleado'});
                    }
                })  
            }
        })
    }else{
        res.send({message:'Ingrese todos los parametros solicitados'});
    }
}

function editEmployee(req, res){
    var employeeId = req.params.id;
    var update = req.body

    Employee.findOne({$or:[{phone: update.phone}, {email: update.email}]}, (err, employeeFind) =>{
        if(err){
            res.status(500).send({message:'Error general'});
        }else if(employeeFind){
            res.send({message:'Telefono o correo ya utilizados'})
        }else{
            Employee.findByIdAndUpdate(employeeId, update, {new:true}, (err, employeeUpdated)=>{
                if(err){
                    res.status(500).send({message:'Error general'});
                }else if(employeeUpdated){
                    res.send({employee: employeeUpdated});
                }else{
                    res.status(404).send({message:'No se pudo actualizar'})
                }
            })
        }
    })
}

function deleteEmployee(req, res){
    var employeeId = req.params.id;
    Employee.findByIdAndRemove(employeeId, (err, employeeRemoved)=>{
        if(err){
            res.status(500).send({message:'Error general'});
        }else if(employeeRemoved){
            res.send({message:'Se a eliminado al siguiente empleado: ', employeeRemoved});
        }else{
            res.status(404).send({message:'No se pudo eliminar al empleado'});
        }
    })
}

function searchEmployees(req, res){
    var params = req.body;

    if(params.search != 'Todos'){
        Employee.find({$or:[/*{_id: {$regex:params.search, $options: 'i'}},*/ {'name': {$regex:params.search, $options: 'i'}}, {'role':{$regex:params.search, $options: 'i'}} , {'department': {$regex:params.search, $options: 'i'}}]}, (err, employeesFind)=>{
            if(err){
                res.status(500).send({message: 'Error general', err});
            }else if(employeesFind){
                res.send({employees: employeesFind});
            }else{
                res.send({message: 'Sin registros'});
            }
        }).populate('company');
    }else if(params.search == 'Todos'){
        Employee.find((err, finded)=>{
            if(err){
                res.status(500).send({message:'Error general'});
            }else if(finded){
                res.send({employees: finded});
            }else{
                res.status(404).send({message:'No se encontraron registros'});
            }
        })
    }else{
        res.send({message: 'Ingrese el dato a buscar'});
    }
}


function countEmployees(req, res){
    var companyId = req.params.id;

    Employee.find({company: companyId}).countDocuments((err, counted)=>{
        if(err){
            res.status(500).send({message:'Error general', err});
        }else if(counted){
            res.send({message:'Empleados en total: ' , counted});
        }else{
            res.status(404).send({message:'Sin empleados', counted});
        }
    })
}    
    
function xlsxSave(req, res){

    var options =  {
        save: true,
        sheetName: [],
        fileName: "Empleados " + new Date().getTime() + ".xlsx",
        path: "./excel/empleados",
        defaultSheetName: "worksheet"
      }

    Employee.find({}, (err, find)=>{
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
            })
        }else{
            res.send({message:'Error'});
        }
    })

}

module.exports = {
    saveEmployee,
    editEmployee,
    deleteEmployee,
    searchEmployees,
    countEmployees,
    xlsxSave
}