import express, { json } from 'express';
import { connect } from 'mongoose';
import user from './Models/user.js';
import Attendance from './Models/Attendance.js';

const app = express();
app.use(json());

connect('mongodb+srv://abhijeetsinhpadhiyar18:pO9w4JJYcJWNbEZ0@cluster0.kxaak8a.mongodb.net/')


// POST API to load punch-in data
app.post('/load', async (req, res) => {
  try {
    const { employeeId, employeeName, punchTime, deviceId, punchDirection, status } = req.body;

    // Validate required fields
    if (!employeeId || !punchTime) {
      return res.status(400).json({ message: 'Employee ID and Punch Time are required' });
    }

 
    const newAttendance = new Attendance({
      employeeId,
      employeeName,
      punchTime: new Date(punchTime),
      deviceId,
      punchDirection,
      status,
    });


    await newAttendance.save();

    res.status(201).json({
      message: 'Attendance data inserted successfully',
      data: newAttendance,
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error inserting attendance data',
      error: error.message,
    });
  }
});

app.get('/api/attendance/:uid/:date', async (req, res) => {
  const { uid, date } = req.params;

  try {
    const targetDate = new Date(date);
    const nextDate = new Date(targetDate);
    nextDate.setDate(nextDate.getDate() + 1); 

    const attendance = await Attendance.find({
      employeeId: uid,
      punchTime: {
        $gte: targetDate,
        $lt: nextDate
      }
    });

    res.json({ uid, date, attendance });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch attendance for date', details: err.message });
  }
});


app.post('/api/user', async (req, res) => {
    try {
      const newUser = new user(req.body);
      const savedUser = await newUser.save();
      res.status(201).json({ message: 'User created', data: savedUser });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to create user', details: err.message });
    }
  });
  

  app.get('/api/user', async (req, res) => {
    try {
      const user = await user.find();
      res.json(user);
    } catch (err) {
      res.status(500).json({ error: 'Failed to fetch users' });
    }
  });
  

  app.get('/api/user/:uid', async (req, res) => {
    try {
      const user = await user.findOne({ uid: req.params.uid });
      if (!user) return res.status(404).json({ error: 'User not found' });
      res.json(user);
    } catch (err) {
      res.status(500).json({ error: 'Failed to fetch user' });
    }
  });

  app.get('/api/attendance-count/:uid', async (req, res) => {
    const { uid } = req.params; 
  
    if (!uid) {
      return res.status(400).json({ error: 'UID is required in URL' });
    }
  
    try {
      const presentCount = await Attendance.countDocuments({
        employeeId: uid,
        status: 'Present' 
      });
  
      res.json({ uid, presentCount });
    } catch (err) {
      res.status(500).json({ error: 'Failed to fetch attendance count' });
    }
  });

app.get('/api/salary/:uid', async (req, res) => {
  const { uid } = req.params;
  const salaryPerDay = 500;

  try {
    const result = await Attendance.aggregate([
      {
        $match: {
          employeeId: uid,
          status: { $in: ['Overtime On', 'Duty Off'] }
        }
      },
      {
        $addFields: {
          punchDate: {
            $dateToString: { format: '%Y-%m-%d', date: '$punchTime' }
          }
        }
      },
      {
        $group: {
          _id: '$punchDate',
          punchCount: { $sum: 1 }
        }
      },
      {
        $match: {
          punchCount: { $gte: 2 } // Only count dates with 2 or more punches
        }
      },
      {
        $count: 'presentDays'
      }
    ]);


    
    const presentDays = result[0]?.presentDays || 0;
    const salary = presentDays * salaryPerDay;

    res.json({ uid, presentDays, salary });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to calculate salary' });
  }
});


  
app.post('/api/attendance', async (req, res) => {
    try {
      const {
        employeeId,employeeName,punchTime,deviceId,punchDirection,status} = req.body;
  
     
      if (!employeeId || !punchTime || !punchDirection) {
        return res.status(400).json({ error: 'Required fields missing' });
      }
  
      const statusValue = status === 'Present' ? 1 : 0;

      const newAttendance = new Attendance({
        employeeId,employeeName,punchTime,deviceId,punchDirection,status,statusValue});
  
      await newAttendance.save();
  
      res.status(201).json({ message: 'Attendance recorded successfully', data: newAttendance });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to save attendance' });
    }
  });

app.listen(2500,()=>{
   console.log("server is running on port 2500");
});