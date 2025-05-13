import { Schema, model } from 'mongoose';

const userSchema = new Schema({
    uid:{type:String,unique:true,required:true},
    address:String,
    dob:Date,
    name:String,
    phone:String,
    role:String,
    rollno:String

});

export default model('user',userSchema);