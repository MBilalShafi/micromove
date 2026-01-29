import { NextRequest, NextResponse } from "next/server";

// Smart fallback step generator based on task type
function generateFallbackSteps(task: string): string[] {
  const taskLower = task.toLowerCase();
  
  // Writing tasks
  if (taskLower.includes("write") || taskLower.includes("essay") || taskLower.includes("paper") || taskLower.includes("article") || taskLower.includes("blog")) {
    return [
      "Open a blank document and just write the title",
      "Write one terrible sentence - it doesn't have to be good",
      "Add 2-3 bullet points of what you want to cover",
      "Expand one bullet point into a rough paragraph",
      "Read what you have and fix one thing",
      "Write one more paragraph",
      "Take a breath - you're making progress!",
    ];
  }
  
  // Coding tasks
  if (taskLower.includes("code") || taskLower.includes("program") || taskLower.includes("build") || taskLower.includes("implement") || taskLower.includes("fix") || taskLower.includes("bug")) {
    return [
      "Open the project and just look at the code for 2 minutes",
      "Add a comment describing what you need to do",
      "Write the simplest possible version (even if wrong)",
      "Make one small improvement",
      "Test what you have",
      "Fix one issue you found",
      "Commit your progress (even if incomplete)",
    ];
  }
  
  // Cleaning/organizing tasks
  if (taskLower.includes("clean") || taskLower.includes("organize") || taskLower.includes("tidy") || taskLower.includes("sort")) {
    return [
      "Pick ONE area to focus on (just one!)",
      "Remove obvious trash - just the easy stuff",
      "Group similar items together",
      "Put away 5 things that have a home",
      "Wipe one surface",
      "Step back and appreciate the progress",
    ];
  }
  
  // Email/communication tasks
  if (taskLower.includes("email") || taskLower.includes("reply") || taskLower.includes("message") || taskLower.includes("respond")) {
    return [
      "Open your inbox and find the message",
      "Read it one more time",
      "Write just the greeting and first sentence",
      "Add the main point (keep it short)",
      "Write the closing",
      "Read it once, fix typos, hit send",
    ];
  }
  
  // Study/learning tasks
  if (taskLower.includes("study") || taskLower.includes("learn") || taskLower.includes("read") || taskLower.includes("research")) {
    return [
      "Gather your materials and open to the right page/section",
      "Read just the headings and subheadings",
      "Read the first paragraph slowly",
      "Write down one thing you learned",
      "Read the next section",
      "Summarize what you know so far in 2 sentences",
    ];
  }
  
  // Default generic steps
  return [
    `Open everything you need for: ${task.slice(0, 40)}`,
    "Spend 2 minutes just looking - no action required yet",
    "Do the absolute smallest thing you can (even if it feels silly)",
    "Build on that with one more tiny action",
    "Take a moment to see what you've accomplished",
    "One more small step",
    "Decide: continue or take a well-deserved break?",
  ];
}

export async function POST(request: NextRequest) {
  try {
    const { task } = await request.json();

    if (!task || typeof task !== "string") {
      return NextResponse.json({ error: "Task is required" }, { status: 400 });
    }

    const cleanTask = task.trim();
    if (cleanTask.length < 3) {
      return NextResponse.json({ error: "Task is too short" }, { status: 400 });
    }

    const apiKey = process.env.OPENAI_API_KEY;
    
    if (!apiKey) {
      // Return smart fallback steps
      return NextResponse.json({
        steps: generateFallbackSteps(cleanTask),
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
- Make step 1 almost embarrassingly easy

Respond with ONLY a JSON array of strings, each being one step. No explanation, no markdown, just the JSON array.

Example response format:
["Step 1 text", "Step 2 text", "Step 3 text"]`,
          },
          {
            role: "user",
            content: `Break down this task into micro-steps: "${cleanTask}"`,
          },
        ],
        temperature: 0.7,
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.error) {
      throw new Error(data.error.message);
    }

    const content = data.choices[0]?.message?.content || "[]";
    
    // Parse the JSON array from the response
    let steps: string[];
    try {
      // Try to extract JSON from the response (in case there's extra text)
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        steps = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("No JSON array found");
      }
    } catch {
      // If parsing fails, try to extract steps from text
      steps = content
        .split("\n")
        .filter((line: string) => line.trim())
        .map((line: string) => line.replace(/^\d+\.\s*/, "").replace(/^-\s*/, "").replace(/^["']|["']$/g, "").trim())
        .filter((line: string) => line.length > 0 && line.length < 200)
        .slice(0, 7);
      
      // If still no good steps, use fallback
      if (steps.length < 3) {
        steps = generateFallbackSteps(cleanTask);
      }
    }

    // Validate steps
    if (!Array.isArray(steps) || steps.length < 2) {
      return NextResponse.json({
        steps: generateFallbackSteps(cleanTask),
      });
    }

    return NextResponse.json({ steps: steps.slice(0, 7) });
  } catch (error) {
    console.error("Error:", error);
    // Return fallback on any error
    try {
      const { task } = await request.clone().json();
      return NextResponse.json({
        steps: generateFallbackSteps(task || "your task"),
      });
    } catch {
      return NextResponse.json({
        steps: generateFallbackSteps("your task"),
      });
    }
  }
}
