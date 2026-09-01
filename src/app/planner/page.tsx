import { prisma, getStudentProfile } from "@/lib/db";
import { calculateAttendance } from "@/lib/attendance";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import AttendanceSimulator from "@/components/dashboard/AttendanceSimulator";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Calculator } from "lucide-react";

export default async function PlannerPage() {
  const cookieStore = await cookies();
  const userRoll = cookieStore.get('user_roll')?.value;

  if (!userRoll) {
    redirect('/login');
  }

  const student = await getStudentProfile(userRoll);

  if (!student) {
    redirect('/login');
  }

  const attendanceData = student.attendance.map(record => {
    const stats = calculateAttendance(record.classesConducted, record.classesAttended);
    return {
      ...record,
      stats,
      subjectName: record.subjectOffering.subject.name,
      subjectCode: record.subjectOffering.subject.code,
    };
  });

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Bunk Planner & Attendance Forecast</h2>
        <p className="text-muted-foreground mt-2">
          Forecast your attendance trajectory and plan future class bunks safely for {student.name} ({student.rollNo}).
        </p>
      </div>

      {attendanceData.length === 0 ? (
        <Card className="bg-muted/20 border-primary/20">
          <CardHeader className="text-center py-12">
            <Calculator className="w-12 h-12 mx-auto text-primary mb-4 opacity-50" />
            <CardTitle className="text-2xl">No Attendance Synced</CardTitle>
            <CardDescription className="max-w-md mx-auto mt-2">
              Sync your eCampus credentials to start simulating attendance scenarios.
            </CardDescription>
            <div className="pt-4 flex justify-center">
              <Link href="/login">
                <Button>Sync Now</Button>
              </Link>
            </div>
          </CardHeader>
        </Card>
      ) : (
        <AttendanceSimulator subjects={attendanceData} />
      )}
    </div>
  );
}
