import React from "react";
import { PageWrapper } from "@/components/layout/PageWrapper";

export default function TermsPage() {
  return (
    <PageWrapper>
      <div className="min-h-screen pt-32 pb-20 px-4 md:px-8 max-w-3xl mx-auto">
        <h1 className="text-4xl font-black text-white uppercase tracking-tighter mb-8">Terms of Service</h1>
        <p className="text-gray-400">
          ClipShift is currently in an early stage. By using our platform, you agree to our usage guidelines. Terms will be updated regularly.
        </p>
      </div>
    </PageWrapper>
  );
}
