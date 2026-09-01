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
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-primary/10 rounded-xl text-primary border border-primary/20">
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <CardTitle className="text-xl font-bold flex items-center gap-2">
                Bunk Planner & Attendance Forecast
                <Badge variant="secondary" className="bg-primary/20 text-primary text-[10px] uppercase font-mono">Live Forecast</Badge>
              </CardTitle>
              <CardDescription>Simulate future attendance percentages before skipping or attending upcoming classes.</CardDescription>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={resetSimulation} className="text-xs gap-1.5">
            <RefreshCcw className="w-3.5 h-3.5" />
            Reset Plan
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2">
          {/* Controls Column */}
          <div className="space-y-4 bg-muted/30 p-5 rounded-2xl border border-border/50">
            <div>
              <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Select Course</Label>
              <Select value={selectedSubjectId} onValueChange={(val: string | null) => { if (val) setSelectedSubjectId(val); }}>
                <SelectTrigger className="mt-2 bg-card h-11 text-sm font-medium">
                  <SelectValue>
                    {selectedDisplayName}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent className="max-h-72">
                  {subjects.map(s => {
                    const displayName = `${s.subjectCode} — ${cleanSubjectName(s.subjectName)}`;
                    return (
                      <SelectItem key={s.id} value={s.id} className="text-sm py-2">
                        {displayName}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Minimum Target Goal</Label>
              <div className="grid grid-cols-4 gap-2 mt-2">
                {[75, 80, 85, 90].map(pct => (
                  <Button
                    key={pct}
                    type="button"
                    variant={targetPercentage === pct ? "default" : "outline"}
                    size="sm"
                    className="text-xs font-semibold"
                    onClick={() => setTargetPercentage(pct)}
                  >
                    {pct}%
                  </Button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-2">
              <div className="bg-emerald-500/5 p-3.5 rounded-xl border border-emerald-500/20">
                <Label className="text-xs font-bold text-emerald-600 dark:text-emerald-400 block mb-2">Planned ATTEND (Classes)</Label>
                <Input
                  type="number"
                  min={0}
                  placeholder="0"
                  value={plannedAttend === 0 ? "" : plannedAttend}
                  onChange={(e) => setPlannedAttend(e.target.value === "" ? 0 : Math.max(0, parseInt(e.target.value) || 0))}
                  className="bg-card font-mono text-center font-bold text-lg h-10"
                />
              </div>

              <div className="bg-red-500/5 p-3.5 rounded-xl border border-red-500/20">
                <Label className="text-xs font-bold text-red-500 block mb-2">Planned BUNK (Classes)</Label>
                <Input
                  type="number"
                  min={0}
                  placeholder="0"
                  value={plannedBunk === 0 ? "" : plannedBunk}
                  onChange={(e) => setPlannedBunk(e.target.value === "" ? 0 : Math.max(0, parseInt(e.target.value) || 0))}
                  className="bg-card font-mono text-center font-bold text-lg h-10"
                />
              </div>
            </div>
          </div>

          {/* Prediction Output Column */}
          <div className="space-y-4 flex flex-col justify-between bg-card p-5 rounded-2xl border border-primary/20 shadow-sm">
            <div>
              <div className="flex justify-between items-start mb-2 gap-2">
                <div>
                  <span className="text-xs text-muted-foreground font-mono font-semibold">{selectedSubject.subjectCode}</span>
                  <h4 className="font-semibold text-foreground text-base leading-tight mt-0.5">{cleanSubjectName(selectedSubject.subjectName)}</h4>
                </div>
                {simResult.status === 'SAFE' && <Badge className="bg-emerald-500/20 text-emerald-600 border-emerald-500/20 shrink-0">Safe Trajectory</Badge>}
                {simResult.status === 'WARNING' && <Badge variant="secondary" className="bg-yellow-500/20 text-yellow-600 border-yellow-500/20 shrink-0">Warning</Badge>}
                {simResult.status === 'CRITICAL' && <Badge variant="destructive" className="bg-red-500/20 text-red-600 border-red-500/20 shrink-0">Critical Risk</Badge>}
              </div>

              {/* Stat Comparison */}
              <div className="flex items-center justify-around py-4 border-y my-4">
                <div className="text-center">
                  <span className="text-xs text-muted-foreground block font-medium">Current Percentage</span>
                  <span className="text-2xl font-bold text-muted-foreground">
                    {selectedSubject.classesConducted > 0 
                      ? ((selectedSubject.classesAttended / selectedSubject.classesConducted) * 100).toFixed(1) 
                      : "100.0"}%
                  </span>
                  <span className="text-[11px] text-muted-foreground block font-mono mt-0.5">
                    {selectedSubject.classesAttended} / {selectedSubject.classesConducted} classes
                  </span>
                </div>

                <ArrowRight className="w-5 h-5 text-muted-foreground shrink-0" />

                <div className="text-center">
                  <span className="text-xs text-muted-foreground block font-semibold text-primary">Simulated Trajectory</span>
                  <div className="flex items-center justify-center gap-1.5">
                    <span className="text-3xl font-extrabold text-foreground">{simResult.simulatedPercentage}%</span>
                    {simResult.deltaPercentage > 0 && (
                      <span className="text-xs font-bold text-emerald-600 flex items-center">
                        <TrendingUp className="w-3.5 h-3.5 mr-0.5" /> +{simResult.deltaPercentage}%
                      </span>
                    )}
                    {simResult.deltaPercentage < 0 && (
                      <span className="text-xs font-bold text-red-500 flex items-center">
                        <TrendingDown className="w-3.5 h-3.5 mr-0.5" /> {simResult.deltaPercentage}%
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] text-muted-foreground block font-mono mt-0.5">
                    {simResult.simulatedAttended} / {simResult.simulatedConducted} classes
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
            <div className={`p-4 rounded-xl border text-xs leading-relaxed ${
              simResult.status === 'SAFE' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-300' :
              simResult.status === 'WARNING' ? 'bg-yellow-500/10 border-yellow-500/30 text-yellow-700 dark:text-yellow-300' :
              'bg-red-500/10 border-red-500/30 text-red-700 dark:text-red-300'
            }`}>
              <div className="flex items-start gap-2.5">
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
                      <strong>Safe Plan:</strong> With this simulation, your attendance will be <strong>{simResult.simulatedPercentage}%</strong> (above your {targetPercentage}% goal). You will still have <strong>{simResult.canBunkWithTarget}</strong> safe bunk(s) available.
                    </p>
                  ) : (
                    <p>
                      <strong>Risk Alert:</strong> Under this simulation, your attendance drops to <strong>{simResult.simulatedPercentage}%</strong> (below your {targetPercentage}% goal). You would need to attend the next <strong>{simResult.needToAttendWithTarget}</strong> consecutive classes to recover!
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
