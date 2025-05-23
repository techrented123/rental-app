"use client";

import { useContext, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { LucideProps } from "lucide-react";

export interface Steps {
  content?: React.ReactElement;
  title: string;
  description?: string;
  icon: React.ForwardRefExoticComponent<
    Omit<LucideProps, "ref"> & React.RefAttributes<SVGSVGElement>
  >;
}
export default function Stepper({ steps }: { steps: Steps[] }) {
  const [activeStep, setActiveStep] = useState(0);

  const handleNext = () => {
    if (activeStep < steps.length - 1) {
      setActiveStep((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (activeStep > 0) {
      setActiveStep((prev) => prev - 1);
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <Card className="max-w-8xl mx-auto">
        <CardContent className="pt-6">
          {/* Stepper */}
          <div className="mb-8">
            <div className="hidden md:flex justify-between">
              {steps.map((step, index) => {
                const Icon = step.icon;
                return (
                  <div
                    key={index}
                    className={cn(
                      "flex flex-col items-center relative w-36",
                      index < steps.length - 1 &&
                        "after:content-[''] after:absolute after:top-5 after:left-1/2 after:w-full after:h-0.5 after:bg-gray-200",
                      index < activeStep && "after:!bg-primary"
                    )}
                  >
                    <div
                      className={cn(
                        "w-10 h-10 rounded-full border-2 flex items-center justify-center relative z-10 bg-white transition-colors",
                        index === activeStep
                          ? "border-primary text-primary"
                          : index < activeStep
                          ? "border-primary bg-primary text-white"
                          : "border-gray-200 text-gray-400"
                      )}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="text-center mt-2">
                      <p
                        className={cn(
                          "text-sm font-medium",
                          index === activeStep
                            ? "text-primary"
                            : index < activeStep
                            ? "text-primary"
                            : "text-gray-400"
                        )}
                      >
                        {step.title}
                      </p>
                      <p className="text-xs text-gray-400 hidden lg:block">
                        {step.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Mobile Stepper */}
            <div className="md:hidden flex items-center justify-between mb-4">
              {steps.map((step, index) => {
                const Icon = step.icon;
                return (
                  <div
                    key={index}
                    className={cn(
                      "flex flex-col items-center relative",
                      index < steps.length - 1 &&
                        "after:content-[''] after:absolute after:top-4 after:left-1/2 after:w-full after:h-0.5 after:bg-gray-200",
                      index < activeStep && "after:!bg-primary"
                    )}
                  >
                    <div
                      className={cn(
                        "w-8 h-8 rounded-full border-2 flex items-center justify-center relative z-10 bg-white transition-colors",
                        index === activeStep
                          ? "border-primary text-primary"
                          : index < activeStep
                          ? "border-primary bg-primary text-white"
                          : "border-gray-200 text-gray-400"
                      )}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="md:hidden text-center mb-6">
              <p className="font-medium text-primary">
                {steps[activeStep].title}
              </p>
              <p className="text-sm text-gray-400">
                {steps[activeStep].description}
              </p>
            </div>
          </div>

          {/* Step Content */}
          <div className="min-h-[400px] flex items-center justify-center border rounded-lg p-6">
            {activeStep === 0 && (
              <div className="w-full">{steps[0].content} </div>
            )}
            {activeStep === 1 && <div>{steps[1].content} </div>}
            {activeStep === 2 && <div>{steps[2].content} </div>}

            {activeStep === 3 && <div>{steps[3].content} </div>}
            {activeStep === 4 && <div className="w-full">{steps[4].content} </div>}
          </div>

          {/* Navigation */}
          <div className="flex justify-between mt-6">
            <Button
              variant="outline"
              onClick={handlePrev}
              disabled={
                activeStep ===
                0 /* || rentApplicationStatus[activeStep-1].done */
              }
            >
              Previous
            </Button>
            <Button
              onClick={handleNext}
              disabled={
                activeStep === steps.length - 1 /* ||
                !rentApplicationStatus[activeStep].done */
              }
            >
              Next
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
