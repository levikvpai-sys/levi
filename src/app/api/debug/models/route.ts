import { NextResponse } from "next/server";
import { CLAUDE_OPUS, CLAUDE_SONNET, CLAUDE_HAIKU } from "@/lib/claude";

export async function GET() {
  return NextResponse.json({
    claude: {
      opus: CLAUDE_OPUS,     // Script Studio (campaign scripts)
      sonnet: CLAUDE_SONNET, // Prompt Director (image prompts)
      haiku: CLAUDE_HAIKU,   // Social Agent (captions)
    },
    openai: {
      image: "dall-e-3", // DALL-E 3 image generation only
    },
  });
}
