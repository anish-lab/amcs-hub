"use client"
import { Bell, Search, User } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

export default function Topbar() {
  return (
    <header className="h-16 bg-card border-b flex items-center justify-between px-4 md:px-6 z-10">
      <div className="md:hidden font-bold text-lg">PSG Hub</div>
      
      <div className="hidden md:flex items-center max-w-md w-full relative">
        <Search className="w-4 h-4 absolute left-3 text-muted-foreground" />
        <Input 
          placeholder="Search subjects, notes, announcements..." 
          className="pl-9 bg-muted/50 border-none focus-visible:ring-1"
        />
      </div>

      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="w-5 h-5" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full"></span>
        </Button>
        <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center border border-primary/30">
          <User className="w-4 h-4 text-primary" />
        </div>
      </div>
    </header>
  )
}
