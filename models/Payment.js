const mongoose = require('mongoose');


const PaymentSchema = mongoose.Schema({
    cardDetailsId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'CardDetails',
        required: true
    },
    transactionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Transaction',
        required: true,
        unique : true
    },
    bookingId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Booking',
        required: true,
        unique : true
    }
   
},{ timestamps: true })

exports.Payment = mongoose.model('Payment',PaymentSchema);