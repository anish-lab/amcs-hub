import { prisma, getOrCreateStudentProfile } from "@/lib/db";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import CAGradePredictor from "@/components/dashboard/CAGradePredictor";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Award } from "lucide-react";

export default async function CAPredictorPage() {
  const cookieStore = await cookies();
  const userRoll = cookieStore.get('user_roll')?.value;

  if (!userRoll) {
    redirect('/login');
  }

  const student = await getOrCreateStudentProfile(userRoll);

  if (!student) {
    redirect('/login');
  }

  const subjects = student.attendance.map(record => ({
    id: record.id,
    subjectCode: record.subjectOffering.subject.code,
    subjectName: record.subjectOffering.subject.name,
  }));

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">CA & End-Sem Grade Predictor</h2>
        <p className="text-muted-foreground mt-2">
          Calculate your Continuous Assessment (CA) scores and predict required End-Sem exam marks for {student.name} ({student.rollNo}).
        </p>
      </div>

      {subjects.length === 0 ? (
        <Card className="bg-muted/20 border-primary/20">
          <CardHeader className="text-center py-12">
            <Award className="w-12 h-12 mx-auto text-primary mb-4 opacity-50" />
            <CardTitle className="text-2xl">No Subjects Synced</CardTitle>
            <CardDescription className="max-w-md mx-auto mt-2">
              Sync your eCampus credentials to start predicting your End-Sem grade targets.
            </CardDescription>
            <div className="pt-4 flex justify-center">
              <Link href="/login">
                <Button>Sync Now</Button>
              </Link>
            </div>
          </CardHeader>
        </Card>
      ) : (
        <CAGradePredictor subjects={subjects} />
      )}
    </div>
  );
}
