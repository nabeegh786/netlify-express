const express = require('express');
const router = express.Router();

const { vehiclesStorage,
        vehicleCategoryStorage } = require('../middlewear/multerStorage')
        
const multer = require('multer');

const { vehicleRegistrationValidation,
        getNearByVehiclesValidation, 
        vehicleCategoriesValidation } = require('../middlewear/validator')
        
const { getVehicleCategories, 
        addVehicleCategories , 
        deleteVehicleCategories } = require('../controllers/vehicleCategoryController');

const uploadOptionsVehicles = multer({storage: vehiclesStorage});
const uploadOptionsVehicleCategory = multer({storage: vehicleCategoryStorage});

const { getNearByVehicles, 
        getVehicles, 
        getVehicleById, 
        addVehicle } = require('../controllers/vehicleController');

const advancedResults = require('../middlewear/advancedResults');

const { Vehicle } = require('../models/Vehicle');


require('dotenv/config');


// http://localhost:8000/api/v1/vehicles

router.route('/vehiclecategory')
        .get(getVehicleCategories)
        .post((req,res,next) => {
                uploadOptionsVehicleCategory.single('image')(req, res, function (err) {
                        if (err instanceof multer.MulterError) {
                        if(err.message === 'Unexpected field'){
                                return res.status(400).json({Success:false,Message:'more than 1 image is not allowed for Vehicle Category', responseCode : 400});
                        }
                        // A Multer error occurred when uploading
                        return res.status(500).json({Success:false,Message:err.message, responseCode : 500});
                        } else if (err) {
                          // An unknown error occurred when uploading.
                         return res.status(400).json({Success:false,Message:err.message, responseCode : 500});      
                        }else{
                         // Everything went fine.
<<<<<<< HEAD
                         next();
                        }
=======
                        next();
                        }
                       
>>>>>>> f116591b0f873ab5a5c383d06c308aa9c35635a2
                })
        }, vehicleCategoriesValidation, addVehicleCategories);

router.route('/vehiclecategory/:id')
        .get(getVehicleCategories)
        .put((req,res,next) => {
                uploadOptionsVehicleCategory.single('image')(req, res, function (err) {
                        if (err instanceof multer.MulterError) {
                        if(err.message === 'Unexpected field'){
                                return res.status(400).json({Success:false,Message:'more than 1 image is not allowed for Vehicle Category', responseCode : 400});
                        }
                        // A Multer error occurred when uploading
                        return res.status(500).json({Success:false,Message:err.message, responseCode : 500});
                        } else if (err) {
                          // An unknown error occurred when uploading.
                          return res.status(500).json({Success:false,Message:err.message, responseCode : 500});      
                        }else{
<<<<<<< HEAD
                          // Everything went fine.
                          next();
                   }
=======
                        // Everything went fine.
                        next();
                        }
>>>>>>> f116591b0f873ab5a5c383d06c308aa9c35635a2
                })
                    
        }, vehicleCategoriesValidation, addVehicleCategories)
        .delete(deleteVehicleCategories);

router.route(`/getnearbyvehicles`)
        .get(getNearByVehiclesValidation,
                advancedResults(Vehicle, 'vehicleCategory'),
                getNearByVehicles)

router.route(`/`) 
        .get(advancedResults(Vehicle, 'vehicleCategory'),getVehicles)
        .post((req,res,next) => {
                uploadOptionsVehicles.fields(
                        [
                            {
                                name:'images',
                                maxCount:10
                            },
                            {
                                name: 'vehiclePapers',
                                maxCount:10
                            },
                            {
                                name: 'vehicleInsurance',
                                maxCount:10
                            }
                        ]
                         )(req, res, function (err) {
                if (err instanceof multer.MulterError) {
                        if(err.message === 'Unexpected field'){
                                var code = err.code;
                               // if(code === 'LIMIT_UNEXPECTED_FILE')
                                //        return res.status(400).json({Success:false,Message:`Ashu saley tune image ghalat fieldName se bheji hai spelling check kr sahi se (images, vehiclePapers, vehicleInsurance) yeh teen hai`, responseCode : 400, errorCode : code});
                                return res.status(400).json({Success:false,Message:'more than 10 images for 1 field are not allowed for vehilces', responseCode : 400, errorCode : code});
                        }
                        // A Multer error occurred   when uploading
                        return res.status(500).json({Success:false,Message:err.message, responseCode : 500});
                } else if (err) {
                        // An unknown error occurred when uploading.
                        return res.status(400).json({Success:false,Message:err.message, responseCode : 400});      
                }
                // Everything went fine.
                next();
                })
        }
        , vehicleRegistrationValidation,addVehicle)

router.route(`/:id`)
        .get(getVehicleById)

 module.exports = router;