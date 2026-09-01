import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Clock, RefreshCw, MoveHorizontal } from "lucide-react"
import { prisma, getOrCreateStudentProfile } from "@/lib/db"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default async function TimetablePage() {
  const cookieStore = await cookies()
  const userRoll = cookieStore.get('user_roll')?.value

  if (!userRoll) {
    redirect('/login')
  }

  const student = await getOrCreateStudentProfile(userRoll)

  if (!student) {
    redirect('/login')
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Time Table</h2>
          <p className="text-xs md:text-sm text-muted-foreground mt-1">
            Class schedule for {student.name} ({student.rollNo})
          </p>
        </div>
        <Link href="/login">
          <Button variant="default" size="sm" className="shadow-sm w-full md:w-auto">
            <RefreshCw className="w-4 h-4 mr-2" />
            Re-sync eCampus
          </Button>
        </Link>
      </div>

      {!student.timetableHtml ? (
        <Card className="bg-muted/20 border-primary/20">
          <CardHeader className="text-center py-12">
            <Clock className="w-12 h-12 mx-auto text-primary mb-4 opacity-50" />
            <CardTitle className="text-xl md:text-2xl">No Timetable Synced</CardTitle>
            <CardDescription className="max-w-md mx-auto mt-2 text-xs md:text-sm">
              Please sync your eCampus credentials to view your live weekly timetable schedule.
            </CardDescription>
            <div className="pt-4 flex justify-center">
              <Link href="/login">
                <Button>Sync Now</Button>
              </Link>
            </div>
          </CardHeader>
        </Card>
      ) : (
        <div className="space-y-2">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground md:hidden">
            <MoveHorizontal className="w-3.5 h-3.5" />
            <span>Swipe horizontally to view full timetable</span>
          </div>

          <Card className="overflow-hidden border shadow-xs">
            <CardContent className="p-2 md:p-4 overflow-x-auto">
              <style>{`
                .timetable-table {
                  width: 100%;
                  min-width: 650px;
                  border-collapse: collapse;
                  text-align: center;
                  font-size: 0.8125rem;
                }
                .timetable-table th, .timetable-table td {
                  border: 1px solid var(--border, #e5e7eb);
                  padding: 8px 10px;
                  vertical-align: middle;
                }
                .timetable-table thead tr:first-child th {
                  background-color: #013281;
                  color: #ffffff;
                  font-weight: 600;
                }
                .timetable-table thead tr:nth-child(2) td, .timetable-table thead tr:nth-child(2) th {
                  background-color: rgba(1, 50, 129, 0.08);
                  font-family: monospace;
                  font-size: 0.7rem;
                }
                .timetable-table tbody th {
                  background-color: rgba(0, 0, 0, 0.04);
                  font-weight: 700;
                  text-align: left;
                  padding-left: 10px;
                  min-width: 90px;
                }
                .timetable-table td[colspan="2"], .timetable-table td[colspan="3"] {
                  background-color: rgba(245, 158, 11, 0.12);
                  border-color: rgba(245, 158, 11, 0.3);
                  font-weight: 500;
                }
                .tooltip-wrapper b {
                  color: #013281;
                  display: block;
                  font-size: 0.8rem;
                  margin: 2px 0;
                }
                .tooltip-text {
                  display: block;
                  font-size: 0.7rem;
                  opacity: 0.9;
                  line-height: 1.2;
                }
              `}</style>
              <div dangerouslySetInnerHTML={{ __html: student.timetableHtml }} />
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
