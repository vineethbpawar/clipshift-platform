import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY || "");

export async function POST(req: Request) {
  try {
    if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
      return NextResponse.json({ error: "AI tools are not available right now." }, { status: 503 });
    }

    const { feature, data } = await req.json();
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    let prompt = "";

    switch (feature) {
      case "budget-estimator":
        prompt = `
          Estimate a fair professional budget and timeline for this video project in Indian Rupees (INR).
          Project Details: ${JSON.stringify(data)}
          
          Return a JSON object with:
          - minBudget: number
          - maxBudget: number
          - explanation: string (max 2 sentences, no sci-fi words)
          - deliveryTimeline: string (e.g. "3-5 days")
          
          Only return the JSON.
        `;
        break;

      case "creator-match":
        prompt = `
          Calculate a match score (0-100) between this project and this creator.
          Project: ${JSON.stringify(data.project)}
          Creator: ${JSON.stringify(data.creator)}
          
          Return a JSON object with:
          - score: number
          - explanation: string (max 1 sentence, simple words)
          
          Only return the JSON.
        `;
        break;

      case "proposal-assistant":
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

      case "portfolio-tips":
        prompt = `
          Analyze this portfolio data and provide professional improvement tips for a creator.
          Portfolio: ${JSON.stringify(data)}
          
          Return a JSON object with:
          - strength: string (High, Medium, or Low)
          - tips: string[] (top 3 tips, simple words)
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
      const jsonResponse = JSON.parse(text.replace(/```json|```/g, ""));
      return NextResponse.json(jsonResponse);
    } catch (e) {
      console.error("Failed to parse Gemini response", text);
      return NextResponse.json({ error: "Could not generate AI suggestion. Please try again." }, { status: 500 });
    }

  } catch (error) {
    console.error("AI GENERATE ERROR", error);
    return NextResponse.json({ error: "Could not generate AI suggestion. Please try again." }, { status: 500 });
  }
}
