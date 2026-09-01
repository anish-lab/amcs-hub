process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
const axios = require('axios');
const cheerio = require('cheerio');
const { wrapper } = require('axios-cookiejar-support');
const { CookieJar } = require('tough-cookie');
const fs = require('fs');

const jar = new CookieJar();
const client = wrapper(axios.create({ 
  jar, 
  withCredentials: true
}));

async function run() {
  try {
    const loginUrl = 'https://ecampus.psgtech.ac.in/studzone/';
    console.log('Fetching login page...');
    const loginRes = await client.get(loginUrl);
    
    const $login = cheerio.load(loginRes.data);
    const token = $login('input[name="__RequestVerificationToken"]').val();
    
    console.log('Attempting login...');
    const params = new URLSearchParams();
    params.append('rollno', '24PT04');
    params.append('password', 'anishmuthu');
    params.append('__RequestVerificationToken', token);
    params.append('chkterms', 'on');
    
    const postRes = await client.post(loginUrl, params.toString(), {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });
    
    console.log('Fetching attendance...');
    const attRes = await client.get('https://ecampus.psgtech.ac.in/studzone/Attendance/StudentPercentage');
    fs.writeFileSync('attendance_dump.html', attRes.data);
    
    console.log('Fetching timetable...');
    const ttRes = await client.get('https://ecampus.psgtech.ac.in/studzone/Attendance/TimeTable');
    fs.writeFileSync('timetable_dump.html', ttRes.data);

    console.log('Fetching GPA...');
    const gpaRes = await client.get('https://ecampus.psgtech.ac.in/studzone2/FrmEpsStudResult.aspx');
    fs.writeFileSync('gpa_dump.html', gpaRes.data);

    console.log('Done!');
  } catch (e) {
    console.error('Error:', e.message);
  }
}
run();
