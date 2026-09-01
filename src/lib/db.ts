import { PrismaClient } from '@prisma/client'
import fs from 'fs'
import path from 'path'

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

// Retrieves existing student profile with full attendance relations
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
