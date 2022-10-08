const {Booking} = require('../models/Booking');
const {Vehicle} = require('../models/Vehicle');
const {isValidObjectId} = require('mongoose');
const {validationResult} = require('express-validator');
const asyncHandler = require('../middlewear/async');


//booking confirm ki API banani hai 
//rantal status ki API banani hai 
exports.addBooking = asyncHandler(async (req,res) => {

    
    let selfDrive = req.body.selfDrive;
    let startDatetime = new Date(req.body.startTime);
    let enddDatetime = new Date(req.body.endTime);
    let totalAmount = 0;

    let noOfDays = this.days(startDatetime,enddDatetime);
    const vehicle = await Vehicle.findById(req.body.vehicle);
    if(selfDrive == 'true' || selfDrive == true){
        totalAmount = vehicle.selfDriveCharges.selfDriveDailyCharges * noOfDays;
    }else{
        totalAmount = vehicle.withDriverCharges.withDriverDailyCharges * noOfDays;
    }

    let booking = new Booking({
       renter:req.body.renter,
       rentee:req.body.rentee,
       vehicle:req.body.vehicle,
       startTime:req.body.startTime,
       endTime:req.body.endTime,
       startCode: Math.round(Math.random() * 1E9).toString().substring(0,5),
       endCode: Math.round(Math.random()+ 1 * 1E8).toString().substring(0,5),
       totalAmount:totalAmount,
       selfDrive: selfDrive=='true' || selfDrive== true ? true : false,
       renteeLocation:req.body.renteeLocation ? req.body.renteeLocation : null
    })

    booking = await booking.save();
    if(!booking){
        return  res.status(500).json({Success:true,Message:'something went wrong cant add booking', responseCode : 500}); 
    }
    return res.status(200).json({Success:true,Message:'Booking added Successfully',Payload:booking , responseCode : 200});
    
    
});



const days = (date_1, date_2) => {
    let difference = date_1.getTime() - date_2.getTime();
    let TotalDays = Math.ceil(difference / (1000 * 3600 * 24));
    return TotalDays;
}
