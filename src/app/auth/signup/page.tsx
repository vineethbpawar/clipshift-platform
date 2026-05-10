"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { StepProgress } from "@/components/auth/StepProgress";
import { Step1Role } from "@/components/auth/steps/Step1Role";
import { Step2Personal } from "@/components/auth/steps/Step2Personal";
import { Step3Location } from "@/components/auth/steps/Step3Location";
import { Step4Profile } from "@/components/auth/steps/Step4Profile";
import { Step5Onboarding } from "@/components/auth/steps/Step5Onboarding";
import { PageWrapper } from "@/components/layout/PageWrapper";

export default function SignupPage() {
  const [step, setStep] = useState(1);
  const totalSteps = 5;

  const nextStep = () => setStep(prev => Math.min(prev + 1, totalSteps));
  const prevStep = () => setStep(prev => Math.max(prev - 1, 1));

  const renderStep = () => {
    switch (step) {
      case 1: return <Step1Role onNext={nextStep} />;
      case 2: return <Step2Personal onNext={nextStep} onBack={prevStep} />;
      case 3: return <Step3Location onNext={nextStep} onBack={prevStep} />;
      case 4: return <Step4Profile onNext={nextStep} onBack={prevStep} />;
      case 5: return <Step5Onboarding />;
      default: return null;
    }
  };

  return (
    <PageWrapper>
      <div className="min-h-screen pt-32 pb-20 px-4">
        {/* Background Decorative Elements */}
        <div className="fixed top-0 left-0 w-full h-full pointer-events-none -z-10">
          <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-neon-purple/10 blur-[150px] rounded-full" />
          <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-neon-blue/10 blur-[150px] rounded-full" />
        </div>

        <div className="max-w-5xl mx-auto">
          <StepProgress currentStep={step} totalSteps={totalSteps} />
          
          <div className="mt-16">
            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
              >
                {renderStep()}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}
