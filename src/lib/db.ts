import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

// Retrieves student profile with attendance relations from PostgreSQL
export async function getStudentProfile(rollNo: string) {
  const formattedRoll = rollNo.toUpperCase().trim();

  return await prisma.studentProfile.findUnique({
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
}
