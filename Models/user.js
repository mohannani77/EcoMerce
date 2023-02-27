const mongoose =require('mongoose')
const Schema = mongoose.Schema;
let UserSchema=new Schema({
    name:{
        type:'string',
        required:true,
        minLength:3,
        maxLength:20
    },
    email:{
        type:'string',
        required:true,
        minLength:3,
        maxLength:20,
        unique:true
    },
    password:{
        type:'string',
        required:true,
        minLength:3,
        maxLength:1024
    },
    image:{type:Object},
    isAdmin:{type:Boolean,default:false}
},
{
    timestamps:true
})
module.exports=mongoose.model('User',UserSchema)