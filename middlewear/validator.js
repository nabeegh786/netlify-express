const {User} = require('../models/User');
const {VehicleCategory} = require('../models/VehicleCategory');
const {Vehicle} = require('../models/Vehicle');
const {check} = require('express-validator');
const { buildCheckFunction } = require('express-validator');
const { isValidObjectId } = require('mongoose');
const checkBodyAndQuery = buildCheckFunction(['body', 'query']);
const compare = require('../middlewear/faceComparision');
var fs = require('fs');



const checkLatitude = (latitude) => {
    return isFinite(latitude) && Math.abs(latitude) <= 90;
};

const checkLongitude = (longitude) => {
    return isFinite(longitude) && Math.abs(longitude) <= 180;
};

const userRegistrationValidation = [
    check('username'         ,'username is required').not().isEmpty(),
    check('username'         ,'username should be greater than 5 characters').isLength({min:5}),
    check('username'         ,'username should be less than 30 characters').isLength({max:30}),
    check('username').custom((value, {req, loc, path}) => {
        return User.findOne({
            username : req.body.username
        }).then(user => {
            if (user) {
                return Promise.reject('The username already exists, try something else')
            }
        })
        }),
    check('phone'            ,'invalid phone no').isMobilePhone(),
    check('phone'            ,'phone no should not exceed 11 digits').isLength({max:11}),
    check('email'            ,'Please include a valid email').isEmail(),
    check('email').custom((value, {req, loc, path}) => {
        return User.findOne({
            email : req.body.email
        }).then(user => {
            if (user) {
                return Promise.reject('This email is already registered');
            }
        })
        }),
    check('password','Password must be 6 or more characters long').isLength({ min: 6 }),
    check('confirmPassword').custom((value, {req}) => {
        if(value != req.body.password){
            return Promise.reject("Password and its Confirmation didn't match");
        }
        return true;
    }
    )
]

const userLoginValidation = [
     check('username').custom((username, {req, loc, path}) => {
        if(req.body.username === '' || req.body.username === null || typeof(req.body.username)=='undefined') {
            return Promise.reject('username or email is required');  
        }  
        if(check(username).isEmail().normalizeEmail({ gmail_remove_dots: true })){
           return true;
        }else{
            if (req.body.username.length < 5){
                return Promise.reject('length of username must be atleast 5 characters');  
            }
        }
        return true;
     }),
     check('password' ,'Password must be 6 or more characters long').isLength({ min: 6 })
 
]
 
const vehicleCategoriesValidation = [
    
    check('vehicleType').custom((value, {req, loc, path}) => {
        return VehicleCategory.findOne({
            vehicleType : req.body.vehicleType
        }).then(model => {
            if (model) {
                return Promise.reject(`Vehicle Type = ${req.body.vehicleType} already exists`)
            }
        })
        })
    
]

