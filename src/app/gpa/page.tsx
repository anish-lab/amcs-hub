"use client"
import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { GraduationCap, Plus, Calculator, Trash2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function GPACalculatorPage() {
  const [subjects, setSubjects] = useState([{ id: 1, name: "", credits: "3", grade: "O" }])

  const addSubject = () => {
    setSubjects([...subjects, { id: Date.now(), name: "", credits: "3", grade: "O" }])
  }

  const removeSubject = (id: number) => {
    setSubjects(subjects.filter(s => s.id !== id))
  }

  const updateSubject = (id: number, field: string, value: string) => {
    setSubjects(subjects.map(s => s.id === id ? { ...s, [field]: value } : s))
  }

  const gradePoints: Record<string, number> = {
    "O": 10, "A+": 9, "A": 8, "B+": 7, "B": 6, "C": 5, "U": 0
  }

  const calculateGPA = () => {
    let totalCredits = 0
    let totalPoints = 0
    subjects.forEach(s => {
      const credits = parseFloat(s.credits) || 0
      const points = gradePoints[s.grade] || 0
      totalCredits += credits
      totalPoints += credits * points
    })
    return totalCredits === 0 ? 0 : (totalPoints / totalCredits).toFixed(2)
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">GPA Calculator</h2>
        <p className="text-muted-foreground mt-2">Calculate your semester GPA manually.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Subjects</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {subjects.map((sub, i) => (
                <div key={sub.id} className="flex items-center gap-3">
                  <span className="text-muted-foreground w-4">{i + 1}.</span>
                  <Input 
                    placeholder="Subject name" 
                    value={sub.name}
                    onChange={(e) => updateSubject(sub.id, 'name', e.target.value)}
                    className="flex-1"
                  />
                  <Input 
                    type="number" 
                    placeholder="Credits" 
                    value={sub.credits}
                    onChange={(e) => updateSubject(sub.id, 'credits', e.target.value)}
                    className="w-20"
                  />
                  <Select value={sub.grade} onValueChange={(val: string | null) => updateSubject(sub.id, 'grade', val || '')}>
                    <SelectTrigger className="w-24">
                      <SelectValue placeholder="Grade" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="O">O</SelectItem>
                      <SelectItem value="A+">A+</SelectItem>
                      <SelectItem value="A">A</SelectItem>
                      <SelectItem value="B+">B+</SelectItem>
                      <SelectItem value="B">B</SelectItem>
                      <SelectItem value="C">C</SelectItem>
                      <SelectItem value="U">U (Fail)</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button variant="ghost" size="icon" onClick={() => removeSubject(sub.id)} className="text-destructive">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
              <Button variant="outline" onClick={addSubject} className="w-full mt-4">
                <Plus className="w-4 h-4 mr-2" /> Add Subject
              </Button>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card className="sticky top-6 bg-primary/5 border-primary/20">
            <CardHeader className="text-center pb-2">
              <GraduationCap className="w-12 h-12 mx-auto text-primary mb-2" />
              <CardTitle>Semester GPA</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <div className="text-6xl font-bold text-primary mb-2">
                {calculateGPA()}
              </div>
              <p className="text-sm text-muted-foreground">
                Total Credits: {subjects.reduce((acc, s) => acc + (parseFloat(s.credits) || 0), 0)}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
