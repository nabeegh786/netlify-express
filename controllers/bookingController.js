const {Booking} = require('../models/Booking');
const {Vehicle} = require('../models/Vehicle');
const {CardDetails} = require('../models/CardDetails');
const {Payment} = require('../models/Payment');
const {Wallet} = require('../models/Wallet');
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
    let renteeId = req.user._id;
    //let selfDrive = req.body.selfDrive;
    let startDatetime = new Date(req.body.startTime);
    let enddDatetime = new Date(req.body.endTime);
    let totalAmount = 0;
    let noOfDays = await days(startDatetime,enddDatetime);
    const vehicle = await Vehicle.findById(req.body.vehicle);
    if(!vehicle){
        return res.status(400).json({Success:false,Message: 'wrong vehicle id' , responseCode :400});
    }
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
       rentee           :   renteeId,
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
    booking = await booking.save();
    let populatedBooking = await booking.populate('renter rentee vehicle'); 
    let renterFirebaseToken =  populatedBooking.renter.firebaseToken;
    let renteeFirebaseToken =  populatedBooking.rentee.firebaseToken;

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
                    sendNotification('RentWheels Booking Cancelled',`Your Booking Has Been Cancelled due to no response by the Car Owner, Booking id = ${__bookig._id}`, renteeFirebaseToken); 
                });
             }
         });
    });

   

    if(!booking){
        return  res.status(500).json({Success:true,Message:'something went wrong cant request booking', responseCode : 500}); 
    }

    
    let cardDetails = new CardDetails({
        cardNo             :    req.body.cardNo,
        cvv                :    req.body.cvv,
        cardHolderName     :    req.body.cardHolderName,
        expiry             :    req.body.expiry
    });

    cardDetails = await cardDetails.save();

    if(!cardDetails){
        return res.status(500).json({Success:false,Message : `Something Went Wrong Cannot Make Payment`, responseCode : 500});
    }


    let payment = new Payment({
        cardDetailsId        :    cardDetails._id,
        bookingId            :    booking._id,
        fromUser             :    renteeId,
        toUser               :    booking.renter,
        transactionDate      :    new Date(),
        amount               :    totalAmount-(totalAmount*0.05),
        serviceCharges       :    totalAmount*0.05
    });
    payment = await payment.save();
   
    if(!payment){
        return res.status(500).json({Success:false,Message : `Something Went Wrong Cannot Make Payment`, responseCode : 500});
    }

   // if payment made successfully send notification to rentee and renter
   sendNotification('RentWheels Payment Completed',`Vehicle Booked Successfully, Total Rental Amount = ${payment.amount + payment.serviceCharges} rs has been deducted`, renteeFirebaseToken );

   sendNotification('RentWheels Booking Request Recieved',`You have recieved a booking request for Vehicle = ${populatedBooking.vehicle.brand} ${populatedBooking.vehicle.model} ${populatedBooking.vehicle.year}, Vehicle Registation Number ${populatedBooking.vehicle.registrationNumber} Booking id = ${booking._id}`, renterFirebaseToken); 
    
    return res.status(200).json({Success:true,Message:'Booking request sent successfully, you will be notified when the renter confirms or rejects the Booking request in 2 hours',Payload:booking , responseCode : 200});
    
    
});

