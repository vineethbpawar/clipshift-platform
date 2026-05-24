import React from "react";
import { PageWrapper } from "@/components/layout/PageWrapper";

export default function HelpPage() {
  return (
    <PageWrapper>
      <div className="min-h-screen pt-32 pb-20 px-4 md:px-8 max-w-3xl mx-auto space-y-8">
        <h1 className="text-4xl font-black text-white uppercase tracking-tighter mb-8">Help Center</h1>
        
        <div className="space-y-6">
          <h3 className="text-xl font-black text-white">Frequently Asked Questions</h3>
          <div className="space-y-4 text-gray-400">
            <p><strong>How do I post a project?</strong> Visit the "Post a Project" page from the dashboard.</p>
            <p><strong>How do creators apply?</strong> Creators submit proposals to your posted projects.</p>
            <p><strong>How does unlock chat work?</strong> Use the "Unlock Creator Chat" pay-per-use option on creator profiles.</p>
            <p><strong>Contact Us:</strong> clipshiftplatform@gmail.com</p>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}
