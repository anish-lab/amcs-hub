import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BookOpen } from "lucide-react"

export default function ResourcesPage() {
  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Notes & PYQs</h2>
        <p className="text-muted-foreground mt-2">Access study materials and previous year question papers.</p>
      </div>

      <Card className="bg-muted/20 border-primary/20">
        <CardHeader className="text-center py-12">
          <BookOpen className="w-12 h-12 mx-auto text-primary mb-4 opacity-50" />
          <CardTitle className="text-2xl">Coming Soon</CardTitle>
          <CardDescription className="max-w-md mx-auto mt-2">
            The resource sharing platform is currently under construction in Phase 4 of the PSG College Hub roadmap.
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
  )
}
