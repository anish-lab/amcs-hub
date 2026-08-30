"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { LayoutDashboard, Clock, Calculator, Award, LogOut, GraduationCap } from "lucide-react"
import { Button } from "@/components/ui/button"

const navigation = [
  { name: 'Subject Attendance', href: '/', icon: LayoutDashboard },
  { name: 'Timetable', href: '/timetable', icon: Clock },
  { name: 'Bunk Planner', href: '/planner', icon: Calculator },
  { name: 'CA & Grade Predictor', href: '/ca-predictor', icon: Award },
]

export default function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()

  const handleLogout = async () => {
    await fetch("/api/logout", { method: "POST" })
    router.push("/login")
    router.refresh()
  }

  return (
    <aside className="w-64 bg-card/60 border-r border-border/60 hidden md:flex flex-col justify-between shrink-0 select-none">
      <div>
        {/* Brand Header */}
        <div className="h-16 flex items-center px-5 border-b border-border/60 gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-600/10 border border-blue-500/20 text-blue-500 flex items-center justify-center font-bold">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-bold tracking-tight text-foreground">
              AMCS Hub
            </h1>
            <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest block font-medium">Academic Portal</span>
          </div>
        </div>

        {/* Navigation Section */}
        <div className="px-3 py-4">
          <span className="px-3 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider block mb-2">Navigation</span>
          <nav className="space-y-1">
            {navigation.map((item) => {
              const isActive = pathname === item.href
              const Icon = item.icon
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-3 px-3.5 py-3 rounded-lg text-sm font-semibold transition-all ${
                    isActive
                      ? "bg-blue-600/10 text-blue-500 font-bold border-l-2 border-blue-500"
                      : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                  }`}
                >
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-blue-500' : 'text-muted-foreground'}`} />
                  {item.name}
                </Link>
              )
            })}
          </nav>
        </div>
      </div>

      {/* Footer / Account */}
      <div className="p-3 border-t border-border/60">
        <Button 
          variant="ghost" 
          size="sm"
          onClick={handleLogout}
          className="w-full flex items-center justify-start gap-2.5 text-xs text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors font-medium"
        >
          <LogOut className="w-3.5 h-3.5" />
          Sign Out / Switch Account
        </Button>
      </div>
    </aside>
  )
}
