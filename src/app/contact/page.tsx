import React from "react";
import { PageWrapper } from "@/components/layout/PageWrapper";

export default function ContactPage() {
  return (
    <PageWrapper>
      <div className="min-h-screen pt-32 pb-20 px-4 md:px-8 max-w-3xl mx-auto">
        <h1 className="text-4xl font-black text-white uppercase tracking-tighter mb-8">Contact</h1>
        <p className="text-gray-400">
          Email: <a href="mailto:clipshiftplatform@gmail.com" className="text-neon-purple hover:underline">clipshiftplatform@gmail.com</a>
        </p>
        <p className="mt-8 text-gray-400">
          For collaboration, support, creator onboarding, or business enquiries, contact us.
        </p>
      </div>
    </PageWrapper>
  );
}
