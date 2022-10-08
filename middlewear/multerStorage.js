const multer = require('multer');
// include node fs module
var fs = require('fs');

const FILE_TYPE_MAP = {
    'image/png' : 'png',
    'image/jpeg' : 'jpeg',
    'image/jpg' : 'jpg'
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
        var directory =   __dirname.replace("middlewear", "");
        let uploadError = new Error('Invalid Image type, only .png, .jpg, .jpeg files are allowed..');
        if(typeof(isValid) != 'undefined')
        {
            uploadError = null;
           
        }
        cb(uploadError,directory+"public/images/vehicles")
    },
    filename: function(req,file, cb){
        const fileName = file.originalname.split('.').slice(0, -1).join('.').split(' ').join('-');
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const extension = file.mimetype.toLowerCase().split('/')[1];
        cb(null, `${fileName}-${uniqueSuffix}.${extension}`);
    }
})

const createDir = (path) =>{
    if(!fs.existsSync(path)){
        fs.mkdirSync(dir);
    }
}

module.exports = {
    vehiclesStorage,
    vehicleCategoryStorage
};