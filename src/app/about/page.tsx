import React from "react";
import { PageWrapper } from "@/components/layout/PageWrapper";

export default function AboutPage() {
  return (
    <PageWrapper>
      <div className="min-h-screen pt-32 pb-20 px-4 md:px-8 max-w-3xl mx-auto">
        <h1 className="text-4xl font-black text-white uppercase tracking-tighter mb-8">About ClipShift</h1>
        <p className="text-gray-400 text-lg leading-relaxed">
          ClipShift is a video creator marketplace connecting clients with editors, videographers, and content creators. 
          Our platform simplifies the creative process, allowing you to focus on the story while we handle the logistics.
        </p>
      </div>
    </PageWrapper>
  );
}
