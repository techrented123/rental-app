import React, { useState } from "react";
import { ChevronRight, LucideProps } from "lucide-react";
import { useRentalApplicationContext } from "@/contexts/rental-application-context";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./tooltip";

export interface Steps {
  content: React.ReactElement;
  title: string;
  description?: string;
  icon: React.ForwardRefExoticComponent<
    Omit<LucideProps, "ref"> & React.RefAttributes<SVGSVGElement>
  >;
}

interface StepperProps {
  steps: Steps[];
  lastSavedStep: number;
}

export default function Stepper({ steps, lastSavedStep }: StepperProps) {
  const [activeStep, setActiveStep] = useState(lastSavedStep);
  const { stepOutputs, trackActivity } = useRentalApplicationContext();

  const handleNext = () => {
    if (activeStep < steps.length - 1) {
      const nextStep = activeStep + 1;
      setActiveStep(nextStep);
      // Check if we are moving from Verification step (index 1) to next
      let verificationReportUrl = undefined;
      if (activeStep === 1 && stepOutputs[1]) {
        try {
          const output = stepOutputs[1];
          if (output && output.subject && output.fileName) {
            const subjectData = JSON.parse(output.subject);
            const email = subjectData.email;
            if (email) {
              const formattedEmail = email.replace(/\./g, "_dot_").replace(/@/g, "_at_");
              const region = process.env.NEXT_PUBLIC_REGION || "us-east-1";
              verificationReportUrl = `https://verified-id-reports.s3.${region}.amazonaws.com/${formattedEmail}/${output.fileName}`;
              console.log("Constructed S3 URL:", verificationReportUrl);
            }
          }
        } catch (e) {
          console.error("Error constructing S3 URL:", e);
        }
      }

      // Check if we are moving from Signature step (index 3) to next
      let signature = undefined;
      if (activeStep === 3) {
        signature = true;
      }

      trackActivity(nextStep, undefined, undefined, verificationReportUrl, undefined, signature);
    }
  };

  const handlePrev = () => {
    if (activeStep > 0) {
      setActiveStep((prev) => prev - 1);
    }
  };

  React.useEffect(() => {
    setActiveStep(lastSavedStep);
  }, [lastSavedStep]);

  console.log({ stepOutputs, steps, activeStep });
  //container mx-auto py-0 px-4 h-full overflow-auto
  return (
    <div className="h-[100%] w-[90%] md:w-[80%] mx-auto overflow-auto">
      <div className="max-w-7xl mx-auto bg-white rounded-lg shadow-sm border">
        <div className="flex flex-col md:flex-row md:h-[650px]">
          {/* Vertical Stepper (Desktop) */}
          <div className="hidden md:flex flex-col w-64 border-r bg-gray-50 rounded-l-lg">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <div
                  key={index}
                  className={`
                    relative p-4 transition-all duration-200
                    ${index === activeStep ? "bg-gray-100" : ""}
                    ${index < steps.length - 1 ? "border-b" : ""}
                  `}
                >
                  <div className="flex items-start">
                    <div
                      className={`
                        w-10 h-10 rounded-full border-2 flex items-center justify-center
                        shrink-0 transition-colors duration-300
                        ${
                          index === activeStep
                            ? "border-blue-500 text-primary"
                            : index < activeStep
                            ? "border-blue-500 bg-blue-500 text-white"
                            : "border-gray-200 text-gray-400"
                        }
                      `}
                    >
                      <Icon className="w-5 h-5" />
                    </div>

                    <div className="ml-3">
                      <p
                        className={`
                          text-sm font-medium
                          ${
                            index === activeStep
                              ? "text-primary"
                              : index < activeStep
                              ? "text-primary"
                              : "text-gray-500"
                          }
                        `}
                      >
                        {step.title}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {step.description}
                      </p>
                    </div>
                  </div>

                  {/* Vertical connector line */}
                  {index < steps.length - 1 && (
                    <div
                      className={`
                        absolute left-9 top-14 w-0.5 h-[calc(100%-40px)] 
                        ${index < activeStep ? "bg-primary" : "bg-gray-200"}
                      `}
                    />
                  )}
                </div>
              );
            })}
          </div>

          <div className="flex flex-col flex-grow">
            {/* Horizontal Stepper (Mobile) */}
            {/*  <div className="md:hidden pt-4 px-4 ">
              <div className="flex items-center justify-between mb-2">
                {steps.map((step, index) => {
                  const Icon = step.icon;
                  return (
                    <div
                      key={index}
                      className={`
                        flex flex-col items-center relative
                        ${
                          index < steps.length - 1 &&
                          "after:content-[''] after:absolute after:top-4 after:left-1/2 after:w-full after:h-0.5 after:bg-gray-200 after:-translate-x-1/2 " +
                            (index < activeStep ? "after:!bg-primary" : "")
                        }
                      `}
                    >
                      <div
                        className={`
                          w-8 h-8 rounded-full border-2 flex items-center justify-center relative z-10 bg-white
                          transition-colors duration-300
                          ${
                            index === activeStep
                              ? "border-blue-500 text-primary"
                              : index < activeStep
                              ? "border-blue-500 bg-primary text-white !bg-blue-500"
                              : "border-gray-500 text-gray-400"
                          }
                        `}
                      >
                        <Icon className="w-4 h-4" />
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="text-center mb-4">
                <p className="font-medium text-primary">
                  {steps[activeStep].title}
                </p>
                <p className="text-xs text-gray-500">
                  {steps[activeStep].description}
                </p>
              </div>
            </div> */}
            {/* Horizontal Stepper (Mobile) */}
            <div className="md:hidden pt-4 px-4 ">
              <div className="flex items-center justify-between mb-2">
                {steps.map((step, index) => {
                  const Icon = step.icon;
                  return (
                    <React.Fragment key={index}>
                      <div className="flex flex-col items-center relative">
                        <div
                          className={`
                w-8 h-8 rounded-full border-2 flex items-center justify-center relative z-10 bg-white
                transition-colors duration-300
                ${
                  index === activeStep
                    ? "border-blue-500 text-primary"
                    : index < activeStep
                    ? "border-blue-500 bg-primary text-white !bg-blue-500"
                    : "border-gray-500 text-gray-400"
                }
              `}
                        >
                          <Icon className="w-4 h-4" />
                        </div>
                      </div>

                      {/* Connecting line */}
                      {index < steps.length - 1 && (
                        <div
                          className={`
                flex-1 h-0.5 mx-2
                ${index < activeStep ? "bg-primary" : "bg-gray-200"}
              `}
                        />
                      )}
                    </React.Fragment>
                  );
                })}
              </div>
              <div className="text-center mb-4">
                <p className="font-medium text-primary">
                  {steps[activeStep].title}
                </p>
                <p className="text-xs text-gray-500">
                  {steps[activeStep].description}
                </p>
              </div>
            </div>
            {/* Step Content */}
            <div className="flex-grow p-3 overflow-auto">
              {steps[activeStep].content}
            </div>

            {/* Navigation */}
            {activeStep !== steps.length - 1 && (
              <div className="flex justify-end py-2 px-4 mt-auto border-t bg-gray-50">
                {stepOutputs[activeStep] === undefined ? (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="inline-block">
                          <Button
                            size="lg"
                            onClick={handleNext}
                            disabled
                            className="bg-blue-500 !cursor-not-allowed flex justify-end items-center gap-1 px-3 py-1 hover:bg-blue-600 "
                          >
                            Next <ChevronRight size={18} />
                          </Button>
                        </span>
                      </TooltipTrigger>
                      <TooltipContent>
                        Please finish this step before proceeding to the next
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                ) : (
                  <Button
                    size="lg"
                    onClick={handleNext}
                    className="bg-blue-500 flex justify-end items-center gap-1 px-3 py-1 hover:bg-blue-600 "
                  >
                    Next <ChevronRight size={18} />
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
