import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    if (!apiKey) {
      console.error("AI GENERATE ERROR: GOOGLE_GENERATIVE_AI_API_KEY is missing");
      return NextResponse.json({ error: "AI tools are not configured yet." }, { status: 503 });
    }

    const { feature, data } = await req.json();
    console.log("AI GENERATE REQUEST", { feature });

    if (!feature || !data) {
      return NextResponse.json({ error: "Missing feature or data" }, { status: 400 });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    let prompt = "";

    switch (feature) {
      case "budget_estimator":
        prompt = `
          Estimate a fair professional budget and timeline for this video project in Indian Rupees (INR).
          Project Details: ${JSON.stringify(data)}
          
          Return a JSON object with:
          - minBudget: number
          - maxBudget: number
          - explanation: string (max 2 sentences, simple professional words)
          - timeline: string (e.g. "3-5 days")
          
          Only return the JSON.
        `;
        break;

      case "creator_match":
        prompt = `
          Calculate a match score (0-100) between this project and this creator.
          Project: ${JSON.stringify(data.project)}
          Creator: ${JSON.stringify(data.creator)}
          
          Return a JSON object with:
          - score: number
          - explanation: string (max 1 sentence, simple professional words)
          
          Only return the JSON.
        `;
        break;

      case "proposal_assistant":
        prompt = `
          Write a professional proposal for this video project.
          Project: ${JSON.stringify(data.project)}
          Creator Info: ${JSON.stringify(data.creator)}
          
          Return a JSON object with:
          - message: string (professional, concise)
          - suggestedDays: number
          - suggestedBudget: number
          
          Only return the JSON.
        `;
        break;

      case "portfolio_tips":
        prompt = `
          Analyze this portfolio data and provide professional improvement tips for a creator.
          Portfolio: ${JSON.stringify(data)}
          
          Return a JSON object with:
          - strength: string (High, Medium, or Low)
          - tips: string[] (top 3 tips, simple professional words)
          - suggestedNiche: string
          - completionSuggestions: string[]
          
          Only return the JSON.
        `;
        break;

      default:
        return NextResponse.json({ error: "Invalid feature" }, { status: 400 });
    }

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    
    try {
      // Try to parse as JSON
      const jsonResponse = JSON.parse(text.replace(/```json|```/g, "").trim());
      return NextResponse.json({ success: true, result: jsonResponse });
    } catch (e) {
      console.warn("Failed to parse Gemini response as JSON, falling back to plain text", text);
      // Fallback for budget_estimator
      if (feature === "budget_estimator") {
        return NextResponse.json({
          success: true,
          result: {
            minBudget: 1000,
            maxBudget: 3000,
            timeline: "2-5 days",
            explanation: text.substring(0, 200)
          }
        });
      }
      return NextResponse.json({ success: true, result: text });
    }

  } catch (error) {
    console.error("AI GENERATE ERROR", error);
    return NextResponse.json({ error: "Could not generate AI suggestion. Please try again." }, { status: 500 });
  }
}
