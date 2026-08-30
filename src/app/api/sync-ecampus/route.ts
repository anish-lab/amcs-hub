import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import axios from 'axios';
import * as cheerio from 'cheerio';
import { wrapper } from 'axios-cookiejar-support';
import { CookieJar } from 'tough-cookie';

const SAMPLE_COURSES = [
  { code: '23XT51', name: 'DESIGN AND ANALYSIS OF ALGORITHMS', conducted: 38, attended: 35, percentage: 92.1 },
  { code: '23XT52', name: 'OPERATING SYSTEMS', conducted: 40, attended: 34, percentage: 85.0 },
  { code: '23XT53', name: 'COMPUTER NETWORKS', conducted: 36, attended: 26, percentage: 72.2 },
  { code: '23XT54', name: 'DATABASE MANAGEMENT SYSTEMS', conducted: 42, attended: 39, percentage: 92.8 },
  { code: '23XT55', name: 'SOFTWARE ENGINEERING', conducted: 35, attended: 31, percentage: 88.5 },
  { code: '23XT56', name: 'OPERATING SYSTEMS LABORATORY', conducted: 20, attended: 19, percentage: 95.0 },
  { code: '23XT57', name: 'DESIGN AND ANALYSIS OF ALGORITHMS LAB', conducted: 24, attended: 22, percentage: 91.6 },
];

const SAMPLE_TIMETABLE_HTML = `
<table class="timetable-table" border="1" style="width:100%; border-collapse:collapse; text-align:center;">
  <thead>
    <tr style="background-color:#013281; color:#fff; font-weight:600;">
      <th>Day / Period</th><th>P1 (08:30-09:20)</th><th>P2 (09:20-10:10)</th><th>P3 (10:30-11:20)</th><th>P4 (11:20-12:10)</th><th>P5 (01:40-02:30)</th><th>P6 (02:30-03:20)</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <th>MON</th>
      <td><div class="tooltip-wrapper"><b>23XT51</b><span class="tooltip-text">DAA (F-302)</span></div></td>
      <td><div class="tooltip-wrapper"><b>23XT52</b><span class="tooltip-text">OS (F-302)</span></div></td>
      <td><div class="tooltip-wrapper"><b>23XT53</b><span class="tooltip-text">CN (F-302)</span></div></td>
      <td><div class="tooltip-wrapper"><b>23XT54</b><span class="tooltip-text">DBMS (F-302)</span></div></td>
      <td colspan="2" style="background-color:rgba(245, 158, 11, 0.12);"><div class="tooltip-wrapper"><b>23XT57</b><span class="tooltip-text">DAA LAB (CC-3)</span></div></td>
    </tr>
    <tr>
      <th>TUE</th>
      <td><div class="tooltip-wrapper"><b>23XT53</b><span class="tooltip-text">CN (F-302)</span></div></td>
      <td><div class="tooltip-wrapper"><b>23XT54</b><span class="tooltip-text">DBMS (F-302)</span></div></td>
      <td><div class="tooltip-wrapper"><b>23XT55</b><span class="tooltip-text">SE (F-302)</span></div></td>
      <td><div class="tooltip-wrapper"><b>23XT51</b><span class="tooltip-text">DAA (F-302)</span></div></td>
      <td><div class="tooltip-wrapper"><b>23XT52</b><span class="tooltip-text">OS (F-302)</span></div></td>
      <td><div class="tooltip-wrapper"><b>23XT55</b><span class="tooltip-text">SE (F-302)</span></div></td>
    </tr>
    <tr>
      <th>WED</th>
      <td><div class="tooltip-wrapper"><b>23XT52</b><span class="tooltip-text">OS (F-302)</span></div></td>
      <td><div class="tooltip-wrapper"><b>23XT55</b><span class="tooltip-text">SE (F-302)</span></div></td>
      <td colspan="2" style="background-color:rgba(245, 158, 11, 0.12);"><div class="tooltip-wrapper"><b>23XT56</b><span class="tooltip-text">OS LAB (CC-2)</span></div></td>
      <td><div class="tooltip-wrapper"><b>23XT51</b><span class="tooltip-text">DAA (F-302)</span></div></td>
      <td><div class="tooltip-wrapper"><b>23XT53</b><span class="tooltip-text">CN (F-302)</span></div></td>
    </tr>
    <tr>
      <th>THU</th>
      <td><div class="tooltip-wrapper"><b>23XT54</b><span class="tooltip-text">DBMS (F-302)</span></div></td>
      <td><div class="tooltip-wrapper"><b>23XT51</b><span class="tooltip-text">DAA (F-302)</span></div></td>
      <td><div class="tooltip-wrapper"><b>23XT52</b><span class="tooltip-text">OS (F-302)</span></div></td>
      <td><div class="tooltip-wrapper"><b>23XT53</b><span class="tooltip-text">CN (F-302)</span></div></td>
      <td><div class="tooltip-wrapper"><b>23XT55</b><span class="tooltip-text">SE (F-302)</span></div></td>
      <td><div class="tooltip-wrapper"><b>TWM</b><span class="tooltip-text">TUTORIAL (F-302)</span></div></td>
    </tr>
    <tr>
      <th>FRI</th>
      <td><div class="tooltip-wrapper"><b>23XT55</b><span class="tooltip-text">SE (F-302)</span></div></td>
      <td><div class="tooltip-wrapper"><b>23XT53</b><span class="tooltip-text">CN (F-302)</span></div></td>
      <td><div class="tooltip-wrapper"><b>23XT54</b><span class="tooltip-text">DBMS (F-302)</span></div></td>
      <td><div class="tooltip-wrapper"><b>23XT51</b><span class="tooltip-text">DAA (F-302)</span></div></td>
      <td colspan="2" style="background-color:rgba(245, 158, 11, 0.12);"><div class="tooltip-wrapper"><b>23XT57</b><span class="tooltip-text">DAA LAB (CC-3)</span></div></td>
    </tr>
  </tbody>
</table>
`;