const vehicleRegistrationValidation = [

    //vehicle Owner
    check('vehicleOwner'  ,'vehicle owner Id is not provided').not().isEmpty(),
    check('vehicleOwner'  ,'vehicle owner Id is not valid').isMongoId(),
    check('vehicleOwner').custom((value) => {
        return User.findOne({
            _id: value
        }).then(user => {
            if (!user) {
                return Promise.reject('Incorrect Vehicle Owner Id, user with this Id does not exist');
            }
        });
    }),
    
    //vehicle category
    check('vehicleCategory'  ,'vehicle category Id is not provided').not().isEmpty(),
    check('vehicleCategory'  ,'vehicle category Id is not valid').isMongoId(),
    check('vehicleCategory').custom((value, {req, loc, path}) => {
        return VehicleCategory.findOne({

           _id : req.body.vehicleCategory

        }).then(user => {
            if (!user) {
                return Promise.reject('Incorrect Vehicle Category Id, vehicle Category with this Id does not Exists');
            }
        });
    }),

    //vehicle Type
    check('vehicleType').not().isEmpty().withMessage('vehicle type not provided'),

    //brand
    check('brand').not().isEmpty().withMessage('vehicle brand not provided'),

    //model
    check('model').not().isEmpty().withMessage('vehicle model not provided'),

    //year
    check('year').not().isEmpty().withMessage('vehicle model year not provided'),

    //registration no
    check('registrationNumber'  ,'vehicle registration no is not provided').not().isEmpty(),
    check('registrationNumber'  ,'vehicle registration no should be atleast 5 characters long').isLength({min:5}),
    check('registrationNumber'  ,'vehicle registration no should not exceed maximum of 10 characters').isLength({max:10}),
    check('registrationNumber').custom((value, {req, loc, path}) => {
        return Vehicle.findOne({
            registrationNumber : req.body.registrationNumber
        }).then(vehicle => {
            if (vehicle) {
                if(vehicle.approvalStatus != '2'){
                return Promise.reject('vehicle with the provided registration no already exists');
                }
            }
        });
    }), 
    check('registrationNumber', 'the vehicle registration no provided is not a valid no.').matches(/^([A-Z]{2,5}(-| )[0-9]{2,5})?$/),
    
    //pickup location
    check('pickupLocation').custom((value) => {
        const pickupLocation = value;
        if(!Array.isArray(pickupLocation)) return Promise.reject('the pickup location is not in an Array Format like => ["latitude,"longitude"]');
        if(pickupLocation.length>2 || pickupLocation.length <1) return Promise.reject('invalid pickup location provided');
        check(value, 'the Pickup Location Coordinates should be a number not string').isNumeric();
        pickupLocation[0] = Number(pickupLocation[0]);
        pickupLocation[1] = Number(pickupLocation[1]);
        if(!(typeof(pickupLocation[0]) == 'number') && !(typeof(pickupLocation[1]) == 'number')) return Promise.reject('the Pickup Location Coordinates should be a number not string');
        if(!checkLatitude(pickupLocation[0])) return Promise.reject('the latitude of pickup location is invalid');
        if(!checkLongitude(pickupLocation[1])) return Promise.reject('the longitude of pickup location is invalid');
        return true;
    }),

    //no of seats
    check('noOfSeats' ,'no of seats not provided').not().isEmpty(),
    check('noOfSeats' ,'no of seats should be in numeric form').isNumeric(),
    check('noOfSeats' ,'no of seats should not exceed 2 digits').isLength({ max: 2 }),

    //fuel type
    check('fuelType' ,'fuelt type not provided').not().isEmpty(),
    check('fuelType' ,'fuelt type should not exceed 20 characters').isLength({ max: 20 }),

    //no of Air bags
    check('noOfAirbags' ,'no of airbags not provided').not().isEmpty(),
    check('noOfAirbags' ,'no of airbags should be in numeric form').isNumeric(),
    check('noOfAirbags' ,'no of airbags should not exceed 2 digits').isLength({ max: 2 }),

    //is Automatic
    check('isAutomatic' ,'vehicle transmission not provided').not().isEmpty(),
    check('isAutomatic' ,'vehicle transmission should be in boolean form').isBoolean(),
  
    //no of Doors
    check('noOfDoors' ,'no of doors not provided').not().isEmpty(),
    check('noOfDoors' ,'no of doors should be in numeric form').isNumeric(),
    check('noOfDoors' ,'no of doors should not exceed 1 digit').isLength({ max: 1 }),

    //is Airconditioned
    check('isAircondition' ,'Vehicle air condition info not provided').not().isEmpty(),
    check('isAircondition' ,'Vehicle air condition info should be in boolean form').isBoolean(),

    //self drive charges
    check('selfDriveDailyCharges'   ,'self drive, daily rental charges of vehicle not provided').not().isEmpty(),
       

    //Reason For Rejection
   // check('approvalStatus').custom((value) => {
    check('approvalStatus').custom((value, {req, loc, path}) => {
        if(value == '1'){
            // check('reasonForRejection').custom((reason) => {
                var reason = req.body.reasonForRejection 
                if(reason == '' || reason == null || typeof(reason) == 'undefined'){
                    Promise.reject('Reason for Rejection not provided')
                }
            //})
        }
        return true;
    })
]

