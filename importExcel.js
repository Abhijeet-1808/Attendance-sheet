import { connect } from 'mongoose';
import { readFile, utils } from 'xlsx';
import Attendance from './Models/Attendance';
import moment from 'moment';

connect('mongodb+srv://abhijeetsinhpadhiyar18:pO9w4JJYcJWNbEZ0@cluster0.kxaak8a.mongodb.net/');

async function importExcelData(){
    try{
        const workbook = readFile('./excel.xlsx');
        const sheetName = workbook.SheetNames[0];
        const sheetData = utils.sheet_to_json(workbook.Sheets[sheetName]);

        if (!sheetData || sheetData.length === 0) {
            console.error('No data found in the sheet');
            return;
        }

        for(let row of sheetData){

                const employeeName = row['EmployeeName\ndev'];
                const punchTimeRaw = row['PunchTime\n11-04-2025 18:20:00'];
                const deviceID = row['DevicelD\n1'];
                const punchDirection = row['PunchDirection\nIn'];
                const status = row['Status\nOvertime On'];
                const employeeID = row['1']; // This looks like the ID column

                if (!employeeName || !employeeID || !punchTimeRaw || !deviceID || !punchDirection || !status) {
                    console.error('Missing required fields in row:', row);
                    continue;
                }

            const punchTime = moment("1899-12-30").add(punchTimeRaw, 'days').toDate();

     
    const attendance = new Attendance({
        employeeId: employeeID.toString(),
        employeeName: employeeName,
        punchTime: punchTime,
        deviceId: deviceID.toString(),
        punchDirection: punchDirection,
        status: status,
    });

            await new Promise(resolve=>setTimeout(resolve,8000));

            await attendance.save();
        }

    }
    catch(err){
        console.error('error importing data:',err);
    }
}

importExcelData();
