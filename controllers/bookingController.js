const {Booking} = require('../models/Booking');
const {Vehicle} = require('../models/Vehicle');
const {isValidObjectId} = require('mongoose');
const {validationResult} = require('express-validator');
const asyncHandler = require('../middlewear/async');
const schedule = require('node-schedule');
const Moment = require('moment');
const MomentRange = require('moment-range');
const {sendNotification} = require('../helpers/notifications'); 



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
    totalAmount = vehicle.selfDriveDailyCharges * noOfDays;
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
    timeObject = new Date(timeObject.getTime() + 1000 * 7200);
    schedule.scheduleJob(timeObject, () => {
       Booking.findById(booking._id).then((_booking)=>{
            if(!_booking.bookingConfirmed){
                Booking.findByIdAndUpdate(
                    _booking._id,
                    {
                        rentalStatus : '2'
                    },
                    { new: true }
                ).populate('rentee').then((__bookig)=>{
                    sendNotification('RentWheels Booking Cancelled',`Your Booking Has Been Cancelled due to no response by the Car Owner, Booking id = ${__bookig._id}`, __bookig.rentee.firebaseToken); 
                });
             }
         });
    });

    booking = await booking.save();
    if(!booking){
        return  res.status(500).json({Success:true,Message:'something went wrong cant request booking', responseCode : 500}); 
    }
    return res.status(200).json({Success:true,Message:'Booking request sent successfully, you will be notified when the renter confirms or rejects the Booking request in 2 hours',Payload:booking , responseCode : 200});
    
    
});

