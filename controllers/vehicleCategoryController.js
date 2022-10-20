const asyncHandler = require('../middlewear/async');
const {VehicleCategory} = require('../models/VehicleCategory');
const {isValidObjectId} = require('mongoose');
const {validationResult} = require('express-validator');
// include node fs module
var fs = require('fs');
 


exports.getVehicleCategories = asyncHandler(async (req, res, next) => {

    const query = VehicleCategory;

   //for finding single vehicle category by its id
    if(req.params.id){
        if(!isValidObjectId(req.params.id)){
           return res.status(400).json({Success:false,Message:'invalid vehicle category id', responseCode :400});
        }
        const vehicle = await query.findById(req.params.id);
        if(!vehicle){
           return res.status(404).json({Success:false,Message:'Vehicle Category not found', responseCode :404});
        }
        return res.status(200).json({Success:true,Payload:vehicle , responseCode :200});
    }

    //for getting  all vehicle categories
    const vehicleCategory = await VehicleCategory.find();
    if(!vehicleCategory){
        return  res.status(404).json({Success:false,Message:'No Category found', responseCode :404});
    }
    return res.status(200).json({Success:true,Payload:vehicleCategory , responseCode : 200});
     
});


exports.addVehicleCategories = asyncHandler(async (req, res, next) =>{
     
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({Success:false,Message: errors.array()[0].msg , responseCode :400});
    }
    if(!req.file){
        return res.status(400).json({Success:false,Message: 'category image not provided' , responseCode :400});
        
    }
    const fileName = req.file.filename;
    const basePath = `${req.protocol}://${req.get('host')}/public/images/vehicle-category/`;
   
    //for updating vehicle categories
    if(req.params.id){
        
        const vehicleCategory = await VehicleCategory.findByIdAndUpdate(
            req.params.id,
            {   
                brand        : req.body.brand,
                model        : req.body.model,
                year         : req.body.year,
                vehicleType  : req.body.vehicleType,
                image        : basePath+fileName
            } 
        );

        if(!vehicleCategory) return res.status(404).json({Success:false,Message:'Vehicle Category could not be updated', responseCode :404});

       
        // delete file directory
        let delDir = vehicleCategory.image.replace(`${req.protocol}://${req.get('host')}/`,"");

        fs.unlink(delDir, function (err) {
            if (err) throw err;
            // if no error, file has been deleted successfully
            console.log(vehicleCategory.image+' deleted succesfully');
        });

        return res.status(200).json({Success:true,Message:'Vehicle Category updated successFully' , responseCode :200});
    }

    //for adding vehicle category
    let vehicleCategory = new VehicleCategory({
        brand       : req.body.brand,
        model       : req.body.model,
        year        : req.body.year,
        vehicleType : req.body.vehicleType,
        image       : basePath+fileName
    });

    vehicleCategory = await vehicleCategory.save();

    if(!vehicleCategory){
        return  res.status(500).json({Success:false,Message:'Something went wrong, can not add Category', responseCode :500});
    }
    
    return  res.status(200).json({Success:true,Message:'Vehile Category Added',Payload:vehicleCategory, responseCode :200});
     
});



exports.deleteVehicleCategories = asyncHandler(async (req, res, next) => {
    if(!isValidObjectId(req.params.id)){
        return res.status(400).json({Success : false, Message:'Invalid Vehicle Category Id', responseCode :400});
    }
    const vehicleCategory = await VehicleCategory.findByIdAndDelete(req.params.id);
    if(!vehicleCategory) return res.status(404).json({Success : false, Message:'Vehicle Category not found', responseCode :404});
     // delete file directory
     let delDir = await vehicleCategory.image.replace(`${req.protocol}://${req.get('host')}/`,"");

     await fs.unlink(delDir, function (err) {
         if (err) throw err;
         // if no error, file has been deleted successfully
         console.log(delDir+' deleted succesfully');
     });
    return res.status(200).json({Success:true ,Message : 'Vehicle Category deleted successfully', vehicle : vehicleCategory , responseCode :200});
});