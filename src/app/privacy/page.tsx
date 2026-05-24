import React from "react";
import { PageWrapper } from "@/components/layout/PageWrapper";

export default function PrivacyPage() {
  return (
    <PageWrapper>
      <div className="min-h-screen pt-32 pb-20 px-4 md:px-8 max-w-3xl mx-auto">
        <h1 className="text-4xl font-black text-white uppercase tracking-tighter mb-8">Privacy Policy</h1>
        <p className="text-gray-400">
          We value your privacy. We collect account, project, and message data solely for the purpose of facilitating your connection and project workflow. Payments are processed through our trusted payment provider.
        </p>
      </div>
    </PageWrapper>
  );
}
