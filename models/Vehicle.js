const mongoose = require('mongoose');
//const geocoder = require('../helpers/geocoder');


const vehicleSchema = mongoose.Schema({
    vehicleOwner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    vehicleCategory: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'VehicleCategory',
        required: true
    },
    registrationNumber: {
        type: String,
        required: true,
        unique: true
    },
    pickupLocation: {
        type: {
            type: String,
            enum: ['Point'],
            required: true
        },
        coordinates:
        {
            type: [Number],
            index: '2dsphere',
            required: true
        }
    },
    formattedAddress: {
        type: String,
        max: 300
    },
    isAvailable: {
        type: Boolean,
        default: false
    },
    isBooked: {
        type: Boolean,
        default: false
    },
    description: {
        type: String,
        max: 100,
        default: ''
    },
    noOfSeats: {
        type: String,
        required: true,
        max: 2
    },
    fuelType: {
        type: String,
        required: true,
        max: 20
    },
    noOfAirbags: {
        type: String,
        required: true,
        max: 2
    },
    isAutomatic: {
        type: Boolean,
        required: true
    },
    noOfDoors: {
        type: String,
        required: true,
        max: 1
    },
    isAircondition: {
        type: Boolean,
        required: true
    },
    images: {
        type: [{
            type: String
        }],
        validate: [arrayLimit, 'no of images exceeded the limit of 10'],
        required: true
    },
    isAvailableForSelfDrive: {
        type: Boolean,
        required: true
    },
    selfDriveCharges: {
        selfDriveHourlyCharges: {
            type: Number
        },
        selfDriveDailyCharges: {
            type: Number
        },
        selfDriveWeeklyCharges: {
            type: Number
        },
        selfDriveMonthlyCharges: {
            type: Number
        }

    },
    withDriverCharges: {

        withDriverDailyCharges: {
            type: Number,
            required: true
        },
        withDriverWeeklyCharges: {
            type: Number,
            required: true
        },
        withDriverMonthlyCharges: {
            type: Number,
            required: true
        }

    },
    approvalStatus: {
        type: String,
        default: '0'
    },
    reasonForRejection: {
        type: String,
        default: ''
    }
},
    {
        timestamps: true,
        // toJSON: { virtuals: true },
        // toObject: { virtuals: true }
    }
);

function arrayLimit(val) {
    return val.length <= 10;
}

// // Geocode & create location field
// vehicleSchema.pre('save', async function(req,res,next) {
//     //const result = await geocoder.reverse({ lat: this.pickupLocation.coordinates[1], lon: this.pickupLocation.coordinates[0] });
//     let result = await geocoder.reverse({ lat: this.pickupLocation.coordinates[1], lon: this.pickupLocation.coordinates[0] });
//     result = result[0];
//     //this.formattedAddress = `${result.streetName}, ${result.city}, ${result.stateCode}`;
//     this.formattedAddress = result.formattedAddress;
//     next();
//   });

exports.Vehicle = mongoose.model('Vehicle', vehicleSchema);
