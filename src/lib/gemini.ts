import { Project } from "@/data/projects";
import { Creator } from "@/data/creators";

export const callAIFeature = async (feature: string, data: any) => {
  try {
    const response = await fetch("/api/ai/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ feature, data })
    });

    const result = await response.json();
    
    if (!response.ok || !result.success) {
      // If we have fallback data (e.g. quota exceeded), return it with the error
      if (result.fallback) {
        return { 
          error: result.error || "AI request failed", 
          fallback: result.fallback,
          isFallback: true 
        };
      }
      throw new Error(result.error || "AI request failed");
    }

    return result.result;
  } catch (error: any) {
    console.error(`AI ${feature} error:`, error);
    return { error: error.message || "Could not generate AI suggestion. Please try again." };
  }
};

export const estimateBudgetAI = async (projectData: Partial<Project>) => {
  return await callAIFeature("budget_estimator", projectData);
};

export const getCreatorMatchScoreAI = async (project: Partial<Project>, creator: Creator) => {
  return await callAIFeature("creator_match", { project, creator });
};

export const writeProposalAI = async (project: Partial<Project>, creator: Partial<Creator>) => {
  return await callAIFeature("proposal_assistant", { project, creator });
};

export const improveDescriptionAI = async (data: { title: string, description: string, category: string, serviceType: string }) => {
  return await callAIFeature("description_improver", data);
};

export const suggestTitlesAI = async (data: { title: string, category: string, serviceType: string }) => {
  return await callAIFeature("title_suggestions", data);
};

export const generateCreatorBioAI = async (data: { name: string, specialization: string, city: string, experience: string }) => {
  return await callAIFeature("portfolio_bio", data);
};

export const suggestCreatorPricingAI = async (data: { specialization: string, experience: string, location: string }) => {
  return await callAIFeature("pricing_helper", data);
};

export const getPortfolioTipsAI = async (portfolioData: any) => {
  return await callAIFeature("portfolio_tips", portfolioData);
};
