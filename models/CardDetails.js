const mongoose = require('mongoose');


const CardDetailsSchema = mongoose.Schema({
    cardNo: {
        type: String,
        required: true
    },
    cvv:{
        type:String,
        required:true,
        max:4
    },
    cardHolderName:{
        type:String,
        required:true
    },
    expiry:{
        type:String,
        required:true
    },
   
},{ timestamps: true })

exports.CardDetails = mongoose.model('CardDetails',CardDetailsSchema);