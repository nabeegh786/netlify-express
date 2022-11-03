const {Booking} = require('../models/Booking');
const {Vehicle} = require('../models/Vehicle');
const {isValidObjectId} = require('mongoose');
const {validationResult} = require('express-validator');
const asyncHandler = require('../middlewear/async');
const schedule = require('node-schedule');
const Moment = require('moment');
const MomentRange = require('moment-range');


//booking confirm ki API banani hai 
//rental status ki API banani hai 
exports.addBooking = asyncHandler(async (req,res) => {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({Success:false,Message: errors.array()[0].msg , responseCode :400});
    }

    //let selfDrive = req.body.selfDrive;
    let startDatetime = new Date(req.body.startTime);
    let enddDatetime = new Date(req.body.endTime);
    let totalAmount = 0;
    let noOfDays = await days(startDatetime,enddDatetime);
    const vehicle = await Vehicle.findById(req.body.vehicle);
    totalAmount = vehicle.selfDriveCharges.selfDriveDailyCharges * noOfDays;
    // if(selfDrive == 'true' || selfDrive == true)
    // {
    //     totalAmount = vehicle.selfDriveCharges.selfDriveDailyCharges * noOfDays;
    // }
    // else
    // {
    //     totalAmount = vehicle.withDriverCharges.withDriverDailyCharges * noOfDays;
    // }

    let booking = new Booking({
       renter           :   vehicle.vehicleOwner,
       rentee           :   req.body.rentee,
       vehicle          :   vehicle._id,
       startTime        :   req.body.startTime,
       endTime          :   req.body.endTime,
       startCode        :   Math.round(Math.random() * 1E9).toString().substring(0,5),
       endCode          :   Math.round(Math.random() * 1E9).toString().substring(0,5),
       totalAmount      :   totalAmount,
       //selfDrive        :   selfDrive == 'true' || selfDrive == true ? true : false,
       rentalDuration   :   noOfDays
     //  renteeLocation   :   req.body.renteeLocation ? req.body.renteeLocation : null
    })

    
    let timeObject = new Date();
    //timeObject = new Date(timeObject.getTime() + 1000 * 7200);
    timeObject = new Date(timeObject.getTime() + 1000 * 50);
    schedule.scheduleJob(timeObject, () => {
       Booking.findById(booking._id).then((_booking)=>{
            if(!_booking.bookingConfirmed){
                // Booking.findByIdAndUpdate(
                //     _booking._id,
                //     {
                //         rentalStatus : '1'
                //     },
                //     { new: true }
                // ).then((__bookig)=>{
                //     console.log(__bookig.rentalStatus+ '<< new status >>');   
                // });
             }
         });
    });

    booking = await booking.save();
    if(!booking){
        return  res.status(500).json({Success:true,Message:'something went wrong cant request booking', responseCode : 500}); 
    }
    return res.status(200).json({Success:true,Message:'Booking request send successfully, you will be notified when the renter confirms or rejects the Booking request in 2 hours',Payload:booking , responseCode : 200});
    
    
});

exports.getBookings = asyncHandler(async (req,res) => {
    
    if(req.query.dates){
    let hasVehicle = false;
    let vehicle;
    if (req.query.vehicle) {
        if (!isValidObjectId(req.query.vehicle)) {
            return res.status(400).json({ Success: false, Message: 'invalid vehicle id', responseCode :400 });
        }
        // return res.status(400).json({ Success: false, Message: 'vehicle id not provided', responseCode :400 });
        vehicle = await Vehicle.findOne({_id : req.query.vehicle}).populate('vehicleOwner vehicleCategory');           
        hasVehicle = true;
    }

    const moment = MomentRange.extendMoment(Moment);
    var dates = [];
    res.advancedResults.data.map((booking) => {
        const start = new Date(booking.startTime), end = new Date(booking.endTime);
        const range = moment.range(moment(start.setDate(start.getDate() + 1)), moment(end.setDate(end.getDate() + 1)));
        Array.from(range.by('day')).map((date)=>{
            dates.push(date);
        });
    });
    res.advancedResults.data = hasVehicle ? {dates : dates , vehicle : vehicle} : {dates : dates};
    return res.status(200).json({Success:true,Message:'Showing Booking Dates',Payload:res.advancedResults , responseCode : 200});
   }else{
    const bookings = res.advancedResults;
    return res.status(200).json({Success:true,Message:'Showing Bookings',Payload:bookings , responseCode : 200});
   }
});





 



//calculate days 
var days =  asyncHandler( (date_1, date_2) => {
    let difference =  date_2.getTime()-date_1.getTime();
    let TotalDays = Math.ceil(difference / (1000 * 3600 * 24));
    return TotalDays;
});


