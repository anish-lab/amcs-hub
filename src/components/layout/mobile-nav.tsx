"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { LayoutDashboard, Clock, Calculator, Award, LogOut, GraduationCap } from "lucide-react"
import { Button } from "@/components/ui/button"

const navigation = [
  { name: 'Attendance', href: '/', icon: LayoutDashboard },
  { name: 'Timetable', href: '/timetable', icon: Clock },
  { name: 'Planner', href: '/planner', icon: Calculator },
  { name: 'CA Predictor', href: '/ca-predictor', icon: Award },
]

export default function MobileNav() {
  const pathname = usePathname()
  const router = useRouter()

  const handleLogout = async () => {
    await fetch("/api/logout", { method: "POST" })
    router.push("/login")
    router.refresh()
  }

  return (
    <>
      {/* Mobile Top Bar */}
      <header className="h-14 bg-card/90 backdrop-blur-md border-b border-border/60 flex md:hidden items-center justify-between px-4 sticky top-0 z-40 shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-md bg-blue-600/10 border border-blue-500/20 text-blue-500 flex items-center justify-center">
            <GraduationCap className="w-4 h-4" />
          </div>
          <span className="font-bold text-sm tracking-tight text-foreground">AMCS Hub</span>
        </div>
        
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={handleLogout}
          className="h-8 px-2.5 text-xs text-muted-foreground hover:text-destructive gap-1"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Exit</span>
        </Button>
      </header>

      {/* Mobile Bottom App Navigation Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-card/95 backdrop-blur-lg border-t border-border/60 flex items-center justify-around z-50 px-2 shadow-lg">
        {navigation.map((item) => {
          const isActive = pathname === item.href
          const Icon = item.icon
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex flex-col items-center justify-center gap-1 py-1.5 px-3 rounded-xl transition-all ${
                isActive 
                  ? "text-blue-500 font-bold scale-105" 
                  : "text-muted-foreground hover:text-foreground font-medium"
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'text-blue-500' : 'text-muted-foreground'}`} />
              <span className="text-[10px] tracking-tight">{item.name}</span>
            </Link>
          )
        })}
      </nav>
    </>
  )
}
