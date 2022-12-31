const mongoose = require('mongoose');


const PaymentSchema = mongoose.Schema({
    cardDetailsId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'CardDetails',
        required: true
    },
    bookingId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Booking',
        required: true,
    },
    completed: {
        type: Boolean,
        default : false
    },
    fromUser: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    toUser: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    amount:{
        type:Number,
        required:true,
        min:0
    },
    transactionDate:{
        type:Date,
        required:true
    },
    serviceCharges:{
        type:Number,
        required:true,
        min:0
    }
   
},{ timestamps: true })

exports.Payment = mongoose.model('Payment',PaymentSchema);