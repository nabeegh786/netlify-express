const mongoose = require('mongoose');


const vehicleCategorySchema = mongoose.Schema({
    brand:{
        type:String,
        required:true
    },
    model:{
        type:String,
        required:true,
        unique:true
    },
    year:{
        type:String,
        required:true
    },
    image:{
        type:String,
        required:true
    }
},{ timestamps: true })

exports.VehicleCategory = mongoose.model('VehicleCategory',vehicleCategorySchema);