const mongoose = require('mongoose');


const userSchema = mongoose.Schema({
    username:{
        type:String,
        required:true,
        unique:true,
        trim : true
    },
    passwordHash:{
        type : String,
        required : true
    },
    email:{
        type:String,
        required : true,
        trim:true,
        max:20
    },
    phone:{
        type:String,
        required:true,
        max:11
    },
    isRenter:{
        type:Boolean,
        default:false
    },
    role:{
        type:String,
        default:'user',
        max:5
    }
},{ timestamps: true })

exports.User = mongoose.model('User',userSchema);