const getNearByVehiclesValidation = [
    check('pickupLocation').custom((value) => {
        let pickupLocation = value.toString().split(',');
        if(pickupLocation.length != 2){
            return Promise.reject('the pickup location is not in a correct Format like => "latitude,"longitude"');
        }
        check(value,'the Pickup Location Coordinates should be numeric').isNumeric();
        pickupLocation[0] = Number(pickupLocation[0]);
        pickupLocation[1] = Number(pickupLocation[1]);
        if(!checkLatitude(pickupLocation[0])) return Promise.reject('the latitude of pickup location is invalid');
        if(!checkLongitude(pickupLocation[1])) return Promise.reject('the longitude of pickup location is invalid');
        return true;
    })
]

const addBookingValidation = [
    check('rentee'  ,'rentee Id is not valid').isMongoId(),
    check('vehicle'  ,'vehicle Id is not valid').isMongoId(),
//    check('selfDrive'  ,'selfDrive must be either true or false').isBoolean(),
    check('startTime').custom((value, {req, loc, path}) => {
        value = new Date(req.body.startTime);
        timeNow = new Date();
        timeLimit = new Date(timeNow.getTime() + 1000 * 7200 * 2);
        if(value.getTime() < timeLimit.getTime())
        {
            return Promise.reject('Rental Start Time should be atleast after 4 hours at the time of booking');
        }
        const endTime = new Date(value.getTime() + 1000 * 3600 * 24);
        endTimeValue = new Date(req.body.endTime);
        if(endTimeValue.getTime()<endTime.getTime())
        {
            return Promise.reject('Total period of rental should be more than a day');
        }
        return true;
      
    })
   
]

const getBookingsValidation = [
   // check('vehicle','Invalid Vehicle Id').not().isMongoId()
   check('vehicle').custom((value, {req, loc, path}) => {
       let boo = isValidObjectId(value);
       if(!boo){
        return  Promise.reject('Invalid Vehicle Id');
       }
       return true;
   })
]

const changePasswordValidation = [
    check('password','Password must be 6 or more characters long').isLength({ min: 6 }),
    check('confirmPassword').custom((value, {req}) => {
        if(value != req.body.password){
            return Promise.reject("Password and its Confirmation didn't match");
        }
        return true;
    }
    )
]

const changePasswordValidationn = [
    check('password','Password must be 6 or more characters long').isLength({ min: 6 }),
    check('confirmPassword').custom((value, {req}) => {
        if(value != req.body.password){
            return Promise.reject("Password and its Confirmation didn't match");
        }
        return true;
    }
    )
]

const userProfileUpdateValidation = [
    check('username'         ,'username should be greater than 5 characters').isLength({min:5}),
    check('username'         ,'username should be less than 30 characters').isLength({max:30}),
    check('username').custom((value, {req, loc, path}) => {
        return User.findOne({
            username : req.body.username,
            _id : {$ne : req.user._id}
        }).then(user => {
            if (user) {
                return Promise.reject('The username already exists, try something else')
            }
        })
        }),
    check('phone'            ,'invalid phone no').isMobilePhone(),
    check('phone'            ,'phone no should not exceed 11 digits').isLength({max:11}),
    check('email'            ,'Please include a valid email').isEmail(),
    check('email').custom((value, {req, loc, path}) => {
        return User.findOne({
            email : req.body.email,
            _id : {$ne : req.user._id}
        }).then(user => {
            if (user) {
                return Promise.reject('This email is already registered');
            }
        })
        })

]


module.exports = {
    userRegistrationValidation,
    userLoginValidation,
    vehicleRegistrationValidation,
    getNearByVehiclesValidation,
    vehicleCategoriesValidation,
    addBookingValidation,
    getBookingsValidation,
    changePasswordValidation,
    userProfileUpdateValidation
}






