import React from "react";
import { PageWrapper } from "@/components/layout/PageWrapper";

export default function CreatorGuidePage() {
  return (
    <PageWrapper>
      <div className="min-h-screen pt-32 pb-20 px-4 md:px-8 max-w-3xl mx-auto space-y-6">
        <h1 className="text-4xl font-black text-white uppercase tracking-tighter mb-8">Creator Guide</h1>
        <p className="text-gray-400">Maximize your success on ClipShift:</p>
        <ul className="space-y-4 text-gray-400 list-disc pl-6">
          <li><strong>Build your profile:</strong> A complete profile with bio and portfolio is essential.</li>
          <li><strong>Upload your work:</strong> Showcase your best cinematic reels.</li>
          <li><strong>Apply wisely:</strong> Submit tailored proposals to projects that match your expertise.</li>
          <li><strong>Premium benefits:</strong> Subscribe to Pro or Premium plans for ranking boosts, advanced analytics, and more.</li>
        </ul>
      </div>
    </PageWrapper>
  );
}
