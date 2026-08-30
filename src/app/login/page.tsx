"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { AlertCircle, Loader2, GraduationCap, ShieldCheck } from "lucide-react"

export default function LoginPage() {
  const router = useRouter()
  const [rollno, setRollno] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const res = await fetch("/api/sync-ecampus", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rollno, password }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || "Login failed")
      }

      router.push("/")
      router.refresh()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex h-screen w-full items-center justify-center bg-muted/30 p-4">
      <Card className="w-full max-w-sm border border-border/60 shadow-lg bg-card rounded-2xl">
        <CardHeader className="space-y-2 text-center pb-4 pt-6">
          <div className="mx-auto w-10 h-10 rounded-xl bg-blue-600/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <GraduationCap className="w-5 h-5" />
          </div>
          <CardTitle className="text-xl font-bold text-foreground tracking-tight">
            AMCS Hub
          </CardTitle>
          <CardDescription className="text-xs text-muted-foreground">
            Sign in with your eCampus credentials to sync your student profile.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 pb-6">
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="rollno" className="text-xs font-medium text-foreground">Roll Number</Label>
              <Input
                id="rollno"
                placeholder="e.g. 24PT04"
                value={rollno}
                onChange={(e) => setRollno(e.target.value.toUpperCase())}
                className="h-10 text-xs font-mono bg-background border-border/80 rounded-lg"
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-xs font-medium text-foreground">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-10 text-xs font-mono bg-background border-border/80 rounded-lg"
                required
              />
            </div>
            
            {error && (
              <div className="flex items-center gap-2 text-xs text-destructive bg-destructive/10 border border-destructive/20 p-2.5 rounded-lg">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}
            
            <Button type="submit" className="w-full h-10 text-xs font-medium bg-blue-600 hover:bg-blue-700 text-white shadow-sm rounded-lg transition-colors" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                  Authenticating...
                </>
              ) : (
                "Sign In & Sync"
              )}
            </Button>
            
            <div className="flex items-center justify-center gap-1.5 pt-2 text-[11px] text-muted-foreground">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              <span>Direct SSL Connection to eCampus</span>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
