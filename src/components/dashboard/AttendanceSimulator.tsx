"use client"

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Calculator, ArrowRight, AlertTriangle, CheckCircle, Info, TrendingUp, TrendingDown, RefreshCcw } from "lucide-react";
import { simulateAttendance } from "@/lib/attendance";

interface SubjectItem {
  id: string;
  subjectCode: string;
  subjectName: string;
  classesConducted: number;
  classesAttended: number;
}

export default function AttendanceSimulator({ subjects }: { subjects: SubjectItem[] }) {
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>(subjects[0]?.id || "");
  const [targetPercentage, setTargetPercentage] = useState<number>(75);
  const [plannedAttend, setPlannedAttend] = useState<number>(0);
  const [plannedBunk, setPlannedBunk] = useState<number>(0);

  const selectedSubject = subjects.find(s => s.id === selectedSubjectId) || subjects[0];

  if (!selectedSubject) return null;

  const simResult = simulateAttendance(
    selectedSubject.classesConducted,
    selectedSubject.classesAttended,
    plannedAttend,
    plannedBunk,
    targetPercentage
  );

  const resetSimulation = () => {
    setPlannedAttend(0);
    setPlannedBunk(0);
  };

  const cleanSubjectName = (name: string) => {
    return name.replace(/^Subject\s+/, '').replace(/\s+/g, ' ').trim();
  };

  const selectedDisplayName = selectedSubject 
    ? `${selectedSubject.subjectCode} — ${cleanSubjectName(selectedSubject.subjectName)}`
    : "Choose course";

  return (
    <Card className="border-primary/20 bg-gradient-to-br from-card via-card to-primary/5 shadow-md">
      <CardHeader className="p-4 md:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-xl text-primary border border-primary/20 shrink-0">
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <CardTitle className="text-lg md:text-xl font-bold flex flex-wrap items-center gap-2">
                Bunk Planner & Attendance Forecast
                <Badge variant="secondary" className="bg-primary/20 text-primary text-[10px] uppercase font-mono">Live Forecast</Badge>
              </CardTitle>
              <CardDescription className="text-xs md:text-sm mt-0.5">Simulate future attendance percentages before skipping or attending upcoming classes.</CardDescription>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={resetSimulation} className="text-xs gap-1.5 self-start sm:self-auto shrink-0">
            <RefreshCcw className="w-3.5 h-3.5" />
            Reset Plan
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-4 md:p-6 space-y-5">
        <div className="grid gap-5 md:grid-cols-2">
          {/* Controls Column */}
          <div className="space-y-4 bg-muted/30 p-4 md:p-5 rounded-2xl border border-border/50">
            <div>
              <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Select Course</Label>
              <Select value={selectedSubjectId} onValueChange={(val: string | null) => { if (val) setSelectedSubjectId(val); }}>
                <SelectTrigger className="mt-1.5 bg-card h-10 md:h-11 text-xs md:text-sm font-medium w-full">
                  <SelectValue>
                    {selectedDisplayName}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent className="max-h-72 w-[calc(100vw-3rem)] sm:w-auto">
                  {subjects.map(s => {
                    const displayName = `${s.subjectCode} — ${cleanSubjectName(s.subjectName)}`;
                    return (
                      <SelectItem key={s.id} value={s.id} className="text-xs md:text-sm py-2">
                        {displayName}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Minimum Target Goal</Label>
              <div className="grid grid-cols-4 gap-1.5 md:gap-2 mt-1.5">
                {[75, 80, 85, 90].map(pct => (
                  <Button
                    key={pct}
                    type="button"
                    variant={targetPercentage === pct ? "default" : "outline"}
                    size="sm"
                    className="text-xs font-semibold h-9 px-1"
                    onClick={() => setTargetPercentage(pct)}
                  >
                    {pct}%
                  </Button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-1">
              <div className="bg-emerald-500/5 p-3 rounded-xl border border-emerald-500/20">
                <Label className="text-[11px] md:text-xs font-bold text-emerald-600 dark:text-emerald-400 block mb-1.5">Planned ATTEND</Label>
                <Input
                  type="number"
                  min={0}
                  placeholder="0"
                  value={plannedAttend === 0 ? "" : plannedAttend}
                  onChange={(e) => setPlannedAttend(e.target.value === "" ? 0 : Math.max(0, parseInt(e.target.value) || 0))}
                  className="bg-card font-mono text-center font-bold text-base md:text-lg h-10"
                />
              </div>

              <div className="bg-red-500/5 p-3 rounded-xl border border-red-500/20">
                <Label className="text-[11px] md:text-xs font-bold text-red-500 block mb-1.5">Planned BUNK</Label>
                <Input
                  type="number"
                  min={0}
                  placeholder="0"
                  value={plannedBunk === 0 ? "" : plannedBunk}
                  onChange={(e) => setPlannedBunk(e.target.value === "" ? 0 : Math.max(0, parseInt(e.target.value) || 0))}
                  className="bg-card font-mono text-center font-bold text-base md:text-lg h-10"
                />
              </div>
            </div>
          </div>

          {/* Prediction Output Column */}
          <div className="space-y-4 flex flex-col justify-between bg-card p-4 md:p-5 rounded-2xl border border-primary/20 shadow-xs">
            <div>
              <div className="flex justify-between items-start mb-2 gap-2">
                <div>
                  <span className="text-[11px] text-muted-foreground font-mono font-semibold">{selectedSubject.subjectCode}</span>
                  <h4 className="font-semibold text-foreground text-sm md:text-base leading-tight mt-0.5">{cleanSubjectName(selectedSubject.subjectName)}</h4>
                </div>
                {simResult.status === 'SAFE' && <Badge className="bg-emerald-500/20 text-emerald-600 border-emerald-500/20 shrink-0 text-[10px]">Safe Trajectory</Badge>}
                {simResult.status === 'WARNING' && <Badge variant="secondary" className="bg-yellow-500/20 text-yellow-600 border-yellow-500/20 shrink-0 text-[10px]">Warning</Badge>}
                {simResult.status === 'CRITICAL' && <Badge variant="destructive" className="bg-red-500/20 text-red-600 border-red-500/20 shrink-0 text-[10px]">Critical Risk</Badge>}
              </div>

              {/* Stat Comparison */}
              <div className="flex items-center justify-between py-3 border-y my-3 gap-2">
                <div className="text-center flex-1">
                  <span className="text-[11px] text-muted-foreground block font-medium">Current</span>
                  <span className="text-xl md:text-2xl font-bold text-muted-foreground">
                    {selectedSubject.classesConducted > 0 
                      ? ((selectedSubject.classesAttended / selectedSubject.classesConducted) * 100).toFixed(1) 
                      : "100.0"}%
                  </span>
                  <span className="text-[10px] text-muted-foreground block font-mono mt-0.5">
                    {selectedSubject.classesAttended} / {selectedSubject.classesConducted}
                  </span>
                </div>

                <ArrowRight className="w-4 h-4 text-muted-foreground shrink-0" />

                <div className="text-center flex-1">
                  <span className="text-[11px] text-muted-foreground block font-semibold text-primary">Simulated</span>
                  <div className="flex items-center justify-center gap-1">
                    <span className="text-2xl md:text-3xl font-extrabold text-foreground">{simResult.simulatedPercentage}%</span>
                    {simResult.deltaPercentage > 0 && (
                      <span className="text-[10px] font-bold text-emerald-600 flex items-center">
                        +{simResult.deltaPercentage}%
                      </span>
                    )}
                    {simResult.deltaPercentage < 0 && (
                      <span className="text-[10px] font-bold text-red-500 flex items-center">
                        {simResult.deltaPercentage}%
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] text-muted-foreground block font-mono mt-0.5">
                    {simResult.simulatedAttended} / {simResult.simulatedConducted}
                  </span>
                </div>
              </div>

              <Progress
                value={simResult.simulatedPercentage}
                className={`h-2.5 ${
                  simResult.status === 'SAFE' ? 'bg-emerald-500/20 [&>div]:bg-emerald-500' :
                  simResult.status === 'WARNING' ? 'bg-yellow-500/20 [&>div]:bg-yellow-500' :
                  'bg-red-500/20 [&>div]:bg-red-500'
                }`}
              />
            </div>

            {/* Smart Prediction Insight Box */}
            <div className={`p-3.5 rounded-xl border text-xs leading-relaxed ${
              simResult.status === 'SAFE' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-300' :
              simResult.status === 'WARNING' ? 'bg-yellow-500/10 border-yellow-500/30 text-yellow-700 dark:text-yellow-300' :
              'bg-red-500/10 border-red-500/30 text-red-700 dark:text-red-300'
            }`}>
              <div className="flex items-start gap-2">
                {simResult.status === 'SAFE' ? (
                  <CheckCircle className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                ) : simResult.status === 'WARNING' ? (
                  <Info className="w-4 h-4 text-yellow-500 mt-0.5 shrink-0" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
                )}
                <div>
                  {simResult.simulatedPercentage >= targetPercentage ? (
                    <p>
                      <strong>Safe Plan:</strong> Attendance will be <strong>{simResult.simulatedPercentage}%</strong> (&gt;{targetPercentage}%). You have <strong>{simResult.canBunkWithTarget}</strong> safe bunk(s) available.
                    </p>
                  ) : (
                    <p>
                      <strong>Risk Alert:</strong> Attendance drops to <strong>{simResult.simulatedPercentage}%</strong> (&lt;{targetPercentage}%). You need <strong>{simResult.needToAttendWithTarget}</strong> consecutive classes to recover.
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
