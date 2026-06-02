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
    
    if (!response.ok) {
      throw new Error(result.error || "AI request failed");
    }

    return result;
  } catch (error) {
    console.error(`AI ${feature} error:`, error);
    return { error: error instanceof Error ? error.message : "Could not generate AI suggestion. Please try again." };
  }
};

export const estimateBudgetAI = async (projectData: Partial<Project>) => {
  return await callAIFeature("budget-estimator", projectData);
};

export const getCreatorMatchScoreAI = async (project: Partial<Project>, creator: Creator) => {
  return await callAIFeature("creator-match", { project, creator });
};

export const writeProposalAI = async (project: Partial<Project>, creator: Partial<Creator>) => {
  return await callAIFeature("proposal-assistant", { project, creator });
};

export const getPortfolioTipsAI = async (portfolioData: any) => {
  return await callAIFeature("portfolio-tips", portfolioData);
};
