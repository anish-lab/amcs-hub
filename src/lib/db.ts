import { PrismaClient } from '@prisma/client';
import { cache } from 'react';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

// Cached query function to eliminate duplicate database round-trips per request
export const getStudentProfile = cache(async (rollNo: string) => {
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
});
