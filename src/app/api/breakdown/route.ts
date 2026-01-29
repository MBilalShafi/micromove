import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { task } = await request.json();

    if (!task) {
      return NextResponse.json({ error: "Task is required" }, { status: 400 });
    }

    const apiKey = process.env.OPENAI_API_KEY;
    
    if (!apiKey) {
      // Return mock steps if no API key
      return NextResponse.json({
        steps: [
          `Open the relevant files/tools for: ${task.slice(0, 30)}`,
          "Spend 2 minutes just looking at what's there",
          "Write/do the absolute smallest piece",
          "Add one more small piece",
          "Review and polish what you have",
        ],
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
            content: `You are a productivity coach that helps people overcome procrastination by breaking down overwhelming tasks into tiny, manageable steps.

Rules:
- Break the task into 5-7 micro-steps
- Each step should take about 5 minutes or less
- Steps should be VERY specific and actionable
- Start with the easiest possible action to build momentum
- Use encouraging, simple language
- Focus on "just getting started" for the first step

Respond with ONLY a JSON array of strings, each being one step. No explanation, no markdown, just the JSON array.`,
          },
          {
            role: "user",
            content: `Break down this task into micro-steps: "${task}"`,
          },
        ],
        temperature: 0.7,
        max_tokens: 500,
      }),
    });

    const data = await response.json();
    
    if (data.error) {
      throw new Error(data.error.message);
    }

    const content = data.choices[0]?.message?.content || "[]";
    
    // Parse the JSON array from the response
    let steps: string[];
    try {
      steps = JSON.parse(content);
    } catch {
      // If parsing fails, try to extract steps from text
      steps = content
        .split("\n")
        .filter((line: string) => line.trim())
        .map((line: string) => line.replace(/^\d+\.\s*/, "").replace(/^-\s*/, "").trim())
        .filter((line: string) => line.length > 0)
        .slice(0, 7);
    }

    return NextResponse.json({ steps });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      { error: "Failed to break down task" },
      { status: 500 }
    );
  }
}
