import React from "react";
import { PageWrapper } from "@/components/layout/PageWrapper";

export default function ClientGuidePage() {
  return (
    <PageWrapper>
      <div className="min-h-screen pt-32 pb-20 px-4 md:px-8 max-w-3xl mx-auto space-y-6">
        <h1 className="text-4xl font-black text-white uppercase tracking-tighter mb-8">Client Guide</h1>
        <p className="text-gray-400">Collaborating with creators:</p>
        <ul className="space-y-4 text-gray-400 list-disc pl-6">
          <li><strong>Post Projects:</strong> Clear descriptions help attract the best talent.</li>
          <li><strong>Discover Creators:</strong> Use our marketplace filters to find the perfect fit.</li>
          <li><strong>Unlock Chat:</strong> Unlock creator chat to initiate direct collaboration.</li>
          <li><strong>Boost visibility:</strong> Apply boosts to your projects to increase proposal volume.</li>
        </ul>
      </div>
    </PageWrapper>
  );
}
