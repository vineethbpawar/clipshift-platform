import React from "react";
import { PageWrapper } from "@/components/layout/PageWrapper";

export default function HowItWorksPage() {
  return (
    <PageWrapper>
      <div className="min-h-screen pt-32 pb-20 px-4 md:px-8 max-w-3xl mx-auto space-y-8">
        <h1 className="text-4xl font-black text-white uppercase tracking-tighter mb-8">How It Works</h1>
        <ol className="space-y-6 text-gray-400 list-decimal pl-6">
          <li><strong>Client Posts Project:</strong> Detail your video needs, budget, and location.</li>
          <li><strong>Creators Submit Proposals:</strong> Qualified creators apply with their portfolio and quote.</li>
          <li><strong>Client Reviews:</strong> Shortlist and review top proposals.</li>
          <li><strong>Chat & Collaborate:</strong> Securely unlock chat to discuss project specifics.</li>
          <li><strong>Project Delivery:</strong> Manage the workflow through our secure dashboard to project completion.</li>
        </ol>
      </div>
    </PageWrapper>
  );
}
