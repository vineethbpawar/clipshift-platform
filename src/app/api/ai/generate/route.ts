import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { feature, data } = await req.json();

  if (process.env.NODE_ENV === "development") {
    console.log("AI FEATURE REQUEST", { feature, data });
  }

  try {
    const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({
        success: false,
        error: "AI tools are not configured yet."
      }, { status: 503 });
    }

    if (!feature || !data) {
      return NextResponse.json({
        success: false,
        error: "Missing feature or data"
      }, { status: 400 });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

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

      case "description_improver":
        prompt = `
          Improve this video project description to be more professional and clear.
          Title: ${data.title}
          Current Description: ${data.description}
          Category: ${data.category}
          Service Type: ${data.serviceType}
          
          Return a JSON object with:
          - improvedDescription: string
          - requirements: string[] (3 specific requirements for this type of project)
          
          Only return the JSON.
        `;
        break;

      case "title_suggestions":
        prompt = `
          Suggest 3 catchy and professional titles for this video project.
          Current Title: ${data.title}
          Category: ${data.category}
          Service Type: ${data.serviceType}
          
          Return a JSON object with:
          - titles: string[] (exactly 3 titles)
          
          Only return the JSON.
        `;
        break;

      case "portfolio_bio":
        prompt = `
          Generate a premium professional bio for a video creator profile.
          Name: ${data.name}
          Specialization: ${data.specialization}
          City: ${data.city}
          Experience: ${data.experience}
          
          Return a JSON object with:
          - bio: string (max 3 sentences, professional and premium)
          
          Only return the JSON.
        `;
        break;

      case "pricing_helper":
        prompt = `
          Suggest starting prices for a video creator based on their profile.
          Specialization: ${data.specialization}
          Experience: ${data.experience}
          Location: ${data.location}
          
          Return a JSON object with:
          - startingPrice: number (in INR)
          - chatUnlockFee: number (in INR, typically 49-199)
          - pricingNote: string (1 sentence explanation)
          
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
        return NextResponse.json({
          success: false,
          error: "Invalid feature"
        }, { status: 400 });
    }

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    
    if (process.env.NODE_ENV === "development") {
      console.log("AI FEATURE RESPONSE", text);
    }
    
    try {
      // Try to parse as JSON
      const jsonResponse = JSON.parse(text.replace(/```json|```/g, "").trim());
      return NextResponse.json({ success: true, result: jsonResponse });
    } catch (e) {
      console.warn("Failed to parse Gemini response as JSON, falling back to basic result", text);
      return NextResponse.json({ success: true, result: text });
    }

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);

    if (process.env.NODE_ENV === "development") {
      console.error("AI FEATURE ERROR", {
        message,
        stack: error instanceof Error ? error.stack : undefined
      });
    }

    const isQuotaError = message.includes("429") || 
                        message.toLowerCase().includes("too many requests") || 
                        message.toLowerCase().includes("quota exceeded");

    if (isQuotaError) {
      let fallback: any = {};
      
      if (feature === "budget_estimator") {
        fallback = {
          minBudget: 1000,
          maxBudget: 3000,
          timeline: "2-5 days",
          explanation: "This is an estimated range based on common editing project pricing."
        };
      } else if (feature === "proposal_assistant") {
        fallback = {
          message: "Hi, I can help you complete this project with clean editing, smooth delivery, and clear communication. I will review your requirements carefully and deliver the work within the agreed timeline.",
          suggestedDays: 3,
          suggestedBudget: 2500
        };
      } else if (feature === "creator_match") {
        fallback = {
          score: 75,
          explanation: "Based on category match and verified profile."
        };
      } else if (feature === "description_improver") {
        fallback = {
          improvedDescription: data.description || "Looking for a professional video editor to handle this project with high quality and quick turnaround.",
          requirements: ["Professional color grading", "Clear audio mixing", "Timed subtitles/captions"]
        };
      } else if (feature === "title_suggestions") {
        fallback = {
          titles: [
            "Professional Video Editing Project",
            "High Quality Cinematic Video Edit",
            "Social Media Content Production"
          ]
        };
      } else if (feature === "portfolio_bio") {
        fallback = {
          bio: `Professional ${data.specialization || 'Video Creator'} focused on delivering premium visual content and cinematic storytelling.`
        };
      } else if (feature === "pricing_helper") {
        fallback = {
          startingPrice: 999,
          chatUnlockFee: 49,
          pricingNote: "Starting rates for professional creative services."
        };
      } else if (feature === "portfolio_tips") {
        fallback = {
          strength: "Medium",
          tips: ["Add more cinematic reels", "Optimize video thumbnails", "Complete your bio section"],
          suggestedNiche: "Professional Video Content",
          completionSuggestions: ["Add 2 more portfolio items", "Verify your social links"]
        };
      }

      return NextResponse.json({
        success: false,
        error: "AI limit reached. Please try again later.",
        fallback
      }, { status: 429 });
    }

    return NextResponse.json({
      success: false,
      error: "Could not generate AI suggestion.",
      debug: process.env.NODE_ENV === "development" ? message : undefined
    }, { status: 500 });
  }
}