exports.getBookings = asyncHandler(async (req,res) => {
    
    if(req.query.dates){
    let hasVehicle = false;
    let vehicle;
    if (req.query.vehicle) {
        if (!isValidObjectId(req.query.vehicle)) {
            return res.status(400).json({ Success: false, Message: 'invalid vehicle id', responseCode :400 });
        }
       
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


exports.getMyBookings = asyncHandler(async (req,res) => {
    
    var id = req.user.id;
    var bookings;
    var isBooking = req.query.isBooking;
    if(isBooking!='true' && isBooking!=true  && isBooking!='false' && isBooking!= false  ){
        return res.status(400).json({ Success: false, Message: 'booking or rental not specified', responseCode :400 });
    }
    if(req.query.isRenter!='true' && req.query.isRenter!=true  && req.query.isRenter!='false' && req.query.isRenter!= false  ){
        return res.status(400).json({ Success: false, Message: 'renter or rentee not defined', responseCode :400 });
    }
    if(req.query.isRenter=='true' || req.query.isRenter==true){
        bookings = await Booking.find({renter : id}).populate({ path: 'renter rentee', model: 'User', select: '-passwordHash' }).populate('vehicle');   
    }
    if(req.query.isRenter=='false' || req.query.isRenter==false){
        bookings = await Booking.find({rentee : id}).populate({ path: 'renter rentee', model: 'User', select: '-passwordHash' }).populate('vehicle');  
    }
    
    if(isBooking =='true' || isBooking ==true){
        var pending =    [];
        var approved =   [];
        var rejected =   [];
       
        bookings.map((booking)=>{
            if(booking.rentalStatus=='0') {
                
                booking.startCode = null;
                booking.endCode   = null;

                pending.push(booking);
            }
            if(booking.rentalStatus=='1') {
                if(req.query.isRenter ='false' || req.query.isRenter==false){
                    booking.endCode   = null;
                    
                }else{
                    booking.startCode = null;
                    booking.endCode   = null;
                }

                approved.push(booking);
            }
            if(booking.rentalStatus=='2') {
                booking.startCode = null;
                booking.endCode   = null;
                rejected.push(booking);
            }
           
        });
        return res.status(200).json({Success:true,Message:'Showing your Bookings',Payload:{pending : pending , approved: approved, rejected : rejected, completed : completed} , responseCode : 200});
    }
    

    var completed =  [];
    var onGoing = [];
    
    bookings.map((booking)=>{
        if(booking.rentalStatus=='3'){ 
            booking.startCode = null;
            booking.endCode   = null;

                
            completed.push(booking);
        }
        if(booking.rentalStatus=='4') {
            if(req.query.isRenter ='true' || req.query.isRenter==true){
                booking.startCode = null;
            }else{
                booking.startCode = null;
                booking.endCode   = null;
             }
            onGoing.push(booking);
        }
         });
    return res.status(200).json({Success:true,Message:'Showing your Bookings',Payload:{onGoing : onGoing , completed: completed, responseCode : 200}});
   
   
});


exports.approveOrRejectBooking = asyncHandler(async (req,res) => {
    
    var id = req.user.id;
    var bookingID = req.body.bookingID;
    if(bookingID == '' || bookingID == null || typeof(bookingID) == 'undefined' || !isValidObjectId(bookingID)){
        return res.status(400).json({ Success: false, Message: 'invalid booking ID', responseCode :400 });
    }
    if(id =='' || id == null || typeof(id) == 'undefined'){
        return res.status(400).json({ Success: false, Message: 'you cannot approve or reject this booking', responseCode :400 });
    }

    var approve = req.body.approve;
    if(approve!='true' && approve!=true  && approve!='false' && approve!= false){
        return res.status(400).json({ Success: false, Message: 'approve or reject not provided', responseCode :400 });
    }
    approve = req.body.approve == 'true' || req.body.approve ==  true ? '1' : '2';   
    var booking = await Booking.findById(bookingID).populate({ path: 'renter rentee', model: 'User', select: '-passwordHash' }).populate('vehicle');  
    
    
    if(booking == null || typeof(booking) == 'undefined' ){
        return res.status(400).json({ Success: false, Message: 'booking with this id does not exist', responseCode :400 });
    }

    if(booking.bookingConfirmed == true || booking.rentalStatus != '0'){
        return res.status(400).json({ Success: false, Message: 'you cannot approve or reject this booking', responseCode :400 });
    }
    Booking.findByIdAndUpdate(
        booking._id ,
        { $set: { rentalStatus: approve, bookingConfirmed : approve == '1' ? true : false}}
        ,{new : true}
        ).populate('rentee').then((booking)=>{
            if(booking.rentalStatus == '1'){
                 Vehicle.findByIdAndUpdate(
                    booking.vehicle ,
                    { $set: { isBooked : true}}
                    ,{new : true}
                    ).then((vehicle)=>{
                        console.log("Vehicle is Booked = true ",vehicle.isBooked);
                    });
            }
            approve == '1' ? sendNotification('RentWheels Booking Request Accepted',`Your Booking Request Has Been Accepted by the Car Owner, Booking id = ${booking._id}`, booking.rentee.firebaseToken ) : sendNotification('RentWheels Booking Request Rejected',`Your Booking Request Has Been Rejected by the Car Owner, Booking id = ${booking._id}`, booking.rentee.firebaseToken ); 
        });
    
        let  Message  = approve == '1' ? 'Approved' : 'Rejected';
        return res.status(200).json({Success:true,Message:`Booking Request ${Message} Successfully`, responseCode : 200});
});
 

exports.startRental = asyncHandler(async (req,res) => {
    
    var id = req.user.id;
    var bookingID = req.body.bookingID;
    var startCode = req.body.startCode;
    if(bookingID == '' || bookingID == null || typeof(bookingID) == 'undefined' || !isValidObjectId(bookingID)){
        return res.status(400).json({ Success: false, Message: 'invalid booking ID', responseCode :400 });
    }
    if(id =='' || id == null || typeof(id) == 'undefined'){
        return res.status(400).json({ Success: false, Message: 'cannot start booking', responseCode :400 });
    }
    if(startCode =='' || startCode == null || typeof(startCode) == 'undefined'){
        return res.status(400).json({ Success: false, Message: 'please provide start code', responseCode :400 });
    }

    var booking = await Booking.findById(bookingID).populate({ path: 'renter rentee', model: 'User', select: '-passwordHash' }).populate('vehicle');  
    
    
    if(!booking ){
        return res.status(400).json({ Success: false, Message: 'wrong booking id', responseCode :400 });
    }

    if(booking.renter._id != id ){
        return res.status(400).json({ Success: false, Message: 'only car owner can start the booking', responseCode :400 });
    }
    if(booking.bookingConfirmed != true || booking.rentalStatus != '1' ){
        return res.status(400).json({ Success: false, Message: 'cannot start booking, wrong rental status', responseCode :400 });
    }
    if(booking.startCode != startCode){
        return res.status(400).json({ Success: false, Message: 'invalid start code', responseCode :400 });
    }
    Booking.findByIdAndUpdate(
        booking._id ,
        { $set: {rentalStatus: '4'}}
        ,{new : true}
        ).populate('rentee').then((booking)=>{
          sendNotification('RentWheels Rental Started',`Your Rental Has Been Started by the Car Owner, Booking id = ${booking._id} rental end time = ${booking.endTime}`, booking.rentee.firebaseToken ); 
        })
    
        
        return res.status(200).json({Success:true,Message:`Rental Started Successfully`, responseCode : 200});
});
 

//calculate days 
var days =  asyncHandler( (date_1, date_2) => {
    let difference =  date_2.getTime()-date_1.getTime();
    let TotalDays = Math.ceil(difference / (1000 * 3600 * 24));
    return TotalDays;
});


//Booking status rental Status ki tarah se horha hai