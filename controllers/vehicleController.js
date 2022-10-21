const {Vehicle} = require('../models/Vehicle');
const {isValidObjectId} = require('mongoose');
const {validationResult} = require('express-validator');
const asyncHandler = require('../middlewear/async');

var fs = require('fs');

var deleteImages = (images,papers,insurance) => {
    images?.map((path)=>{
        var directory = __dirname.replace("controllers", "");
        path=path.replace("http://localhost:8000",directory);
        fs.unlinkSync(path);
    });
    papers?.map((path)=>{
        var directory = __dirname.replace("controllers", "");
        path=path.replace("http://localhost:8000",directory);
        fs.unlinkSync(path);
    });
    insurance?.map((path)=>{
        var directory = __dirname.replace("controllers", "");
        path=path.replace("http://localhost:8000",directory);
        fs.unlinkSync(path);
    });
}


exports.getNearByVehicles = asyncHandler(async (req,res)=>{

    if(!req.query.filter){
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
        return res.status(400).json({ Error: errors.array()[0].msg , responseCode :400});
        }
    }
    
        
    var query;
    // filter Fields
    if (req.query.filter) {
         // query = query.find({ $and: [ { registrationNumber : ["BVAS-007","CVAS-007","NILE-007"]}, { noOfDoors : ["0","2"] } ] });
        if (req.query.filter.includes('||')) {
        const fieldsWithValues = req.query.filter.split('||');
        var obj = [];
        fieldsWithValues.map(field => {
            item = {};
            var index = field.split("=");
            var fieldName = index[0];
            var fieldValue = index[1].split(',');
            item[fieldName] = fieldValue;
            obj.push(item);

        });
        query = await Vehicle.find({ $and: obj });
    }

    else if (req.query.filter.includes('|')) {
        const fieldsWithValues = req.query.filter.split('|');
        var obj = [];
        fieldsWithValues.map(field => {
            item = {};
            var index = field.split("=");
            var fieldName = index[0];
            var fieldValue = index[1].split(',');
            item[fieldName] = fieldValue;
            obj.push(item);

      });

        query = await Vehicle.find({ $or: obj });
    }
    else{
 
        var index = req.query.filter.split("=");
        var fieldName = index[0];
        var fieldValue = index[1].split(',');
    
        query = await Vehicle.find({[fieldName]:fieldValue});
    }
  }else{
    let coordinates = req.query.pickupLocation.split(',');
    const latitude = Number(coordinates[0].trim());
    const longitude = Number(coordinates[1].trim());
    const distanceInkm = 5;
    const earthsRadiusInKilometer = 6378.1;
        query = await Vehicle.find({ pickupLocation:
        { 
            $geoWithin:
        { 
            $centerSphere: [ [longitude,latitude], distanceInkm / earthsRadiusInKilometer ] 
            }
        }
    }).populate('vehicleCategory');
}
 
    let nearByVehiclesCoordinates  = [];
    query.forEach((vehicle) => {
        nearByVehiclesCoordinates.push(vehicle.pickupLocation.coordinates);
    });
    
    const count = query.length;
    return res.status(200).json({
        Success      : true,
        Message      : req.query.filter ? 'Showing results for search' : count === 1 ? `only ${count} nearby vehicle found`: count === 0 ? 'no nearby vehicles found' : `Total ${count} nearby vehicles found`  ,
        Payload      : {vehicles : query, coordinatesArray : nearByVehiclesCoordinates},
        responseCode : count === 0 ? 404 : 200
    }
    );

    //return res.status(404).json({Success:false,Message:'No nearby vehicles found', responseCode :404});
})


exports.getVehicles = asyncHandler(async (req,res) => {
    res.status(200).json({Payload : res.advancedResults, responseCode :200});
});

exports.getVehicleById = asyncHandler(async (req,res)=>{
    if(!isValidObjectId(req.params.id)){
        res.status(400).json({Success:false, Message:'Invalid Vehicle Id', responseCode :400});
    }
    const vehicle = await Vehicle.findOne({_id : req.params.id}).populate('vehicleCategory');
    if(vehicle){
       return res.status(200).json({Success:true,Payload:vehicle , responseCode :200});
    }
    return res.status(404).json({Success:false,Message:'no vehicle found', responseCode :404});
});

