"use client";

import { useState } from "react";
import { PageHeader } from "@/app/components/common/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { admissionIntelligenceService } from "@/app/services/admission-intelligence.service";
import { useAuth } from "@/app/hooks/useAuth";
import { HiOutlineLightBulb, HiOutlineChartBar } from "react-icons/hi2";
import { toast } from "sonner";

export function AdmissionDigitalTwin() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [params, setParams] = useState({
    currentIntake: 120,
    proposedIntake: 180,
    applicantVolume: 2500,
    expectedConversionRate: 35,
    scholarshipBudget: 500000,
    processingCapacity: 100,
    verificationDays: 7,
    counselorCapacity: 50,
  });

  const {
    data: simulation,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["admission-digital-twin", params],
    queryFn: () => admissionIntelligenceService.getWhatIfSimulation(params),
    enabled: false,
  });

  const handleSimulate = async () => {
    try {
      await refetch();
      toast.success("Simulation completed");
    } catch (error) {
      toast.error("Simulation failed");
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Admission Digital Twin"
        description="What-if simulator for admission planning"
        actions={
          <Button onClick={() => navigate({ to: "/admission-intelligence" })}>
            <HiOutlineChartBar className="mr-2 h-4 w-4" />
            Full Analytics
          </Button>
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Scenario Parameters</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="currentIntake">Current Intake</Label>
              <Input
                id="currentIntake"
                type="number"
                value={params.currentIntake}
                onChange={(e) => setParams({ ...params, currentIntake: Number(e.target.value) })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="proposedIntake">Proposed Intake</Label>
              <Input
                id="proposedIntake"
                type="number"
                value={params.proposedIntake}
                onChange={(e) => setParams({ ...params, proposedIntake: Number(e.target.value) })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="applicantVolume">Applicant Volume</Label>
              <Input
                id="applicantVolume"
                type="number"
                value={params.applicantVolume}
                onChange={(e) => setParams({ ...params, applicantVolume: Number(e.target.value) })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="conversionRate">Expected Conversion Rate (%)</Label>
              <Input
                id="conversionRate"
                type="number"
                value={params.expectedConversionRate}
                onChange={(e) =>
                  setParams({ ...params, expectedConversionRate: Number(e.target.value) })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="scholarshipBudget">Scholarship Budget (₹)</Label>
              <Input
                id="scholarshipBudget"
                type="number"
                value={params.scholarshipBudget}
                onChange={(e) =>
                  setParams({ ...params, scholarshipBudget: Number(e.target.value) })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="verificationDays">Verification Time (days)</Label>
              <Input
                id="verificationDays"
                type="number"
                value={params.verificationDays}
                onChange={(e) => setParams({ ...params, verificationDays: Number(e.target.value) })}
              />
            </div>
            <Button onClick={handleSimulate} className="w-full" disabled={isLoading}>
              {isLoading ? "Simulating..." : "Run Simulation"}
            </Button>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Simulation Results</CardTitle>
          </CardHeader>
          <CardContent>
            {!simulation ? (
              <div className="flex flex-col items-center justify-center py-12">
                <HiOutlineLightBulb className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-lg font-medium">No Simulation Run</p>
                <p className="text-sm text-muted-foreground">
                  Configure parameters and run a simulation to see projected outcomes.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-md border p-4">
                    <p className="text-sm font-medium text-muted-foreground">
                      Projected Admissions
                    </p>
                    <p className="text-2xl font-bold">
                      {String(
                        (simulation as Record<string, unknown>)?.projectedAdmissions ??
                          Math.round(
                            params.applicantVolume * (params.expectedConversionRate / 100),
                          ),
                      )}
                    </p>
                  </div>
                  <div className="rounded-md border p-4">
                    <p className="text-sm font-medium text-muted-foreground">Seat Occupancy</p>
                    <p className="text-2xl font-bold">
                      {String(
                        (simulation as Record<string, unknown>)?.seatOccupancy ??
                          `${Math.round((params.proposedIntake / params.applicantVolume) * 100)}%`,
                      )}
                    </p>
                  </div>
                  <div className="rounded-md border p-4">
                    <p className="text-sm font-medium text-muted-foreground">Counselor Workload</p>
                    <p className="text-2xl font-bold">
                      {String(
                        (simulation as Record<string, unknown>)?.counselorWorkload ??
                          `${Math.round(params.applicantVolume / params.counselorCapacity)} per counselor`,
                      )}
                    </p>
                  </div>
                  <div className="rounded-md border p-4">
                    <p className="text-sm font-medium text-muted-foreground">Expected Revenue</p>
                    <p className="text-2xl font-bold">
                      {(simulation as Record<string, unknown>)?.expectedRevenue
                        ? `₹${String((simulation as Record<string, unknown>)?.expectedRevenue as number).toLocaleString()}`
                        : "Insufficient data"}
                    </p>
                  </div>
                </div>

                {Array.isArray((simulation as Record<string, unknown>)?.recommendations) &&
                  ((simulation as Record<string, unknown>).recommendations as string[]).length >
                    0 && (
                    <div className="rounded-md border p-4">
                      <p className="font-medium mb-2">Recommendations</p>
                      <ul className="space-y-2">
                        {((simulation as Record<string, unknown>)?.recommendations as string[]).map(
                          (rec: string, index: number) => (
                            <li key={index} className="text-sm text-muted-foreground">
                              • {rec}
                            </li>
                          ),
                        )}
                      </ul>
                    </div>
                  )}

                {Array.isArray((simulation as Record<string, unknown>)?.bottlenecks) &&
                  ((simulation as Record<string, unknown>).bottlenecks as string[]).length > 0 && (
                    <div className="rounded-md border p-4">
                      <p className="font-medium mb-2">Bottlenecks</p>
                      <ul className="space-y-2">
                        {((simulation as Record<string, unknown>)?.bottlenecks as string[]).map(
                          (bottleneck: string, index: number) => (
                            <li key={index} className="text-sm text-muted-foreground">
                              • {bottleneck}
                            </li>
                          ),
                        )}
                      </ul>
                    </div>
                  )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