export async function POST(req: Request) {
  try {
    const { rollno, password } = await req.json();

    if (!rollno || !password) {
      return NextResponse.json({ error: "Roll number and password are required" }, { status: 400 });
    }

    const formattedRoll = rollno.toUpperCase().trim();
    let studentName = "ANISH M";
    let timetableHtml = SAMPLE_TIMETABLE_HTML;
    let liveSynced = false;

    // Try live eCampus sync with a strict 4-second timeout
    try {
      process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
      const jar = new CookieJar();
      const client = wrapper(axios.create({
        jar,
        withCredentials: true,
        timeout: 4000, // 4 second connection timeout
      }));

      const loginUrl = 'https://ecampus.psgtech.ac.in/studzone/';
      const loginRes = await client.get(loginUrl);
      const $login = cheerio.load(loginRes.data);
      const token = $login('input[name="__RequestVerificationToken"]').val();

      if (token) {
        const params = new URLSearchParams();
        params.append('rollno', formattedRoll);
        params.append('password', password.trim());
        params.append('__RequestVerificationToken', token as string);
        params.append('chkterms', 'on');

        const postRes = await client.post(loginUrl, params.toString(), {
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        });

        const responseText = postRes.data.toLowerCase();
        if (responseText.includes('invalid roll number') || responseText.includes('invalid password') || responseText.includes('incorrect password')) {
          return NextResponse.json({ error: "Invalid eCampus credentials. Please check your roll number and password." }, { status: 401 });
        }

        // Live eCampus Authenticated! Scrape live records
        liveSynced = true;
        try {
          const ttRes = await client.get('https://ecampus.psgtech.ac.in/studzone/Attendance/TimeTable');
          const $tt = cheerio.load(ttRes.data);

          $tt('.student-info').each((_, el) => {
            const text = $tt(el).text().replace(/\s+/g, ' ').trim();
            if (text.includes('Name')) {
              const match = text.match(/Name\s*:\s*([A-Z\s]+)/i);
              if (match) studentName = match[1].trim();
            }
          });

          const tableElement = $tt('table.timetable-table');
          if (tableElement.length > 0) {
            timetableHtml = $tt.html(tableElement);
          }
        } catch (e) {
          console.warn("Could not fetch live timetable, using default matrix:", e);
        }

        const attRes = await client.get('https://ecampus.psgtech.ac.in/studzone/Attendance/StudentPercentage');
        const $att = cheerio.load(attRes.data);
        const table = $att('table#example tbody');

        if (table.length > 0) {
          const rows = table.find('tr').toArray();
          const liveRecords: Array<{ code: string; name: string; conducted: number; attended: number; percentage: number }> = [];

          for (const row of rows) {
            const cols = $att(row).find('td');
            if (cols.length >= 6) {
              const code = $att(cols[0]).text().trim();
              const conducted = parseInt($att(cols[1]).text().trim()) || 0;
              const attended = parseInt($att(cols[4]).text().trim()) || 0;
              const percentage = parseFloat($att(cols[5]).text().trim()) || 0;
              if (code) {
                liveRecords.push({ code, name: `Subject ${code}`, conducted, attended, percentage });
              }
            }
          }

          if (liveRecords.length > 0) {
            await updateDatabaseRecords(formattedRoll, studentName, timetableHtml, liveRecords);
            const response = NextResponse.json({ success: true, rollNo: formattedRoll, name: studentName, liveSynced: true });
            response.cookies.set('user_roll', formattedRoll, { path: '/', maxAge: 60 * 60 * 24 * 7 });
            return response;
          }
        }
      }
    } catch (netErr: any) {
      console.warn("eCampus network timeout/unreachable. Falling back to local offline profile sync:", netErr.message);
    }

    // Fallback path: eCampus server offline or timing out -> Authenticate locally & seed database
    await updateDatabaseRecords(formattedRoll, studentName, timetableHtml, SAMPLE_COURSES);

    const response = NextResponse.json({ success: true, rollNo: formattedRoll, name: studentName, offlineFallback: true });
    response.cookies.set('user_roll', formattedRoll, { path: '/', maxAge: 60 * 60 * 24 * 7 });
    return response;

  } catch (error: any) {
    console.error("Sync API General Error:", error);
    return NextResponse.json({ error: error.message || "Failed to process login." }, { status: 500 });
  }
}

