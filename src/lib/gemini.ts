import { GoogleGenerativeAI } from "@google/generative-ai";
import { supabase } from "./supabase";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY || "");

export const getGeminiResponse = async (prompt: string, feature: string) => {
  // Try to get from cache first
  const { data: cached } = await supabase
    .from("ai_cache")
    .select("response")
    .eq("prompt_hash", Buffer.from(prompt).toString("base64"))
    .eq("feature", feature)
    .single();

  if (cached) {
    return cached.response;
  }

  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  const result = await model.generateContent(prompt);
  const response = result.response.text();

  // Save to cache
  await supabase.from("ai_cache").insert({
    prompt_hash: Buffer.from(prompt).toString("base64"),
    feature,
    response,
  });

  return response;
};

export const matchCreators = async (projectData: any, creators: any[]) => {
  const prompt = `
    Match the top 5 creators for the following project:
    Project: ${JSON.stringify(projectData)}
    
    Available Creators: ${JSON.stringify(creators)}
    
    Return a JSON array of objects with creator id, match score (0-100), and reasoning.
  `;
  const response = await getGeminiResponse(prompt, "creator-match");
  try {
    return JSON.parse(response.replace(/```json|```/g, ""));
  } catch (e) {
    console.error("Failed to parse Gemini response", response);
    return [];
  }
};

export const analyzeVideoQuality = async (videoDetails: any, portfolioHistory: any) => {
  const prompt = `
    Analyze the video quality based on these details:
    Video: ${JSON.stringify(videoDetails)}
    History: ${JSON.stringify(portfolioHistory)}
    
    Return scores (0-100) for Cinematography, Color, Pacing, Audio, and Overall, plus feedback.
    Format as JSON.
  `;
  const response = await getGeminiResponse(prompt, "video-analysis");
  try {
    return JSON.parse(response.replace(/```json|```/g, ""));
  } catch (e) {
    console.error("Failed to parse Gemini response", response);
    return null;
  }
};

export const estimatePrice = async (projectDetails: any) => {
  const prompt = `
    Estimate a fair price range for this project:
    ${JSON.stringify(projectDetails)}
    
    Return a recommended budget, market comparison, and a badge value (Fair, Above, or Below Market).
    Format as JSON.
  `;
  const response = await getGeminiResponse(prompt, "price-estimator");
  try {
    return JSON.parse(response.replace(/```json|```/g, ""));
  } catch (e) {
    console.error("Failed to parse Gemini response", response);
    return null;
  }
};

export const getPortfolioInsights = async (portfolioData: any) => {
  const prompt = `
    Analyze this portfolio and provide insights:
    ${JSON.stringify(portfolioData)}
    
    Return trending styles, gaps, and improvement tips.
    Format as JSON.
  `;
  const response = await getGeminiResponse(prompt, "portfolio-insights");
  try {
    return JSON.parse(response.replace(/```json|```/g, ""));
  } catch (e) {
    console.error("Failed to parse Gemini response", response);
    return null;
  }
};
