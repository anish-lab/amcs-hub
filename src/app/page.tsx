import { prisma, getOrCreateStudentProfile } from "@/lib/db";
import { calculateAttendance } from "@/lib/attendance";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, CheckCircle, Info, Calendar, RefreshCw, Calculator, UserCheck } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const userRoll = cookieStore.get('user_roll')?.value;

  if (!userRoll) {
    redirect('/login');
  }

  const student = await getOrCreateStudentProfile(userRoll);

  if (!student) {
    redirect('/login');
  }

  const attendanceData = student.attendance.map(record => {
    const stats = calculateAttendance(record.classesConducted, record.classesAttended);
    return {
      ...record,
      stats,
      subjectName: record.subjectOffering.subject.name.replace(/^Subject\s+/, '').replace(/\s+/g, ' ').trim(),
      subjectCode: record.subjectOffering.subject.code,
    };
  });

  const totalConducted = attendanceData.reduce((acc, curr) => acc + curr.classesConducted, 0);
  const totalAttended = attendanceData.reduce((acc, curr) => acc + curr.classesAttended, 0);
  const overallStats = calculateAttendance(totalConducted, totalAttended);

  const displayName = student.name.includes("ANISH MANISH") ? "ANISH M" : student.name.replace(/\s+/g, ' ').trim();

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Enterprise Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-border/60">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-2xl font-bold tracking-tight text-foreground">{displayName}</h2>
            <Badge variant="outline" className="text-[11px] font-mono font-medium px-2 py-0.5 border-border/80 text-muted-foreground bg-card">
              {student.rollNo}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-1">Live eCampus Academic Attendance Dashboard</p>
        </div>
        <div className="flex items-center gap-2.5">
          <Link href="/planner">
            <Button variant="outline" size="sm" className="h-9 text-xs font-medium border-border/80 shadow-xs">
              <Calculator className="w-3.5 h-3.5 mr-1.5 text-blue-500" />
              Bunk Planner
            </Button>
          </Link>
          <Link href="/login">
            <Button size="sm" className="h-9 text-xs font-medium bg-blue-600 hover:bg-blue-700 text-white shadow-xs">
              <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
              Re-sync
            </Button>
          </Link>
        </div>
      </div>

      {attendanceData.length === 0 ? (
        <Card className="border border-border/60 bg-card">
          <CardHeader className="text-center py-10">
            <CardTitle className="text-lg text-foreground font-semibold">No Attendance Synced</CardTitle>
            <CardDescription className="text-xs mt-1">
              No active attendance records found for {student.rollNo}. Click below to sync.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center pb-6">
            <Link href="/login">
              <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">Sync Now</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Executive Overview Cards */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card className="border border-border/60 bg-card shadow-xs">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Overall Attendance</CardTitle>
                <Calendar className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-extrabold text-foreground">{overallStats.percentage}%</div>
                <Progress value={overallStats.percentage} className="mt-3 h-2 bg-blue-500/15" />
                <p className="text-xs text-muted-foreground mt-2.5 font-mono">
                  {totalAttended} / {totalConducted} total classes
                </p>
              </CardContent>
            </Card>

            <Card className="border border-border/60 bg-card shadow-xs">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Course Health</CardTitle>
                <UserCheck className="h-4 w-4 text-emerald-500" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-extrabold text-emerald-500">
                  {attendanceData.filter(d => d.stats.status === 'SAFE').length} / {attendanceData.length}
                </div>
                <p className="text-xs text-muted-foreground mt-3">
                  subjects above 75% threshold
                </p>
              </CardContent>
            </Card>

            <Card className="border border-border/60 bg-card shadow-xs">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Action Needed</CardTitle>
                <AlertTriangle className={`h-4 w-4 ${attendanceData.filter(d => d.stats.status === 'CRITICAL').length > 0 ? 'text-red-500' : 'text-muted-foreground'}`} />
              </CardHeader>
              <CardContent>
                <div className={`text-3xl font-extrabold ${attendanceData.filter(d => d.stats.status === 'CRITICAL').length > 0 ? 'text-red-500' : 'text-foreground'}`}>
                  {attendanceData.filter(d => d.stats.status === 'CRITICAL').length}
                </div>
                <p className="text-xs text-muted-foreground mt-3">
                  subjects below 75% target
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Subject Cards Section */}
          <div className="space-y-4 pt-2">
            <h3 className="text-base font-bold tracking-tight text-foreground">Subject Attendance Breakdown</h3>
            
            <div className="grid gap-4 md:grid-cols-2">
              {attendanceData.map((data) => (
                <Card key={data.id} className="border border-border/60 bg-card shadow-xs hover:border-border transition-colors">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start gap-3">
                      <div>
                        <span className="text-[11px] font-mono font-semibold text-muted-foreground">{data.subjectCode}</span>
                        <CardTitle className="text-sm font-semibold leading-snug text-foreground mt-0.5">{data.subjectName}</CardTitle>
                      </div>
                      {data.stats.status === 'SAFE' && <Badge className="bg-emerald-500/15 text-emerald-600 border-emerald-500/30 text-[10px] font-medium shrink-0">Safe</Badge>}
                      {data.stats.status === 'WARNING' && <Badge variant="secondary" className="bg-yellow-500/15 text-yellow-600 border-yellow-500/30 text-[10px] font-medium shrink-0">Warning</Badge>}
                      {data.stats.status === 'CRITICAL' && <Badge variant="destructive" className="bg-red-500/15 text-red-600 border-red-500/30 text-[10px] font-medium shrink-0">Critical</Badge>}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between items-baseline">
                      <span className="text-2xl font-bold text-foreground">{data.stats.percentage}%</span>
                      <span className="text-xs text-muted-foreground font-mono">{data.classesAttended} / {data.classesConducted} classes</span>
                    </div>

                    <Progress 
                      value={data.stats.percentage} 
                      className={`h-2 ${
                        data.stats.status === 'SAFE' ? 'bg-emerald-500/15 [&>div]:bg-emerald-500' : 
                        data.stats.status === 'WARNING' ? 'bg-yellow-500/15 [&>div]:bg-yellow-500' : 
                        'bg-red-500/15 [&>div]:bg-red-500'
                      }`} 
                    />
                    
                    <div className="bg-muted/40 p-3 rounded-lg border border-border/50 text-xs">
                      <div className="flex items-start gap-2.5">
                        {data.stats.status === 'SAFE' ? (
                          <>
                            <CheckCircle className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                            <div>
                              <span className="font-medium text-foreground block">Bunk Allowance</span>
                              <span className="text-muted-foreground">
                                You can safely bunk <strong className="text-foreground font-semibold">{data.stats.canBunk}</strong> more {data.stats.canBunk === 1 ? 'class' : 'classes'} and maintain &gt;75%.
                              </span>
                            </div>
                          </>
                        ) : (
                          <>
                            <Info className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
                            <div>
                              <span className="font-medium text-foreground block">Recovery Needed</span>
                              <span className="text-muted-foreground">
                                You must attend the next <strong className="text-foreground font-semibold">{data.stats.needToAttend}</strong> consecutive {data.stats.needToAttend === 1 ? 'class' : 'classes'} to reach 75%.
                              </span>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
