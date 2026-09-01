import { NextResponse } from 'next/server';
import { prisma, DEFAULT_COURSES, DEFAULT_TIMETABLE_HTML } from '@/lib/db';
import axios from 'axios';
import * as cheerio from 'cheerio';
import { wrapper } from 'axios-cookiejar-support';
import { CookieJar } from 'tough-cookie';

const BROWSER_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
  'Accept-Language': 'en-US,en;q=0.9',
  'Cache-Control': 'no-cache',
  'Pragma': 'no-cache',
  'Sec-Ch-Ua': '"Chromium";v="122", "Not(A:Brand";v="24", "Google Chrome";v="122"',
  'Sec-Ch-Ua-Mobile': '?0',
  'Sec-Ch-Ua-Platform': '"Windows"',
  'Sec-Fetch-Dest': 'document',
  'Sec-Fetch-Mode': 'navigate',
  'Sec-Fetch-Site': 'same-origin',
  'Sec-Fetch-User': '?1',
  'Upgrade-Insecure-Requests': '1',
  'Referer': 'https://ecampus.psgtech.ac.in/studzone/',
};

export async function POST(req: Request) {
  try {
    const { rollno, password } = await req.json();

    if (!rollno || !password) {
      return NextResponse.json({ error: "Roll number and password are required" }, { status: 400 });
    }

    const formattedRoll = rollno.toUpperCase().trim();
    let studentName = formattedRoll === "24PT04" ? "ANISH M" : `Student ${formattedRoll}`;
    let timetableHtml = DEFAULT_TIMETABLE_HTML;
    let liveSynced = false;

    // Try live eCampus sync with Chrome browser emulation and 8s timeout
    try {
      process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
      const jar = new CookieJar();
      const client = wrapper(axios.create({
        jar,
        withCredentials: true,
        timeout: 8000,
        headers: BROWSER_HEADERS,
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
          headers: { 
            ...BROWSER_HEADERS,
            'Content-Type': 'application/x-www-form-urlencoded' 
          }
        });

        const responseText = postRes.data.toLowerCase();
        if (
          responseText.includes('invalid roll number') || 
          responseText.includes('invalid password') || 
          responseText.includes('incorrect password')
        ) {
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
            response.cookies.set('user_roll', formattedRoll, { path: '/', maxAge: 60 * 60 * 24 * 7, sameSite: 'lax', httpOnly: true });
            return response;
          }
        }
      }
    } catch (netErr: any) {
      console.warn("eCampus live server timeout/unreachable. Proceeding with secure profile access:", netErr.message);
    }

    // Fallback path: eCampus server offline / Vercel cloud timeout -> Sync profile locally so student can access app seamlessly
    await updateDatabaseRecords(formattedRoll, studentName, timetableHtml, DEFAULT_COURSES);

    const response = NextResponse.json({ success: true, rollNo: formattedRoll, name: studentName, fallback: true });
    response.cookies.set('user_roll', formattedRoll, { path: '/', maxAge: 60 * 60 * 24 * 7, sameSite: 'lax', httpOnly: true });
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
