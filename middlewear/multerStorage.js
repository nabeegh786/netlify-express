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
        createDir(directory+"public");
        createDir(directory+"public/images");
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
        var directory =  __dirname.replace("middlewear", "");
        var advanceDirectory = "public/images";
        let uploadError = new MulterError(`Invalid Image type in field = ${file.fieldname},filename = ${file.filename}, only .png, .jpg, .jpeg files are allowed..`);
        if(typeof(isValid) != 'undefined')
        {
            uploadError = null;
           
        }
        createDir(directory+"public");
        createDir(directory+advanceDirectory);

        if (file.fieldname === "images") {
            directory += advanceDirectory+"/vehicles";
            createDir(directory);
        } 
        else if (file.fieldname === "vehiclePapers") {
            directory += advanceDirectory+"/vehicle-papers";
            createDir(directory);
        }
        else if (file.fieldname === "vehicleInsurance") {
            directory += advanceDirectory+"/vehicle-insurance"; 
            createDir(directory);
        }else{
            uploadError = new MulterError(`(images, vehiclePapers, vehicleInsurance) field name not provided => ${file.fieldname} `);
        }
        cb(uploadError,directory)
     },
    filename: function(req,file, cb){
        const fileName = file.originalname.split('.').slice(0, -1).join('.').split(' ').join('-');
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const extension = file.mimetype.toLowerCase().split('/')[1];
        cb(null, `${fileName}-${uniqueSuffix}.${extension}`);
       
    }
})

const userVerificationStorage = multer.diskStorage({

    destination: function (req, file, cb){
        const isValid = FILE_TYPE_MAP[file.mimetype];
        
        let uploadError = new Error('Invalid Image type, only .png, .jpg, .jpeg files are allowed');
        var directory =  __dirname.replace("middlewear", "");
        var advanceDirectory = "public/images/verification";
        if(typeof(isValid) != 'undefined')
        {
            uploadError = null;
             
        }
        createDir(directory+"public");
        createDir(directory+"public/images");
        createDir(directory+advanceDirectory);


        if (file.fieldname === "cnicFront") {
            directory += advanceDirectory+"/cnicFront";
            createDir(directory);
        } 
        else if (file.fieldname === "cnicBack") {
            directory +=advanceDirectory+"/cnicBack";
            createDir(directory);
        } 
        else if (file.fieldname === "licenseFront") {
            directory +=advanceDirectory+"/licenseFront";
            createDir(directory);
        } 
        else if (file.fieldname === "licenseBack") {
            directory +=advanceDirectory+"/licenseBack";
            createDir(directory);
        } 
        else if (file.fieldname === "utilityBill") {
            directory +=advanceDirectory+"/utilityBill";
            createDir(directory);
        } 
        else if (file.fieldname === "image") {
            directory +=advanceDirectory+"/image";
            createDir(directory);
        } 
        cb(uploadError,directory);
    },
    filename: function(req,file, cb){
        const fileName = file.originalname.split('.').slice(0, -1).join('.').split(' ').join('-');
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const extension = file.mimetype.split('/')[1].toLowerCase();
        cb(null, `${fileName}-${uniqueSuffix}.${extension}`);
    }
})

const userProfileStorage = multer.diskStorage({

    destination: function (req, file, cb){
        const isValid = FILE_TYPE_MAP[file.mimetype];
        
        let uploadError = new Error('Invalid Image type, only .png, .jpg, .jpeg files are allowed');
        var directory =  __dirname.replace("middlewear", "");
        if(typeof(isValid) != 'undefined')
        {
            uploadError = null;
             
        }
        createDir(directory+"public");
        createDir(directory+"public/images");
        createDir(directory+"public/images/user-profile");
        cb(uploadError,directory+"public/images/user-profile");
    },
    filename: function(req,file, cb){
        const fileName = file.originalname.split('.').slice(0, -1).join('.').split(' ').join('-');
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const extension = file.mimetype.split('/')[1].toLowerCase();
        cb(null, `${fileName}-${uniqueSuffix}.${extension}`);
    }
})


module.exports = {
    vehiclesStorage,
    vehicleCategoryStorage,
    userVerificationStorage,
    userProfileStorage
};

