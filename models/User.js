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
    },
    firebaseToken:{
        type : String,
        default : ''
    },
    isVerified:{
        type: Boolean,
        default:false
    },
    verificationID : {
    type: mongoose.Schema.ObjectId,
    ref: 'Verification',
    default : null
    },
    profilePicture:{
        type : String,
        default : null
    }

},{ timestamps: true })

exports.User = mongoose.model('User',userSchema);