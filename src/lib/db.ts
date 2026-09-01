import { PrismaClient } from '@prisma/client'
import fs from 'fs'
import path from 'path'

export const SAMPLE_COURSES = [
  { code: '23XT51', name: 'DESIGN AND ANALYSIS OF ALGORITHMS', conducted: 38, attended: 35, percentage: 92.1 },
  { code: '23XT52', name: 'OPERATING SYSTEMS', conducted: 40, attended: 34, percentage: 85.0 },
  { code: '23XT53', name: 'COMPUTER NETWORKS', conducted: 36, attended: 26, percentage: 72.2 },
  { code: '23XT54', name: 'DATABASE MANAGEMENT SYSTEMS', conducted: 42, attended: 39, percentage: 92.8 },
  { code: '23XT55', name: 'SOFTWARE ENGINEERING', conducted: 35, attended: 31, percentage: 88.5 },
  { code: '23XT56', name: 'OPERATING SYSTEMS LABORATORY', conducted: 20, attended: 19, percentage: 95.0 },
  { code: '23XT57', name: 'DESIGN AND ANALYSIS OF ALGORITHMS LAB', conducted: 24, attended: 22, percentage: 91.6 },
];

export const SAMPLE_TIMETABLE_HTML = `
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

function getDatabaseUrl(): string {
  if (process.env.DATABASE_URL && !process.env.DATABASE_URL.includes('./dev.db')) {
    return process.env.DATABASE_URL;
  }

  if (process.env.VERCEL || process.env.NODE_ENV === 'production') {
    const tmpDbPath = path.join('/tmp', 'dev.db');
    const localDbPath = path.join(process.cwd(), 'prisma', 'dev.db');

    if (!fs.existsSync(tmpDbPath)) {
      try {
        if (fs.existsSync(localDbPath)) {
          fs.copyFileSync(localDbPath, tmpDbPath);
        } else {
          fs.writeFileSync(tmpDbPath, '');
        }
      } catch (e) {
        console.error("Failed to prepare Vercel tmp database:", e);
      }
    }
    return `file:${tmpDbPath}`;
  }

  return 'file:./dev.db';
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasources: {
      db: {
        url: getDatabaseUrl(),
      },
    },
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

// Guarantees student profile availability across Vercel serverless lambdas
export async function getOrCreateStudentProfile(rollNo: string) {
  const formattedRoll = rollNo.toUpperCase().trim();

  let student = await prisma.studentProfile.findUnique({
    where: { rollNo: formattedRoll },
    include: {
      attendance: {
        include: {
          subjectOffering: {
            include: {
              subject: true
            }
          }
        }
      }
    }
  });

  if (!student) {
    try {
      const name = formattedRoll === "24PT04" ? "ANISH M" : `Student ${formattedRoll}`;
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

      let dept = await prisma.department.findFirst() || await prisma.department.create({ data: { name: 'Computer Science & Tech', code: 'CST' } });
      let batch = await prisma.batch.findFirst() || await prisma.batch.create({ data: { year: '2024-2029', departmentId: dept.id } });
      let sem = await prisma.semester.findFirst() || await prisma.semester.create({ data: { number: 5, departmentId: dept.id } });

      const newProfile = await prisma.studentProfile.create({
        data: {
          userId: user.id,
          name: name,
          rollNo: formattedRoll,
          departmentId: dept.id,
          batchId: batch.id,
          semesterId: sem.id,
          timetableHtml: SAMPLE_TIMETABLE_HTML,
        }
      });

      for (const c of SAMPLE_COURSES) {
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
            studentId: newProfile.id,
            subjectOfferingId: offering.id,
            classesConducted: c.conducted,
            classesAttended: c.attended,
            percentage: c.percentage
          }
        });
      }

      student = await prisma.studentProfile.findUnique({
        where: { rollNo: formattedRoll },
        include: {
          attendance: {
            include: {
              subjectOffering: {
                include: {
                  subject: true
                }
              }
            }
          }
        }
      });
    } catch (e) {
      console.error("Error auto-seeding student profile:", e);
    }
  }

  return student;
}
