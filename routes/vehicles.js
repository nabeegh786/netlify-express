const express = require('express');
const router = express.Router();

const { vehiclesStorage,
        vehicleCategoryStorage,
        vehiclesPapersStorage,
        vehiclesInsuranceStorage } = require('../middlewear/multerStorage')
        
const multer = require('multer');

const { vehicleRegistrationValidation,
        getNearByVehiclesValidation, 
        vehicleCategoriesValidation } = require('../middlewear/validator')
        
const { getVehicleCategories, 
        addVehicleCategories , 
        deleteVehicleCategories } = require('../controllers/vehicleCategoryController');

const uploadOptionsVehicles = multer({storage: vehiclesStorage});
const uploadOptionsVehicleCategory = multer({storage: vehicleCategoryStorage});

const uploadOptionsVehiclesPapers = multer({storage: vehiclesStorage});
const uploadOptionsVehiclesInsurance = multer({storage: vehicleCategoryStorage});


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
                        }
                        // Everything went fine.
                        next();
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
                        }
                        // Everything went fine.
                        next();
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
                uploadOptionsVehicles.array('images',10)(req, res, function (err) {
                if (err instanceof multer.MulterError) {
                        if(err.message === 'Unexpected field'){
                                var code = err.code;
                                return res.status(400).json({Success:false,Message:'more than 10 vehicle images are not allowed', responseCode : 400, errorCode : code});
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
               
        // },
        // (req,res,next) => {
        //         uploadOptionsVehiclesPapers.array('images',2)(req, res, function (err) {
        //         if (err instanceof multer.MulterError) {
        //                 if(err.message === 'Unexpected field'){
        //                         return res.status(400).json({Success:false,Message:'more than 2 vehicle paper images are not allowed', responseCode : 400});
        //                 }
        //                 // A Multer error occurred   when uploading
        //                 return res.status(500).json({Success:false,Message:err.message, responseCode : 500});
        //         } else if (err) {
        //                 // An unknown error occurred when uploading.
        //                 return res.status(400).json({Success:false,Message:err.message, responseCode : 400});      
        //         }
        //         // Everything went fine.
        //         next();
        //         })
               
        // },
        // (req,res,next) => {
        //         uploadOptionsVehiclesInsurance.array('images',2)(req, res, function (err) {
        //         if (err instanceof multer.MulterError) {
        //                 if(err.message === 'Unexpected field'){
        //                         return res.status(400).json({Success:false,Message:'more than 2 vehicle insurance images are not allowed', responseCode : 400});
        //                 }
        //                 // A Multer error occurred   when uploading
        //                 return res.status(500).json({Success:false,Message:err.message, responseCode : 500});
        //         } else if (err) {
        //                 // An unknown error occurred when uploading.
        //                 return res.status(400).json({Success:false,Message:err.message, responseCode : 400});      
        //         }
        //         // Everything went fine.
        //         next();
        //         })
               
        // }
        }
        ,vehicleRegistrationValidation,addVehicle)

router.route(`/:id`)
        .get(getVehicleById)

 module.exports = router;