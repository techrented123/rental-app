"use client";

import { useContext, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Check } from "lucide-react";
import { RentalApplicationContext } from "@/contexts/rental-application-context";

const membershipPlans = [
  {
    id: "basic",
    name: "Basic",
    price: 29,
    benefits: [
      "Standard application processing",
      "Basic background check",
      "Email support",
      "48-hour response time"
    ]
  },
  {
    id: "premium",
    name: "Premium",
    price: 49,
    benefits: [
      "Priority application processing",
      "Comprehensive background check",
      "Credit score insights",
      "24/7 phone support",
      "24-hour response time",
      "Rental history verification"
    ]
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: 99,
    benefits: [
      "Instant application processing",
      "Advanced background check",
      "Full credit report",
      "Dedicated support agent",
      "Instant response time",
      "Rental history verification",
      "Income verification",
      "Guaranteed approval decision"
    ]
  }
];

export default function RentalApplicationForm() {
  const [selectedPlan, setSelectedPlan] = useState("basic");
  const { formData, updateFormData } = useContext(RentalApplicationContext);

  const handleContinue = () => {
    updateFormData({ selectedPlan });
    // Navigation logic will be implemented later
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-center">
            Choose Your Membership Plan
          </CardTitle>
          <p className="text-center text-muted-foreground mt-2">
            Select the plan that best fits your needs
          </p>
        </CardHeader>
        <CardContent>
          <Tabs value={selectedPlan} onValueChange={setSelectedPlan} className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-8">
              {membershipPlans.map((plan) => (
                <TabsTrigger
                  key={plan.id}
                  value={plan.id}
                  className="relative"
                >
                  <div>
                    <div className="font-semibold">{plan.name}</div>
                    <div className="text-sm text-muted-foreground">${plan.price}/mo</div>
                  </div>
                </TabsTrigger>
              ))}
            </TabsList>

            {membershipPlans.map((plan) => (
              <TabsContent key={plan.id} value={plan.id}>
                <div className="grid gap-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-2xl font-bold">{plan.name} Plan</h3>
                      <p className="text-muted-foreground">
                        ${plan.price}/month
                      </p>
                    </div>
                    <Badge variant="secondary" className="text-lg px-4 py-1">
                      Selected
                    </Badge>
                  </div>
                  
                  <div className="grid gap-4">
                    <h4 className="text-xl font-semibold">Plan Benefits</h4>
                    <ul className="grid gap-3">
                      {plan.benefits.map((benefit, index) => (
                        <li key={index} className="flex items-center gap-3">
                          <Check className="h-5 w-5 text-green-500" />
                          <span>{benefit}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <Button 
                    size="lg" 
                    className="w-full mt-6"
                    onClick={handleContinue}
                  >
                    Continue with {plan.name} Plan
                  </Button>
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}