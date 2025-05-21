import { useContext, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Check } from "lucide-react";
import { RentalApplicationContext } from "@/contexts/rental-application-context";
import Link from "next/link";

const membershipPlans = [
  {
    id: "bronze",
    name: "Bronze",
    price: 4.99,
    benefits: [
      "Standard application processing",
      "Basic background check",
      "Landlord certification check and reference letter",
      "48-hour response time",
    ],
  },
  {
    id: "silver",
    name: "Silver",
    price: 9.99,
    benefits: [
      "Priority application processing",
      "Comprehensive background check",
      "Credit score insights",
      "24/7 phone support",
      "24-hour response time",
      "Rental history verification",
    ],
  },
  {
    id: "gold",
    name: "Gold",
    price: 24.99,
    benefits: [
      "Instant application processing",
      "Advanced background check",
      "Full credit report",
      "Dedicated support agent",
      "Instant response time",
      "Rental history verification",
      "Income verification",
      "Guaranteed approval decision",
    ],
  },
];

const Plans = () => {
  const [selectedPlan, setSelectedPlan] = useState("bronze");

  return (
    <div>
      <div className="container mx-auto py-8 px-4">
        <Card className="max-w-6xl mx-auto">
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-center">
              Renting is better as a Member
            </CardTitle>
            <p className="text-center text-muted-foreground mt-2">
              Select the plan that best fits your needs
            </p>
          </CardHeader>
          <CardContent>
            <Tabs
              value={selectedPlan}
              onValueChange={setSelectedPlan}
              className="w-full "
            >
              <TabsList className="grid w-full grid-cols-3 mb-8 ">
                {membershipPlans.map((plan) => (
                  <TabsTrigger
                    key={plan.id}
                    value={plan.id}
                    className={`relative ${
                      selectedPlan === plan.name ? "bg-black" : ""
                    }`}
                  >
                    <div className="">
                      <div className="font-semibold">{plan.name}</div>
                      <div className="text-sm text-muted-foreground">
                        ${plan.price}/mo
                      </div>
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

                    <Link
                      href={`https://rented123.com/sign-up/${plan.id}`}
                      target="_blank"
                    >
                      {" "}
                      <Button
                        size="lg"
                        className="w-full mt-6"
                        //onClick={handleContinue}
                      >
                        Continue with {plan.name} Plan
                      </Button>
                    </Link>
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Plans;