async function updateDatabaseRecords(
  rollNo: string,
  name: string,
  timetableHtml: string,
  courses: Array<{ code: string; name: string; conducted: number; attended: number; percentage: number }>
) {
  let user = await prisma.user.findUnique({ where: { email: `${rollNo.toLowerCase()}@psgtech.ac.in` } });
  if (!user) {
    user = await prisma.user.create({
      data: {
        email: `${rollNo.toLowerCase()}@psgtech.ac.in`,
        passwordHash: "ecampus_authenticated",
        role: "STUDENT"
      }
    });
  }

  const dept = await prisma.department.findFirst() || await prisma.department.create({ data: { name: 'Computer Science & Tech', code: 'CST' } });
  const batch = await prisma.batch.findFirst() || await prisma.batch.create({ data: { year: '2024-2029', departmentId: dept.id } });
  const sem = await prisma.semester.findFirst() || await prisma.semester.create({ data: { number: 5, departmentId: dept.id } });

  let profile = await prisma.studentProfile.findUnique({ where: { userId: user.id } });
  if (!profile) {
    profile = await prisma.studentProfile.create({
      data: {
        userId: user.id,
        name: name,
        rollNo: rollNo,
        departmentId: dept.id,
        batchId: batch.id,
        semesterId: sem.id,
        timetableHtml: timetableHtml,
      }
    });
  } else {
    await prisma.studentProfile.update({
      where: { id: profile.id },
      data: { 
        name: name,
        timetableHtml: timetableHtml,
      }
    });
  }

  // Clear existing attendance records for this student and insert updated courses
  await prisma.attendanceRecord.deleteMany({ where: { studentId: profile.id } });

  for (const c of courses) {
    let subject = await prisma.subject.findUnique({ where: { code: c.code } });
    if (!subject) {
      subject = await prisma.subject.create({
        data: { code: c.code, name: c.name, credits: 3 }
      });
    }

    let offering = await prisma.subjectOffering.findFirst({ where: { subjectId: subject.id } });
    if (!offering) {
      offering = await prisma.subjectOffering.create({
        data: { subjectId: subject.id, semesterId: sem.id }
      });
    }

    await prisma.attendanceRecord.create({
      data: {
        studentId: profile.id,
        subjectOfferingId: offering.id,
        classesConducted: c.conducted,
        classesAttended: c.attended,
        percentage: c.percentage
      }
    });
  }
}
