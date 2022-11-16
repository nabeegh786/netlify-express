const mongoose = require('mongoose');


const OtpSchema = mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique : true
    },
    otp:{
        type:String,
        required:true
    }
   
},{ timestamps: true })

exports.Otp = mongoose.model('Otp',OtpSchema);