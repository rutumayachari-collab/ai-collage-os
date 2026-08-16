"use client";

import { PageHeader } from "@/app/components/common/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/app/hooks/useAuth";
import { useApplicants } from "@/app/hooks/queries/useApplicants";
import { useQuery } from "@tanstack/react-query";
import { paymentService } from "@/app/services/payment.service";
import {
  HiOutlineCurrencyRupee,
  HiOutlineCheckCircle,
  HiOutlineClock,
} from "react-icons/hi2";
import { toast } from "sonner";

export function ApplicantPayments() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { data: applicants = [] } = useApplicants({ studentId: user?.id });
  const applicant = applicants[0];

  const { data, isLoading, error } = useQuery({
    queryKey: ["payments", applicant?.id],
    queryFn: () => paymentService.getAll({ applicantId: applicant?.id }),
    enabled: !!applicant?.id,
  });

  if (error) {
    toast.error("Failed to load payments");
  }

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "COMPLETED": return "default";
      case "PENDING": return "secondary";
      case "FAILED": return "destructive";
      default: return "outline";
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Payments"
        description="View your payment history"
        actions={
          <Button onClick={() => navigate({ to: "/payments/summary" })}>
            <HiOutlineCurrencyRupee className="mr-2 h-4 w-4" />
            Payment Summary
          </Button>
        }
      />

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      ) : (
        <div className="grid gap-4">
          {data?.items?.map((payment) => (
            <Card key={payment.paymentId}>
              <CardContent className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-4">
                <div>
                  <p className="font-medium">{payment.courseName}</p>
                  <p className="text-sm text-muted-foreground">
                    Paid on: {payment.paidAt ? new Date(payment.paidAt).toLocaleDateString() : "Pending"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Method: {payment.method} via {payment.provider}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold">₹{payment.amount.toLocaleString()}</p>
                  <Badge variant={getStatusVariant(payment.status)}>{payment.status}</Badge>
                </div>
              </CardContent>
            </Card>
          ))}
          {(!data?.items?.length) && (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <HiOutlineCurrencyRupee className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-lg font-medium">No Payments Found</p>
                <p className="text-sm text-muted-foreground">Your payment history will appear here once payments are made.</p>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
