import { Schema, model } from 'mongoose';

const attendanceSchema = new Schema({
    employeeId:{type:String,required:true},
    employeeName:String,
    punchTime:{type:Date,required:true},
    deviceId:String,
    punchDirection:String,
    status:String
});

const Attendance = model('Attendance',attendanceSchema);

export default Attendance;