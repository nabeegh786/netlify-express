const mongoose = require('mongoose');


const TransactionSchema = mongoose.Schema({
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
    }
   
},{ timestamps: true })

exports.Transaction = mongoose.model('Transaction',TransactionSchema);