exports.addVehicle = asyncHandler(async (req,res) => {  

    //handling vehicle images
    const files = req.files; 
    let imagePaths = [];
    let vehiclePapersImagePaths = [];
    let vehicleInsuranceImagesPaths = [];
    const basePath = `${req.protocol}://${req.get('host')}/public/images/`;
    if(files){
        let  filePath  = "";
        files.images?.map((file) => {
            filePath = `${basePath+'vehicles/'}${file.filename}`;
            imagePaths.push(filePath);
        } );
        files.vehiclePapers?.map((file) => {
            filePath = `${basePath+'vehicle-papers/'}${file.filename}`;
            vehiclePapersImagePaths.push(filePath);
        } );
        files.vehicleInsurance?.map((file) => {
            filePath = `${basePath+'vehicle-insurance/'}${file.filename}`;
            vehicleInsuranceImagesPaths.push(filePath);
        } );
    }
    else
    {
        deleteImages(imagePaths,vehiclePapersImagePaths,vehicleInsuranceImagesPaths);
        return res.status(400).json({Success:false,Message:'vehicle images not provided, atleast 1 image is required', responseCode :400});
    }
    
    if(imagePaths.length<1){
        deleteImages(imagePaths,vehiclePapersImagePaths,vehicleInsuranceImagesPaths);
        return res.status(400).json({Success:false,Message:'vehicle images not provided, atleast 1 image is required', responseCode :400});
    }
    if(vehiclePapersImagePaths.length<1){
        deleteImages(imagePaths,vehiclePapersImagePaths,vehicleInsuranceImagesPaths);
        return res.status(400).json({Success:false,Message:'vehicle paper images not provided, atleast 1 vhicle paper image is required', responseCode :400});
    }
    if(vehicleInsuranceImagesPaths.length<1){
        deleteImages(imagePaths,vehiclePapersImagePaths,vehicleInsuranceImagesPaths);
        return res.status(400).json({Success:false,Message:'vehicle insurance paper images not provided, atleast 1 vehicle insurance paper image is required', responseCode :400});
    }
    






     //handling validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        deleteImages(imagePaths,vehiclePapersImagePaths,vehicleInsuranceImagesPaths);
        return res.status(400).json({Success:false,Message: errors.array()[0].msg , responseCode :400});
    }
    var coordinatesArray = req.body.pickupLocation.map((item) => {
        return Number(item);
    });
    const pickupLocationGeoJson = {type:"Point",coordinates:coordinatesArray};








    
    //inserting vehicle in database
    if(req.body.isAvailableForSelfDrive == 'true' || req.body.isAvailableForSelfDrive == 'false')
    {
        if(req.body.isAvailableForSelfDrive == 'true'){
            const selfDriveCharges  = { 
                    selfDriveHourlyCharges   : Number(req.body.selfDriveHourlyCharges),
                    selfDriveDailyCharges    : Number(req.body.selfDriveDailyCharges),
                    selfDriveWeeklyCharges   : Number(req.body.selfDriveWeeklyCharges),
                    selfDriveMonthlyCharges  : Number(req.body.selfDriveMonthlyCharges)
                }
                const withDriverCharges = {
                    withDriverDailyCharges   : Number(req.body.withDriverDailyCharges),
                    withDriverWeeklyCharges  : Number(req.body.withDriverWeeklyCharges),
                    withDriverMonthlyCharges : Number(req.body.withDriverMonthlyCharges)
                }
                const vehicle = new Vehicle( {
                    vehicleOwner             : req.body.vehicleOwner,
                    vehicleCategory          : req.body.vehicleCategory,
                    registrationNumber       : req.body.registrationNumber,
                    vehicleType              : req.body.vehicleType,
                    pickupLocation           : pickupLocationGeoJson,
                    description              : req.body.description,
                    noOfSeats                : req.body.noOfSeats,
                    fuelType                 : req.body.fuelType,
                    noOfAirbags              : req.body.noOfAirbags,
                    isAutomatic              : req.body.isAutomatic,
                    noOfDoors                : req.body.noOfDoors,
                    isAircondition           : req.body.isAircondition,
                    images                   : imagePaths,
                    vehiclePapers            : vehiclePapersImagePaths,
                    vehicleInsurance         : vehicleInsuranceImagesPaths,
                    isAvailableForSelfDrive  : req.body.isAvailableForSelfDrive,
                    selfDriveCharges         : selfDriveCharges,
                    withDriverCharges        : withDriverCharges
                    } )

                    vehicle.save()
                    .then((vehicle)=>{
                    return  res.status(200).json({Success:true,Message:'Vehile added Successfully',Payload:vehicle, responseCode : 200});
                } )
            }
            
            if(!(req.body.isAvailableForSelfDrive == "true")){
            const withDriverCharges = {
                withDriverDailyCharges       : Number(req.body.withDriverDailyCharges),
                withDriverWeeklyCharges      : Number(req.body.withDriverWeeklyCharges),
                withDriverMonthlyCharges     : Number(req.body.withDriverMonthlyCharges)
            }
            
            const vehicle = new Vehicle({
                vehicleOwner                 : req.body.vehicleOwner,
                vehicleCategory              : req.body.vehicleCategory,
                registrationNumber           : req.body.registrationNumber,
                vehicleType                  : req.body.vehicleType,
                pickupLocation               : pickupLocationGeoJson,
                description                  : req.body.description,
                noOfSeats                    : req.body.noOfSeats,
                fuelType                     : req.body.fuelType,
                noOfAirbags                  : req.body.noOfAirbags,
                isAutomatic                  : req.body.isAutomatic,
                noOfDoors                    : req.body.noOfDoors,
                isAircondition               : req.body.isAircondition,
                images                       : imagePaths,
                vehiclePapers                : vehiclePapersImagePaths,
                vehicleInsurance             : vehicleInsuranceImagesPaths,
                isAvailableForSelfDrive      : req.body.isAvailableForSelfDrive,
                selfDriveCharges             : null,
                withDriverCharges            : withDriverCharges
                })

                vehicle.save()
                .then((vehicle) => {
                return  res.status(200).json({Success:true,Message:'Vehicle added Successfully',Payload:vehicle , responseCode : 200});
                })
            }

        }
        else
        {
            deleteImages(imagePaths,vehiclePapersImagePaths,vehicleInsuranceImagesPaths);
            return res.status(400).json({Success:false,Message:'is Available for self drive info not provided', responseCode : 400});
        }
})


