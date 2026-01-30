import { NextRequest, NextResponse } from "next/server";

// Smart fallback reframes based on step content
function generateSmartReframe(originalStep: string): string {
  const stepLower = originalStep.toLowerCase();
  
  // If step mentions writing
  if (stepLower.includes("write") || stepLower.includes("draft") || stepLower.includes("type")) {
    return `Just write ONE sentence. Any sentence. It can be terrible.`;
  }
  
  // If step mentions reading
  if (stepLower.includes("read") || stepLower.includes("review") || stepLower.includes("look")) {
    return `Spend exactly 60 seconds skimming. Set a timer. Stop when it rings.`;
  }
  
  // If step mentions opening/starting
  if (stepLower.includes("open") || stepLower.includes("start") || stepLower.includes("begin")) {
    return `Just open the file/app. Don't do anything else. Opening = success.`;
  }
  
  // If step mentions organizing/cleaning
  if (stepLower.includes("organize") || stepLower.includes("clean") || stepLower.includes("sort")) {
    return `Pick up exactly ONE item. Just one. Put it where it belongs.`;
  }
  
  // If step mentions emailing/messaging
  if (stepLower.includes("email") || stepLower.includes("reply") || stepLower.includes("message")) {
    return `Write just "Hi" and your name. That's the whole task.`;
  }
  
  // If step mentions coding/fixing
  if (stepLower.includes("code") || stepLower.includes("fix") || stepLower.includes("implement")) {
    return `Add a single comment describing what you want to do. That's it.`;
  }
  
  // Default: make it time-based and tiny
  const shortened = originalStep.slice(0, 30);
  return `Spend exactly 2 minutes on "${shortened}..." - timer stops, you stop. No pressure.`;
}

export async function POST(request: NextRequest) {
  try {
    const { originalStep, task, apiKey: userApiKey, model: userModel } = await request.json();

    if (!originalStep || typeof originalStep !== "string") {
      return NextResponse.json({ error: "Step is required" }, { status: 400 });
    }

    // Use user-provided API key, or fall back to environment variable
    const apiKey = userApiKey || process.env.OPENAI_API_KEY;
    const model = userModel || "gpt-4o-mini";
    
    if (!apiKey) {
      // Return smart fallback reframe
      return NextResponse.json({
        newStep: generateSmartReframe(originalStep),
      });
    }

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: model,
        messages: [
          {
            role: "system",
            content: `You help people who are stuck on a task by making it even smaller and more approachable.

When someone says they're stuck, give them an EVEN TINIER version of the step - something so small it feels almost silly not to do it.

Rules:
- Make it take 2 minutes or less
- Be very specific
- Lower the bar significantly
- Add encouragement
- Keep it to one sentence

Respond with ONLY the new step as plain text. No quotes, no explanation.`,
          },
          {
            role: "user",
            content: `I'm stuck on this step: "${originalStep}"
Original task was: "${task || 'unknown'}"

Give me a smaller version I can actually do right now.`,
          },
        ],
        temperature: 0.7,
        max_tokens: 100,
      }),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.error) {
      throw new Error(data.error.message);
    }

    const newStep = data.choices[0]?.message?.content?.trim();
    
    if (!newStep || newStep.length < 5) {
      return NextResponse.json({
        newStep: generateSmartReframe(originalStep),
      });
    }

    return NextResponse.json({ newStep });
  } catch (error) {
    console.error("Reframe error:", error);
    // Return smart fallback on any error
    try {
      const { originalStep } = await request.clone().json();
      return NextResponse.json({
        newStep: generateSmartReframe(originalStep || "your task"),
      });
    } catch {
      return NextResponse.json({
        newStep: "Just spend 2 minutes looking at what you have. No action required.",
      });
    }
  }
}
