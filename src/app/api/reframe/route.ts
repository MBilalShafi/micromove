import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { originalStep, task } = await request.json();

    if (!originalStep) {
      return NextResponse.json({ error: "Step is required" }, { status: 400 });
    }

    const apiKey = process.env.OPENAI_API_KEY;
    
    if (!apiKey) {
      // Return simpler version without API
      return NextResponse.json({
        newStep: `Just spend 2 minutes on: ${originalStep.slice(0, 40)}...`,
      });
    }

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
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
Original task was: "${task}"

Give me a smaller version I can actually do right now.`,
          },
        ],
        temperature: 0.7,
        max_tokens: 100,
      }),
    });

    const data = await response.json();
    
    if (data.error) {
      throw new Error(data.error.message);
    }

    const newStep = data.choices[0]?.message?.content?.trim() || originalStep;

    return NextResponse.json({ newStep });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      { error: "Failed to reframe step" },
      { status: 500 }
    );
  }
}
