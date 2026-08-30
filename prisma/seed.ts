import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')

  // Clean up
  await prisma.attendanceRecord.deleteMany()
  await prisma.subjectOffering.deleteMany()
  await prisma.subject.deleteMany()
  await prisma.studentProfile.deleteMany()
  await prisma.user.deleteMany()
  await prisma.semester.deleteMany()
  await prisma.batch.deleteMany()
  await prisma.department.deleteMany()

  // 1. Department
  const cse = await prisma.department.create({
    data: {
      name: 'Computer Science and Engineering',
      code: 'CSE',
    },
  })

  // 2. Batch & Semester
  const batch2021 = await prisma.batch.create({
    data: {
      year: '2021-2025',
      departmentId: cse.id,
    },
  })

  const sem6 = await prisma.semester.create({
    data: {
      number: 6,
      departmentId: cse.id,
    },
  })

  // 3. User & Profile
  const user = await prisma.user.create({
    data: {
      email: 'student@psgtech.ac.in',
      passwordHash: 'hashed_password_mock',
      role: 'STUDENT',
    },
  })

  const student = await prisma.studentProfile.create({
    data: {
      userId: user.id,
      name: 'Anish Muthuvel',
      rollNo: '21Z200',
      registerNo: '715521104000',
      departmentId: cse.id,
      batchId: batch2021.id,
      semesterId: sem6.id,
      academicYear: '2023-2024',
    },
  })

  // 4. Subjects & Offerings
  const subjects = [
    { code: '21CS601', name: 'Compiler Design', credits: 4, faculty: 'Dr. A' },
    { code: '21CS602', name: 'Machine Learning', credits: 3, faculty: 'Prof. B' },
    { code: '21CS603', name: 'Web Technology', credits: 3, faculty: 'Dr. C' },
    { code: '21CS604', name: 'Cloud Computing', credits: 3, faculty: 'Prof. D' },
  ]

  for (const s of subjects) {
    const subj = await prisma.subject.create({
      data: {
        code: s.code,
        name: s.name,
        credits: s.credits,
      },
    })

    const offering = await prisma.subjectOffering.create({
      data: {
        subjectId: subj.id,
        semesterId: sem6.id,
        facultyName: s.faculty,
      },
    })

    // Create realistic mock attendance records
    let conducted = 40;
    let attended = 40;
    
    if (s.name === 'Compiler Design') attended = 38; // 95%
    if (s.name === 'Machine Learning') attended = 30; // 75%
    if (s.name === 'Web Technology') { conducted = 45; attended = 29; } // ~64% - Critical
    if (s.name === 'Cloud Computing') attended = 32; // 80%

    await prisma.attendanceRecord.create({
      data: {
        studentId: student.id,
        subjectOfferingId: offering.id,
        classesConducted: conducted,
        classesAttended: attended,
        percentage: Number(((attended / conducted) * 100).toFixed(2)),
      },
    })
  }

  console.log('Database seeded successfully!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
