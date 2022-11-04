const {User} = require('../models/User');
const {VehicleCategory} = require('../models/VehicleCategory');
const {Vehicle} = require('../models/Vehicle');
const {check} = require('express-validator');
const { buildCheckFunction } = require('express-validator');
const { isValidObjectId } = require('mongoose');
const checkBodyAndQuery = buildCheckFunction(['body', 'query']);



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
    check('brand').not().isEmpty().withMessage('vehicle brand not provided'),
    check('model').not().isEmpty().withMessage('vehicle model not provided'),
    check('model').custom((value, {req, loc, path}) => {
        return VehicleCategory.findOne({
            model : req.body.model
        }).then(model => {
            if (model) {
                return Promise.reject(`Vehicle Model = "${req.body.model}" already exists`)
            }
        })
        }),
    check('year').not().isEmpty().withMessage('vehicle model year not provided').isNumeric().withMessage('vehicle model year should be numeric only'),
    
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
    //registration no
    check('registrationNumber'  ,'vehicle registration no is not provided').not().isEmpty(),
    check('registrationNumber'  ,'vehicle registration no should be atleast 5 characters long').isLength({min:5}),
    check('registrationNumber'  ,'vehicle registration no should not exceed maximum of 10 characters').isLength({max:10}),
    check('registrationNumber').custom((value, {req, loc, path}) => {
        return Vehicle.findOne({
            registrationNumber : req.body.registrationNumber
        }).then(vehicle => {
            if (vehicle) {
                return Promise.reject('vehicle with the provided registration no already exists');
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

    //is Available for self Drive
    check('isAvailableForSelfDrive' ,'vehicle self drive availabilty info not provided').not().isEmpty(),
    check('isAvailableForSelfDrive' ,'vehicle self drive availabilty info should be in boolean form').isBoolean(),

    //with driver charges
    check('withDriverDailyCharges'   ,'with driver, daily rental charges of vehicle not provided').not().isEmpty(),
    check('withDriverDailyCharges'   ,'with driver, daily rental charges of vehicle should be in numeric form').isNumeric(),
    check('withDriverWeeklyCharges'  ,'with driver, weekly rental charges of vehicle not provided').not().isEmpty(),
    check('withDriverWeeklyCharges'  ,'with driver, weekly rental charges of vehicle should be in numeric form').isNumeric(),
    check('withDriverMonthlyCharges' ,'with driver, monthly rental charges of vehicle not provided').not().isEmpty(),
    check('withDriverMonthlyCharges' ,'with driver, monthly rental charges of vehicle should be in numeric form').isNumeric(),

    //self drive charges
    check('isAvailableForSelfDrive').custom((value) => {
       if(value == 'true') {
        check('selfDriveHourlyCharges'  ,'self drive, hourly rental charges of vehicle not provided').not().isEmpty()
        check('selfDriveHourlyCharges'  ,'self drive, hourly rental charges of vehicle should be in numeric form').isNumeric(),
        check('selfDriveDailyCharges'   ,'self drive, daily rental charges of vehicle not provided').not().isEmpty(),
        check('selfDriveDailyCharges'   ,'self drive, daily rental charges of vehicle should be in numeric form').isNumeric(),
        check('selfDriveWeeklyCharges'  ,'self drive, weekly rental charges of vehicle not provided').not().isEmpty(),
        check('selfDriveWeeklyCharges'  ,'self drive, weekly rental charges of vehicle should be in numeric form').isNumeric(),
        check('selfDriveMonthlyCharges' ,'self drive, monthly rental charges of vehicle not provided').not().isEmpty(),
        check('selfDriveMonthlyCharges' ,'self drive, monthly rental charges of vehicle should be in numeric form').isNumeric()
       }
       return true;
    }),

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





module.exports = {
    userRegistrationValidation,
    userLoginValidation,
    vehicleRegistrationValidation,
    getNearByVehiclesValidation,
    vehicleCategoriesValidation,
    addBookingValidation,
    getBookingsValidation
}








// check('startTime').custom((value) => {
//     value = new Date(value);
//     timeNow = new Date();
//     timeLimit = new Date(timeNow.getTime()+1000*7200*2);
//     if(value.getTime() < timeLimit.getTime()){
//         return Promise.reject('Vehicle Rental Start Time should be atleast after 4 hours at the time of booking');
//     }else{
//     check('endTime').custom((endTimeValue) => {
//         const endTime = new Date(value.getTime()+1000*3600*24);
//         endTimeValue = new Date(endTimeValue);
//         if(endTimeValue.getTime()<endTime.getTime()){
//             return Promise.reject('Vehicle cannot be rented for less than a day');
//         }
//         return true;
//     });
// }
//     return true;
// })










// const userLoginValidation = [
//     check('username').custom((username, {req, loc, path}) => {
//        if(req.body.username === '' || req.body.username === null || typeof(req.body.username)=='undefined') {
//        check('email').custom((email, {req, loc, path})=>{
//            req.body.email.isEmail().normalizeEmail({ gmail_remove_dots: true }).withMessage('Please include a valid email')
//        })  
//        }  
//        else if(req.body.username.length < 5){
//            return Promise.reject('username should be atleast 5 characters long');
//        }
//        return true;
       
//     }),
    
//     check('password' ,'Password must be 8 or more characters long').isLength({ min: 8 })

// ]