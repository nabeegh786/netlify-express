const mongoose = require('mongoose');
//const geocoder = require('../helpers/geocoder');


const bookingSchema = mongoose.Schema({
    renter: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    rentee: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    vehicle: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Vehicle',
        required: true
    },
    startTime:{
        type:Date,
        required: true
    },
    endTime:{
        type:Date,
        required:true
    },
    startCode:{
        type:String,
        length:6,
        required:true
    },
    endCode:{
        type:String,
        length:6,
        required:true
    },
    bookingConfirmed:{
        type:Boolean,
        default:false
    },
    rentalStatus:{
        //0 for neverbooked or pending , 1 means booked or bookign confirmed by renter, 2 means cancelled by renter, 3 could not be completed after booking confirmed by renter, 4 means rental completed successfully
        type:String,
        length:1,
        default:'0'
    },
    totalAmount:{
        type:Number,
        required: true,
    },
    // selfDrive:{ // false means with driver , true means self drive
    //     type:Boolean,
    //     required:true
    // },
    renteeLocation: {
        type: [{
            lat : Number,
            lng : Number
        }]
    },
    rentalDuration:{
        type : Number,
        required : true
    }
    
},
    {
        timestamps: true,
        // toJSON: { virtuals: true },
        // toObject: { virtuals: true }
    }
);

// function arrayLimit(val) {
//     return val.length <= 10;
// }

// // Geocode & create location field
// vehicleSchema.pre('save', async function(req,res,next) {
//     //const result = await geocoder.reverse({ lat: this.pickupLocation.coordinates[1], lon: this.pickupLocation.coordinates[0] });
//     let result = await geocoder.reverse({ lat: this.pickupLocation.coordinates[1], lon: this.pickupLocation.coordinates[0] });
//     result = result[0];
//     //this.formattedAddress = `${result.streetName}, ${result.city}, ${result.stateCode}`;
//     this.formattedAddress = result.formattedAddress;
//     next();
//   });

exports.Booking = mongoose.model('Booking', bookingSchema);
