const mongoose = require('mongoose');


const vehicleCategorySchema = mongoose.Schema({
   vehicleType:{
        type:String,
         required:true
     },
    image:{
        type:String,
        required:true
    }
},{ timestamps: true })

exports.VehicleCategory = mongoose.model('VehicleCategory',vehicleCategorySchema);