exports.getBookings = asyncHandler(async (req,res) => {
    
    if(req.query.dates){
    let hasVehicle = false;
    let vehicle;
    if (req.query.vehicle) {
        if (!isValidObjectId(req.query.vehicle)) {
            return res.status(400).json({ Success: false, Message: 'invalid vehicle id', responseCode :400 });
        };
       
        vehicle = await Vehicle.findOne({_id : req.query.vehicle}).populate('vehicleOwner vehicleCategory');           
        hasVehicle = true;
    }

    const moment = MomentRange.extendMoment(Moment);
    var dates = [];
    res.advancedResults.data.map((booking) => {
        const start = new Date(booking.startTime), end = new Date(booking.endTime);
        const range = moment.range(moment(start.setDate(start.getDate())), moment(end.setDate(end.getDate())));
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
        var pending     =    [];
        var approved    =    [];
        var rejected    =    [];
       
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
    var booking = await Booking.findById(bookingID); //.populate({ path: 'renter rentee', model: 'User', select: '-passwordHash' }).populate('vehicle');  
    
    
    if(booking == null || typeof(booking) == 'undefined' ){
        return res.status(400).json({ Success: false, Message: 'booking with this id does not exist', responseCode :400 });
    }

    if(booking.bookingConfirmed == true || booking.rentalStatus != '0'){
        return res.status(400).json({ Success: false, Message: 'you cannot approve or reject this booking', responseCode :400 });
    }

    var success  = true;
    
    var updatedBooking = null;
    var updatedVehicle = null;

        updatedBooking = await Booking.findByIdAndUpdate(
        booking._id ,
        { $set: { rentalStatus: approve, bookingConfirmed : approve == '1' ? true : false}}
        ,{new : true}
        );
       var populatedBooking = await updatedBooking.populate('renter rentee vehicle');
        if(updatedBooking.rentalStatus == '1'){
             updatedVehicle = await Vehicle.findByIdAndUpdate(
                updatedBooking.vehicle ,
               { $set: { isBooked : true}}
               ,{new : true}
               );
           }
        if(approve == '2'){
           if(!updatedBooking){
            success = false;
           }
        }else if(approve == '1'){
            if(!updatedBooking || !updatedVehicle){
                success = false;
            }
        }

           let  Message  = approve == '1' ? 'Approved' : 'Rejected';
        if(success){
            
            approve == '1' ? 
            sendNotification('RentWheels Booking Request Accepted',`Your Booking Request Has Been Accepted by the Car Owner, Vehicle = ${populatedBooking.vehicle.brand} ${populatedBooking.vehicle.model} ${populatedBooking.vehicle.year}, Registration no = ${populatedBooking.vehicle.registrationNumber}, Booking id = ${populatedBooking._id}`, populatedBooking.rentee.firebaseToken )
            
            : sendNotification('RentWheels Booking Request Rejected',`Your Booking Request Has Been Rejected by the Car Owner,, Vehicle = ${populatedBooking.vehicle.brand} ${populatedBooking.vehicle.model} ${populatedBooking.vehicle.year}, Registration no = ${populatedBooking.vehicle.registrationNumber},  Booking id = ${populatedBooking._id}`, populatedBooking.rentee.firebaseToken); 
                   
            return res.status(200).json({Success:true,Message:`Booking Request ${Message} Successfully`, responseCode : 200});
        }else{
           
            return res.status(500).json({Success:true,Message:`Something Went Wrong Cannot  ${Message} Request `, responseCode : 500});
        }
});
 

exports.startRental = asyncHandler(async (req,res) => {
    
    var id = req.user.id;
    var cnicNo = req.body.cnicNo;
    var bookingID = req.body.bookingID;
    var startCode = req.body.startCode;
    if(bookingID == '' || bookingID == null || typeof(bookingID) == 'undefined' || !isValidObjectId(bookingID)){
        return res.status(400).json({ Success: false, Message: 'invalid booking ID', responseCode :400 });
    }
    if(cnicNo =='' || cnicNo == null || typeof(cnicNo) == 'undefined'){
        return res.status(400).json({ Success: false, Message: 'cnic not provided cannot start booking', responseCode :400 });
    }

    if(id =='' || id == null || typeof(id) == 'undefined'){
        return res.status(400).json({ Success: false, Message: 'cannot start booking', responseCode :400 });
    }

    if(startCode =='' || startCode == null || typeof(startCode) == 'undefined'){
        return res.status(400).json({ Success: false, Message: 'please provide start code', responseCode :400 });
    }

    var booking = await Booking.findById(bookingID).populate({ path: 'renter rentee', model: 'User', select: '-passwordHash' }).populate('vehicle');  
    
    var renteeCNIC = await booking.rentee.populate("verificationID");
   
    if(renteeCNIC.verificationID.cnicNo != cnicNo){
        return res.status(400).json({ Success: false, Message: 'wrong cnic No', responseCode :400 });
    }

    if(!booking ){
        return res.status(400).json({ Success: false, Message: 'wrong booking id', responseCode :400 });
    }

    if(booking.renter._id != id ){
        return res.status(400).json({ Success: false, Message: 'only car owner can start the booking', responseCode :400 });
    }
    if(booking.bookingConfirmed != true || booking.rentalStatus != '1' ){
        return res.status(400).json({ Success: false, Message: 'wrong rental status or booking is not Confirmed', responseCode :400 });
    }
    if(booking.startCode != startCode){
        return res.status(400).json({ Success: false, Message: 'invalid start code', responseCode :400 });
    }

    let success  = false;
    let err = "";
    await Booking.findByIdAndUpdate(
        booking._id ,
        { $set: {rentalStatus: '4'}}
        ,{new : true}
        ).populate('rentee renter vehicle')
        .then((booking)=>{
          
          sendNotification('RentWheels Rental Started',`Your Rental Has Been Started by the Car Owner, Vehicle = ${booking.vehicle.brand} ${booking.vehicle.model} ${booking.vehicle.year}, Registration no = ${booking.vehicle.registrationNumber}, Booking id = ${booking._id}  rental end time = ${Moment(booking.endTime).format('MMM Do YYYY h:mm:ss a')}`, booking.rentee.firebaseToken );
          sendNotification('RentWheels Rental Started',`Your Rental Has Been Started, Vehicle = ${booking.vehicle.brand} ${booking.vehicle.model} ${booking.vehicle.year}, Registration no = ${booking.vehicle.registrationNumber}, Booking id = ${booking._id} rental end time = ${Moment(booking.endTime).format('MMM Do YYYY h:mm:ss a')}`, booking.renter.firebaseToken );  
          success = true;
          
        }).catch((error)=>{
            err = error;
            success = false;
            
        });    
      
        if(success){
            return res.status(200).json({Success:true,Message:`Rental Started Successfully`, responseCode : 200});  
        }else{
            return res.status(500).json({Success:false,Message:`Something Went Wrong Cannot Start Rental `+err, responseCode : 500});
        }
});
 

exports.endRental = asyncHandler(async (req,res) => {
    
    var id = req.user.id;
    var bookingID = req.body.bookingID;
    var endCode = req.body.endCode;
    if(bookingID == '' || bookingID == null || typeof(bookingID) == 'undefined' || !isValidObjectId(bookingID)){
        return res.status(400).json({ Success: false, Message: 'invalid booking ID', responseCode :400 });
    }
    if(id =='' || id == null || typeof(id) == 'undefined'){
        return res.status(400).json({ Success: false, Message: 'cannot end booking', responseCode :400 });
    }
    if(endCode =='' || endCode == null || typeof(endCode) == 'undefined'){
        return res.status(400).json({ Success: false, Message: 'please provide end code', responseCode :400 });
    }

    var booking = await Booking.findById(bookingID).populate({ path: 'renter rentee', model: 'User', select: '-passwordHash' }).populate('vehicle');  
    
    
    if(!booking ){
        return res.status(400).json({ Success: false, Message: 'wrong booking id', responseCode :400 });
    }

    if(booking.rentee._id != id ){
        return res.status(400).json({ Success: false, Message: 'only renter can end the booking', responseCode :400 });
    }
    if(booking.bookingConfirmed != true || booking.rentalStatus != '4' ){
        return res.status(400).json({ Success: false, Message: 'cannot end booking, wrong rental status', responseCode :400 });
    }
    if(booking.endCode != endCode){
        return res.status(400).json({ Success: false, Message: 'invalid end code', responseCode :400 });
    }

    
    let _booking = await Booking.findByIdAndUpdate(
        booking._id ,
        { $set: {rentalStatus: '3', bookingConfirmed : false}}
        ,{new : true}
        ).populate('rentee renter');
       if(!booking){
        return res.status(500).json({Success:false,Message:`Something Went Wrong Cannot End Rental `+err, responseCode : 500});
       }
        let vehicle = await Vehicle.findByIdAndUpdate(
            _booking.vehicle ,
            { $set: { isBooked : false}}
            ,{new : true}
            );

        sendNotification('RentWheels Rental Completed',`Your Rental Has Been Completed, Vehicle = ${vehicle.brand} ${vehicle.model} ${vehicle.year}, Registration no = ${vehicle.registrationNumber}, Booking id = ${_booking._id} `, _booking.rentee.firebaseToken );
        sendNotification('RentWheels Rental Completed',`Your Rental Has Been Completed by the Renter, Vehicle = ${vehicle.brand} ${vehicle.model} ${vehicle.year} Registration no = ${vehicle.registrationNumber}, Booking id = ${_booking._id} `, _booking.renter.firebaseToken );  


        var wallet = await Wallet.findOne({user: _booking.renter._id});
        var payment = await Payment.findOne({bookingId: _booking._id});
       
        if(!payment){
            return res.status(500).json({Success:false,Message:`Bookings Payment Not found `+err, responseCode : 500});
        }
        if(!wallet){
            var userWallet = new Wallet({
                user: _booking.renter._id,
                balance: payment.amount
            });

            await userWallet.save();
            sendNotification('RentWheels Rental Completed',`Rental Completed Successfully, Total Rental Amount = ${payment.amount} rs has been transfered to your wallet, service charges = ${payment.serviceCharges} rs`, booking.renter.firebaseToken );
        }else{
        // update the wallet balance if already exist else insert
         Wallet.findOneAndUpdate(
            { user:  _booking.renter._id },
            { $set: { balance: wallet.balance +payment.amount} },
            { upsert: true, new: true },
            function(error) {
                if (error) return res.status(500).json({Success:false,Message : 'something went wrong', responseCode : 500});
                
               
            })

       
                
            }
        
        
                // update the Payment and mark completed  if already exist else insert
         Payment.findOneAndUpdate(
            {bookingId: _booking._id},
            { $set: { completed: true , transactionDate : Date.now()} },
            {  new: true },
            function(error) {
                if (error) return res.status(500).json({Success:false,Message : 'something went wrong', responseCode : 500});

            })


                // if wallet balance updated successfully then send notification to Car owner
                sendNotification('RentWheels Rental Completed',`Rental Completed Successfully, Total Rental Amount = ${payment.amount} rs has been transfered to your wallet, service charges = ${payment.serviceCharges} rs`, booking.renter.firebaseToken );


                return res.status(200).json({Success:true,Message:`Rental Ended Successfully`, responseCode : 200});
        

});


//calculate days 
var days =  asyncHandler( (date_1, date_2) => {
    let difference =  date_2.getTime()-date_1.getTime();
    let TotalDays = Math.ceil(difference / (1000 * 3600 * 24));
    return TotalDays+1;
});


//Booking status rental Status ki tarah se horha hai