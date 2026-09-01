import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import axios, { AxiosError } from 'axios';
import * as cheerio from 'cheerio';
import { wrapper } from 'axios-cookiejar-support';
import { CookieJar } from 'tough-cookie';
import { HttpsProxyAgent } from 'https-proxy-agent';

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
      return NextResponse.json({ error: "Roll number and password are required." }, { status: 400 });
    }

    const formattedRoll = rollno.toUpperCase().trim();

    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
    const jar = new CookieJar();

    // Configure optional proxy agent if PROXY_URL or HTTP_PROXY is defined
    const proxyUrl = process.env.PROXY_URL || process.env.HTTP_PROXY || process.env.HTTPS_PROXY;
    const httpsAgent = proxyUrl ? new HttpsProxyAgent(proxyUrl) : undefined;

    const client = wrapper(axios.create({
      jar,
      withCredentials: true,
      timeout: 15000,
      headers: BROWSER_HEADERS,
      httpsAgent,
    }));

    // 1. Fetch Login Page for CSRF Token
    const loginUrl = 'https://ecampus.psgtech.ac.in/studzone/';
    let loginRes;
    try {
      loginRes = await client.get(loginUrl);
    } catch (err: any) {
      const axiosErr = err as AxiosError;
      if (axiosErr.response?.status === 403) {
        return NextResponse.json({ 
          error: "eCampus Firewall Error (403 Forbidden): Access blocked. Please check Proxy configuration." 
        }, { status: 403 });
      }
      if (axiosErr.code === 'ETIMEDOUT' || axiosErr.code === 'ECONNABORTED') {
        return NextResponse.json({ 
          error: "eCampus Network Timeout (ETIMEDOUT): Unable to establish connection to college servers." 
        }, { status: 504 });
      }
      return NextResponse.json({ 
        error: `eCampus Connection Failed: ${axiosErr.message || "Network unreachable"}` 
      }, { status: 502 });
    }

    const $login = cheerio.load(loginRes.data);
    const token = $login('input[name="__RequestVerificationToken"]').val();

    if (!token) {
      return NextResponse.json({ error: "Failed to connect to eCampus portal. Verification token missing." }, { status: 502 });
    }

    // 2. Perform Login POST with token & ToughCookie session state
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

    // 3. Fetch Timetable page using serialized CookieJar session state
    let studentName = "Student";
    let timetableHtml = "";
    const subjectMap: Record<string, string> = {};

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

      if (!studentName || studentName === "Student") {
        const h2Name = $tt('h2.profile-name').text().trim();
        if (h2Name) studentName = h2Name;
      }

      const tableElement = $tt('table.timetable-table');
      if (tableElement.length > 0) {
        timetableHtml = $tt.html(tableElement);

        const rows = tableElement.find('tr').toArray();
        rows.slice(2).forEach((rEl) => {
          const tds = $tt(rEl).find('td').toArray();
          tds.forEach((cEl) => {
            const text = $tt(cEl).text().replace(/\s+/g, ' ').trim();
            if (text && text !== '-') {
              const parts = text.split(' ');
              const codeIdx = parts.findIndex(p => /^[0-9]{2}[A-Z]{2,4}[0-9A-Z]{1,3}$/.test(p) || p === 'TWM' || p === 'SMR');
              if (codeIdx !== -1) {
                const code = parts[codeIdx];
                const fullName = parts.slice(codeIdx + 1).join(' ');
                if (fullName) subjectMap[code] = fullName;
              }
            }
          });
        });
      }
    } catch (e) {
      console.warn("Could not fetch timetable page:", e);
    }

    if (studentName.includes("ANISH MANISH")) {
      studentName = "ANISH M";
    }

    // 4. Fetch Live Attendance Records
    const attRes = await client.get('https://ecampus.psgtech.ac.in/studzone/Attendance/StudentPercentage');
    const $att = cheerio.load(attRes.data);
    const table = $att('table#example tbody');

    if (table.length === 0) {
      return NextResponse.json({ error: "Successfully authenticated, but live attendance records could not be parsed." }, { status: 500 });
    }

    const liveRecords: Array<{ code: string; name: string; conducted: number; attended: number; percentage: number }> = [];

    const rows = table.find('tr').toArray();
    for (const row of rows) {
      const cols = $att(row).find('td');
      if (cols.length >= 6) {
        const code = $att(cols[0]).text().trim();
        const conducted = parseInt($att(cols[1]).text().trim()) || 0;
        const attended = parseInt($att(cols[4]).text().trim()) || 0;
        const percentage = parseFloat($att(cols[5]).text().trim()) || 0;

        if (code) {
          const fullName = subjectMap[code] || `Subject ${code}`;
          liveRecords.push({
            code,
            name: fullName,
            conducted,
            attended,
            percentage
          });
        }
      }
    }

    if (liveRecords.length === 0) {
      return NextResponse.json({ error: "No active attendance records found on eCampus for this account." }, { status: 404 });
    }

    // Persist records into PostgreSQL Database
    let user = await prisma.user.findUnique({ where: { email: `${formattedRoll.toLowerCase()}@psgtech.ac.in` } });
    if (!user) {
      user = await prisma.user.create({
        data: {
          email: `${formattedRoll.toLowerCase()}@psgtech.ac.in`,
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
          name: studentName,
          rollNo: formattedRoll,
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
          name: studentName,
          timetableHtml: timetableHtml,
        }
      });
    }

    await prisma.attendanceRecord.deleteMany({ where: { studentId: profile.id } });

    for (const c of liveRecords) {
      let subject = await prisma.subject.findUnique({ where: { code: c.code } });
      if (!subject) {
        subject = await prisma.subject.create({
          data: { code: c.code, name: c.name, credits: 3 }
        });
      } else if (c.name && c.name !== `Subject ${c.code}`) {
        await prisma.subject.update({
          where: { id: subject.id },
          data: { name: c.name }
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

    const response = NextResponse.json({ success: true, rollNo: formattedRoll, name: studentName });
    response.cookies.set('user_roll', formattedRoll, { 
      path: '/', 
      maxAge: 60 * 60 * 24 * 7, 
      sameSite: 'lax', 
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production'
    });
    return response;

  } catch (error: any) {
    console.error("Sync API Error:", error.message || error);
    return NextResponse.json({ error: error.message || "Failed to sync live data from eCampus." }, { status: 500 });
  }
}
