const multer = require('multer');

// include node fs module
var fs = require('fs');

const { MulterError } = require('multer');

const FILE_TYPE_MAP = {
    'image/png' : 'png',
    'image/jpeg' : 'jpeg',
    'image/jpg' : 'jpg'
}

var createDir = function(path){
    if(!fs.existsSync(path)){
        fs.mkdirSync(path);
    }
}

const vehicleCategoryStorage = multer.diskStorage({

    destination: function (req, file, cb){
        const isValid = FILE_TYPE_MAP[file.mimetype];
        
        let uploadError = new Error('Invalid Image type, only .png, .jpg, .jpeg files are allowed');
        var directory =  __dirname.replace("middlewear", "");
        if(typeof(isValid) != 'undefined')
        {
            uploadError = null;
             
        }
        createDir(directory+"public/images/vehicle-category");
        cb(uploadError,directory+"public/images/vehicle-category");
    },
    filename: function(req,file, cb){
        const fileName = file.originalname.split('.').slice(0, -1).join('.').split(' ').join('-');
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const extension = file.mimetype.split('/')[1].toLowerCase();
        cb(null, `${fileName}-${uniqueSuffix}.${extension}`);
    }
})

const vehiclesStorage = multer.diskStorage({
    
    destination: function (req, file, cb){
        const isValid = FILE_TYPE_MAP[file.mimetype];
        var directory =  "";
        let uploadError = new MulterError(`Invalid Image type in field = ${file.fieldname},filename = ${file.filename}, only .png, .jpg, .jpeg files are allowed..`);
        if(typeof(isValid) != 'undefined')
        {
            uploadError = null;
           
        }
        if (file.fieldname === "images") {
            directory = __dirname.replace("middlewear", "")+"public/images/vehicles";
            createDir(directory);
        } 
        else if (file.fieldname === "vehiclePapers") {
            directory = __dirname.replace("middlewear", "")+"public/images/vehicle-papers";
            createDir(directory);
        }
        else if (file.fieldname === "vehicleInsurance") {
            directory = __dirname.replace("middlewear", "")+"public/images/vehicle-insurance";
            createDir(directory);
        }else{
            uploadError = new MulterError(`Ashu saley tune image ghalat fieldName se bheji hai spelling check kr sahi se (images, vehiclePapers, vehicleInsurance) yeh teen hai aur tune => ${file.fieldname} yeh bheji hai`);
        }
        cb(uploadError,directory)
     },
    filename: function(req,file, cb){
        const fileName = file.originalname.split('.').slice(0, -1).join('.').split(' ').join('-');
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const extension = file.mimetype.toLowerCase().split('/')[1];
        cb(null, `${fileName}-${uniqueSuffix}.${extension}`);
        // cb(null, `${fileName}-${uniqueSuffix}.jpg`);
    }
})



module.exports = {
    vehiclesStorage,
    vehicleCategoryStorage
};