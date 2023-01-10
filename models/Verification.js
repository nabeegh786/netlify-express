const { string } = require('i/lib/util');
const mongoose = require('mongoose');


const verificationSchema = mongoose.Schema({
    cnicFront:{
        type:String,
        required:true
    },
    cnicBack:{
        type : String,
        required : true
    },
    licenseFront:{
        type:String,
        required : true
    },
    licenseBack:{
        type:String,
        required:true
    },
    utilityBill:{
        type:String,
        required:true
    },
    image:{
        type:String,
        required:true
    },
    cnicNo:{
        type:string,
        required:true
    }

},{ timestamps: true })

exports.Verification = mongoose.model('Verification',verificationSchema);