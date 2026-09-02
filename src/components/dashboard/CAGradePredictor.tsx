"use client"

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Award, ArrowRight, AlertTriangle, CheckCircle, Info, RefreshCcw } from "lucide-react";
import { calculatePSGTechGradePrediction } from "@/lib/ca-calculator";

interface SubjectItem {
  id: string;
  subjectCode: string;
  subjectName: string;
}

export default function CAGradePredictor({ subjects }: { subjects: SubjectItem[] }) {
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>(subjects[0]?.id || "");
  const [ca1, setCa1] = useState<number>(30); // out of 40
  const [ca2, setCa2] = useState<number>(32); // out of 40
  const [tutorial1, setTutorial1] = useState<number>(5); // out of 6
  const [tutorial2, setTutorial2] = useState<number>(5); // out of 6
  const [assignment, setAssignment] = useState<number>(6); // out of 8
  const [targetGrade, setTargetGrade] = useState<'10' | '9' | '8' | '7' | '6' | '5'>('10');

  const selectedSubject = subjects.find(s => s.id === selectedSubjectId) || subjects[0];

  if (!selectedSubject) return null;

  const result = calculatePSGTechGradePrediction({
    ca1,
    ca2,
    tutorial1,
    tutorial2,
    assignment,
    targetGrade
  });

  const cleanSubjectName = (name: string) => {
    return name.replace(/^Subject\s+/, '').replace(/\s+/g, ' ').trim();
  };

  const selectedDisplayName = selectedSubject 
    ? `${selectedSubject.subjectCode} — ${cleanSubjectName(selectedSubject.subjectName)}`
    : "Choose course";

  const gradeOptions: Array<{ id: '10' | '9' | '8' | '7' | '6' | '5'; label: string; sub: string }> = [
    { id: '10', label: '10', sub: '91+' },
    { id: '9', label: '9', sub: '81+' },
    { id: '8', label: '8', sub: '70+' },
    { id: '7', label: '7', sub: '60+' },
    { id: '6', label: '6', sub: '55+' },
    { id: '5', label: '5', sub: '50+' },
  ];

  return (
    <Card className="border-primary/20 bg-gradient-to-br from-card via-card to-primary/5 shadow-md">
      <CardHeader className="p-4 md:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-xl text-primary border border-primary/20 shrink-0">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <CardTitle className="text-lg md:text-xl font-bold flex flex-wrap items-center gap-2">
                CA & End-Sem Grade Predictor
                <Badge variant="secondary" className="bg-primary/20 text-primary text-[10px] uppercase font-mono">PSG Tech Formula</Badge>
              </CardTitle>
              <CardDescription className="text-xs md:text-sm mt-0.5">Calculate exact Continuous Assessment (CA) internals & predict required End-Sem exam marks.</CardDescription>
            </div>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => { setCa1(30); setCa2(32); setTutorial1(5); setTutorial2(5); setAssignment(6); setTargetGrade('10'); }}
            className="text-xs gap-1.5 self-start sm:self-auto shrink-0"
          >
            <RefreshCcw className="w-3.5 h-3.5" />
            Reset Inputs
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-4 md:p-6 space-y-5">
        <div className="grid gap-5 md:grid-cols-2">
          {/* Inputs Column */}
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
              <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Desired Target Grade</Label>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5 md:gap-2 mt-1.5">
                {gradeOptions.map(g => (
                  <Button
                    key={g.id}
                    type="button"
                    variant={targetGrade === g.id ? "default" : "outline"}
                    size="sm"
                    className="flex flex-col h-11 py-1 px-1"
                    onClick={() => setTargetGrade(g.id)}
                  >
                    <span className="text-xs font-bold leading-tight">Grade {g.label}</span>
                    <span className="text-[10px] opacity-75 font-mono">{g.sub}</span>
                  </Button>
                ))}
              </div>
            </div>

            {/* Test Inputs */}
            <div className="grid grid-cols-2 gap-3 pt-1">
              <div>
                <Label className="text-[11px] md:text-xs font-medium block mb-1">CA 1 Marks (out of 40)</Label>
                <Input
                  type="number"
                  min={0}
                  max={40}
                  placeholder="0"
                  value={ca1 === 0 ? "" : ca1}
                  onChange={(e) => setCa1(e.target.value === "" ? 0 : Math.min(40, Math.max(0, parseInt(e.target.value) || 0)))}
                  className="bg-card font-mono text-center font-bold text-base md:text-lg h-10"
                />
              </div>

              <div>
                <Label className="text-[11px] md:text-xs font-medium block mb-1">CA 2 Marks (out of 40)</Label>
                <Input
                  type="number"
                  min={0}
                  max={40}
                  placeholder="0"
                  value={ca2 === 0 ? "" : ca2}
                  onChange={(e) => setCa2(e.target.value === "" ? 0 : Math.min(40, Math.max(0, parseInt(e.target.value) || 0)))}
                  className="bg-card font-mono text-center font-bold text-base md:text-lg h-10"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2.5">
              <div>
                <Label className="text-[10px] md:text-xs font-medium block mb-1 truncate">Tut 1 (/6)</Label>
                <Input
                  type="number"
                  min={0}
                  max={6}
                  placeholder="0"
                  value={tutorial1 === 0 ? "" : tutorial1}
                  onChange={(e) => setTutorial1(e.target.value === "" ? 0 : Math.min(6, Math.max(0, parseInt(e.target.value) || 0)))}
                  className="bg-card font-mono text-center font-bold text-base md:text-lg h-10"
                />
              </div>

              <div>
                <Label className="text-[10px] md:text-xs font-medium block mb-1 truncate">Tut 2 (/6)</Label>
                <Input
                  type="number"
                  min={0}
                  max={6}
                  placeholder="0"
                  value={tutorial2 === 0 ? "" : tutorial2}
                  onChange={(e) => setTutorial2(e.target.value === "" ? 0 : Math.min(6, Math.max(0, parseInt(e.target.value) || 0)))}
                  className="bg-card font-mono text-center font-bold text-base md:text-lg h-10"
                />
              </div>

              <div>
                <Label className="text-[10px] md:text-xs font-medium block mb-1 truncate">Assg (/8)</Label>
                <Input
                  type="number"
                  min={0}
                  max={8}
                  placeholder="0"
                  value={assignment === 0 ? "" : assignment}
                  onChange={(e) => setAssignment(e.target.value === "" ? 0 : Math.min(8, Math.max(0, parseInt(e.target.value) || 0)))}
                  className="bg-card font-mono text-center font-bold text-base md:text-lg h-10"
                />
              </div>
            </div>
          </div>

          {/* Results Column */}
          <div className="space-y-4 flex flex-col justify-between bg-card p-4 md:p-5 rounded-2xl border border-primary/20 shadow-xs">
            <div>
              <div className="flex justify-between items-start mb-2 gap-2">
                <div>
                  <span className="text-[11px] text-muted-foreground font-mono font-semibold">{selectedSubject.subjectCode}</span>
                  <h4 className="font-semibold text-foreground text-sm md:text-base leading-tight mt-0.5">{cleanSubjectName(selectedSubject.subjectName)}</h4>
                </div>
                {result.status === 'EASY' && <Badge className="bg-emerald-500/20 text-emerald-600 border-emerald-500/20 shrink-0 text-[10px]">Easy Target</Badge>}
                {result.status === 'ACHIEVABLE' && <Badge className="bg-blue-500/20 text-blue-600 border-blue-500/20 shrink-0 text-[10px]">Achievable</Badge>}
                {result.status === 'CHALLENGING' && <Badge variant="secondary" className="bg-yellow-500/20 text-yellow-600 border-yellow-500/20 shrink-0 text-[10px]">High Target</Badge>}
                {result.status === 'IMPOSSIBLE' && <Badge variant="destructive" className="bg-red-500/20 text-red-600 border-red-500/20 shrink-0 text-[10px]">Impossible</Badge>}
              </div>

              {/* Internal Calculation Breakdown */}
              <div className="bg-muted/40 p-3 rounded-xl space-y-1.5 text-xs font-mono my-3 border border-border/50">
                <div className="flex justify-between text-muted-foreground">
                  <span>CA Avg (/40):</span>
                  <span className="font-bold text-foreground">{result.caAvg40} / 40</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>CA Converted (/30):</span>
                  <span className="font-bold text-foreground">{result.caConverted30} / 30</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Total Internal (/50):</span>
                  <span className="font-bold text-foreground">{result.totalInternal50} / 50</span>
                </div>
                <div className="flex justify-between text-primary font-semibold pt-1 border-t">
                  <span>Final Internal (/40):</span>
                  <span className="font-bold text-sm md:text-base">{result.finalInternal40} / 40</span>
                </div>
              </div>

              {/* Stat Comparison */}
              <div className="flex items-center justify-between py-3 border-y my-3 gap-2">
                <div className="text-center flex-1">
                  <span className="text-[11px] text-muted-foreground block font-medium">Final Internal</span>
                  <span className="text-xl md:text-2xl font-extrabold text-primary">
                    {result.finalInternal40} <span className="text-[10px] text-muted-foreground font-normal">/ 40</span>
                  </span>
                </div>

                <ArrowRight className="w-4 h-4 text-muted-foreground shrink-0" />

                <div className="text-center flex-1">
                  <span className="text-[11px] text-muted-foreground block font-semibold">End-Sem Needed</span>
                  <span className={`text-xl md:text-2xl font-extrabold ${result.status === 'IMPOSSIBLE' ? 'text-red-500' : 'text-foreground'}`}>
                    {result.requiredEndSem100} <span className="text-[10px] text-muted-foreground font-normal">/ 100</span>
                  </span>
                  <span className="text-[10px] text-muted-foreground block font-mono mt-0.5">
                    (Target: Grade {targetGrade} = {result.targetMinTotal}+)
                  </span>
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between text-[11px] font-semibold">
                  <span className="text-muted-foreground">Internal Weightage Contribution</span>
                  <span className="font-mono text-foreground">{((result.finalInternal40 / 40) * 100).toFixed(0)}% of Max 40</span>
                </div>
                <Progress value={(result.finalInternal40 / 40) * 100} className="h-2 bg-primary/20" />
              </div>
            </div>

            {/* Smart Insight Box */}
            <div className={`p-3.5 rounded-xl border text-xs leading-relaxed ${
              result.status === 'EASY' || result.status === 'ACHIEVABLE' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-300' :
              result.status === 'CHALLENGING' ? 'bg-yellow-500/10 border-yellow-500/30 text-yellow-700 dark:text-yellow-300' :
              'bg-red-500/10 border-red-500/30 text-red-700 dark:text-red-300'
            }`}>
              <div className="flex items-start gap-2">
                {result.status === 'EASY' || result.status === 'ACHIEVABLE' ? (
                  <CheckCircle className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                ) : result.status === 'CHALLENGING' ? (
                  <Info className="w-4 h-4 text-yellow-500 mt-0.5 shrink-0" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
                )}
                <div>
                  <p className="font-medium">{result.statusMessage}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
