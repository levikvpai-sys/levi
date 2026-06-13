"use client";

import { cn } from "@/lib/utils";
import { Badge } from "./ui/badge";

interface AgentCardProps {
  name: string;
  role: string;
  description: string;
  icon: string;
  status: "idle" | "running" | "completed" | "error";
  colorClass: string;
  lastRun?: string;
  className?: string;
}

const statusConfig = {
  idle: { label: "Idle", variant: "outline" as const, dot: "bg-gray-500" },
  running: { label: "Running", variant: "default" as const, dot: "bg-sky-400 animate-pulse" },
  completed: { label: "Done", variant: "success" as const, dot: "bg-emerald-400" },
  error: { label: "Error", variant: "destructive" as const, dot: "bg-red-400" },
};

export function AgentCard({
  name,
  role,
  description,
  icon,
  status,
  colorClass,
  lastRun,
  className,
}: AgentCardProps) {
  const { label, variant, dot } = statusConfig[status];

  return (
    <div
      className={cn(
        "glass-card p-4 flex flex-col gap-3 hover:border-border transition-all duration-200 group",
        status === "running" && "border-sky-500/50 glow-blue",
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div className={cn("text-2xl w-10 h-10 flex items-center justify-center rounded-lg", colorClass)}>
          {icon}
        </div>
        <div className="flex items-center gap-2">
          <div className={cn("w-2 h-2 rounded-full", dot)} />
          <Badge variant={variant} className="text-xs">
            {label}
          </Badge>
        </div>
      </div>

      <div>
        <p className="font-semibold text-foreground text-sm">{name}</p>
        <p className="text-xs text-sky-400 font-medium mt-0.5">{role}</p>
      </div>

      <p className="text-xs text-muted-foreground leading-relaxed">{description}</p>

      {lastRun && (
        <p className="text-xs text-muted-foreground/60 border-t border-border/50 pt-2 mt-auto">
          Last run: {lastRun}
        </p>
      )}
    </div>
  );
}
