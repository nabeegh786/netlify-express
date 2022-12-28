const mongoose = require('mongoose');


const WalletSchema = mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique : true
    },
    balance:{
        type:Number,
        required:true,
        default:0
    }
   
},{ timestamps: true })

exports.Wallet = mongoose.model('Wallet',WalletSchema);