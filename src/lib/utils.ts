import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

export function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSecs < 60) return "just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return formatDate(dateString);
}

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str;
  return str.slice(0, length) + "...";
}

export function slugify(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9 -]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

export function generateId(): string {
  return Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
}

export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

export function titleCase(str: string): string {
  return str
    .split(/[-_\s]/)
    .map(capitalize)
    .join(" ");
}

export function getPlatformEmoji(platform: string): string {
  const map: Record<string, string> = {
    instagram: "📸",
    tiktok: "🎵",
    facebook: "📘",
    email: "📧",
    youtube: "▶️",
    web: "🌐",
  };
  return map[platform] || "📱";
}

export function getContentTypeLabel(type: string): string {
  const map: Record<string, string> = {
    social_post: "Social Post",
    video_script: "Video Script",
    ad_copy: "Ad Copy",
    email: "Email",
    blog_post: "Blog Post",
    image_prompt: "Image Prompt",
  };
  return map[type] || titleCase(type);
}

export function getStatusColor(status: string): string {
  const map: Record<string, string> = {
    draft: "text-gray-400",
    in_progress: "text-hippo-400",
    review: "text-yellow-400",
    approved: "text-aqua-400",
    published: "text-float-400",
    idle: "text-gray-400",
    running: "text-hippo-400",
    completed: "text-aqua-400",
    error: "text-coral-400",
  };
  return map[status] || "text-gray-400";
}

export function getStatusBadgeVariant(
  status: string
): "default" | "secondary" | "destructive" | "outline" {
  const map: Record<
    string,
    "default" | "secondary" | "destructive" | "outline"
  > = {
    draft: "outline",
    in_progress: "secondary",
    review: "secondary",
    approved: "default",
    published: "default",
    error: "destructive",
  };
  return map[status] || "outline";
}

export function parseJsonSafely<T>(json: string, fallback: T): T {
  try {
    return JSON.parse(json) as T;
  } catch {
    return fallback;
  }
}

export function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function estimateReadingTime(text: string): number {
  const wordsPerMinute = 200;
  const words = text.split(/\s+/).length;
  return Math.ceil(words / wordsPerMinute);
}

export function countWords(text: string): number {
  return text
    .trim()
    .split(/\s+/)
    .filter((w) => w.length > 0).length;
}

export function formatTokenCount(count: number): string {
  if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}k tokens`;
  }
  return `${count} tokens`;
}
