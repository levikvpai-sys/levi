import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function CampaignDetailPage({
  params,
}: {
  params: { id: string };
}) {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/50 bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="text-muted-foreground hover:text-foreground transition-colors text-sm">← Dashboard</Link>
            <span className="text-border">/</span>
            <span className="text-sm font-medium">Campaign</span>
            <Badge variant="outline" className="text-xs font-mono">{params.id}</Badge>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">Edit</Button>
            <Button size="sm">Approve All</Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="text-center py-16 text-muted-foreground">
          <p className="text-4xl mb-4">🚀</p>
          <p className="font-medium text-lg">Campaign Detail View</p>
          <p className="text-sm mt-2">Campaign outputs will appear here after generation</p>
          <Link href="/campaign/new" className="inline-block mt-4">
            <Button>Create New Campaign</Button>
          </Link>
        </div>
      </main>
    </div>
  );
}
