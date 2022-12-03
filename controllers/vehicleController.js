const {Vehicle} = require('../models/Vehicle');
const {isValidObjectId} = require('mongoose');
const {validationResult} = require('express-validator');
const asyncHandler = require('../middlewear/async');
const {sendNotification} = require('../helpers/notifications'); 

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
})


exports.getVehicles = asyncHandler(async (req,res) => {

    const count = res.advancedResults.count;
    const status = count > 0 ? 200 : 404;
    const success = count > 0 ? true : false;

    if(typeof(req.query.pickupLocation) != 'undefined' && req.query.pickupLocation != '' ){
        return res.status(status).json({
            Success      : success,
            Message      : count === 1 ? `only ${count} nearby vehicle found`: count === 0 ? 'no nearby vehicles found' : `Total ${count} nearby vehicles found`  ,
            Payload      : res.advancedResults,
            responseCode : count === 0 ? 404 : 200
        });
    }

    return res.status(status).json({
        Success      : success,
        Message      : count > 0 ? 'Showing results for search' : 'no records found' ,
        Payload      : res.advancedResults,
        responseCode : count === 0 ? 404 : 200
    });
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
        return res.status(400).json({Success:false,Message:'vehicle paper images not provided, atleast 1 vehicle paper image is required', responseCode :400});
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


    const vehicle = new Vehicle( {
        vehicleOwner             : req.body.vehicleOwner,
        vehicleCategory          : req.body.vehicleCategory,
        brand                    : req.body.brand,
        model                    : req.body.model,
        year                     : req.body.year,
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
        selfDriveDailyCharges    : Number(req.body.selfDriveDailyCharges)
        });

        vehicle.save()
        .then((vehicle)=>{
        return  res.status(200).json({Success:true,Message:'Vehile added Successfully',Payload:vehicle, responseCode : 200});
    } );

})

exports.approveOrRejectVehicle = asyncHandler(async (req,res) => {
    
    var role = req.user.role;
    var vehicleID = req.body.vehicleID;
    var reasonForRejection = req.body.reasonForRejection;
    var approve = req.body.approve;

    
    if(vehicleID == '' || vehicleID == null || typeof(vehicleID) == 'undefined' || !isValidObjectId(vehicleID)){
        return res.status(400).json({ Success: false, Message: 'invalid vehicle ID', responseCode :400 });
    }
    
    if(role =='' || role == null || typeof(role) == 'undefined' || role !='admin'){
       // return res.status(400).json({ Success: false, Message: 'you cannot approve or reject this vehicle', responseCode :400 });
    }

   
    if(approve!='true' && approve!=true  && approve!='false' && approve!= false){
        return res.status(400).json({ Success: false, Message: 'approve or reject not provided', responseCode :400 });
    }
     approve = req.body.approve == 'true' || req.body.approve ==  true ? '1' : '2';  
     
     if((reasonForRejection == '' || reasonForRejection == null || typeof(reasonForRejection) == 'undefined') && approve == '2'){
        return res.status(400).json({ Success: false, Message: 'Please provide the reason for rejection', responseCode :400 });
    }

    var vehicle = await Vehicle.findById(vehicleID).populate({ path: 'vehicleOwner', model: 'User', select: '-passwordHash' });  
    
    if(vehicle == null || typeof(vehicle) == 'undefined' ){
        return res.status(400).json({ Success: false, Message: 'vehicle with this id does not exist', responseCode :400 });
    }
    if(vehicle.approvalStatus != '0'){
        return res.status(400).json({ Success: false, Message: 'you cannot approve or reject this vehicle', responseCode :400 });
    }

    Vehicle.findByIdAndUpdate(
        vehicle._id ,
        approve == '2' ? { $set: {approvalStatus: approve, reasonForRejection :  reasonForRejection }} : { $set: {approvalStatus: approve}}
        ,{new : true}
        ).populate('vehicleOwner').then((vehicle)=>{
           approve == '1' ? sendNotification('RentWheels Vehicle Approved',`your vehicle has been approved and is now available for rental, Vehicle Registraton Number = ${vehicle.registrationNumber}`, vehicle.vehicleOwner.firebaseToken ) : sendNotification('RentWheels Booking Rejected',`your vehicle has been rejected you can check the reason for rejection in the vehicle details, Vehicle Registration Number = ${vehicle.registrationNumber}`, vehicle.vehicleOwner.firebaseToken ); 
        })
    
        let  Message  = approve == '1' ? 'Approved' : 'Rejected';
        return res.status(200).json({Success:true,Message:`Vehicle ${Message} Successfully`, responseCode : 200});
});
