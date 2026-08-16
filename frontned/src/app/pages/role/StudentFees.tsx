"use client";

import { PageHeader } from "@/app/components/common/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { paymentService } from "@/app/services/payment.service";
import { studentService } from "@/app/services/student.service";
import {
  HiOutlineCurrencyRupee,
  HiOutlineCheckCircle,
  HiOutlineClock,
  HiOutlineDocumentText,
  HiOutlineExclamationTriangle,
  HiOutlineArrowPath,
} from "react-icons/hi2";
import { toast } from "sonner";

export function StudentFees() {
  const navigate = useNavigate();

  const { data: student, isLoading: studentLoading, error: studentError, refetch: refetchStudent } = useQuery({
    queryKey: ["students", "me"],
    queryFn: () => studentService.getMyProfile(),
  });

  const { data: paymentData, isLoading: paymentLoading, error: paymentError, refetch: refetchPayment } = useQuery({
    queryKey: ["payments"],
    queryFn: () => paymentService.getSummary(),
  });

  const isLoading = studentLoading || paymentLoading;
  const error = studentError || paymentError;

  if (error) {
    toast.error("Failed to load fee details");
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
        title="Fees"
        description="View and manage your fee payments"
        actions={
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => refetchPayment()}>
              <HiOutlineArrowPath className="mr-2 h-4 w-4" />
              Refresh
            </Button>
            <Button variant="outline" onClick={() => navigate({ to: "/payments/history" })}>
              <HiOutlineDocumentText className="mr-2 h-4 w-4" />
              Payment History
            </Button>
          </div>
        }
      />

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      ) : error ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <HiOutlineExclamationTriangle className="h-10 w-10 text-destructive mb-3" />
            <p className="text-sm font-medium">Failed to load fee details</p>
            <Button className="mt-4" variant="outline" onClick={() => { refetchStudent(); refetchPayment(); }}>
              Try Again
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Fee</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">
                  ₹{((paymentData?.totalCollected || 0) + (paymentData?.totalPending || 0)).toLocaleString()}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Paid</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">₹{paymentData?.totalCollected?.toLocaleString() || "0"}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Pending</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">₹{paymentData?.totalPending?.toLocaleString() || "0"}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Fee Status</CardTitle>
              </CardHeader>
              <CardContent>
                <Badge variant={(paymentData?.totalPending || 0) > 0 ? "secondary" : "default"}>
                  {(paymentData?.totalPending || 0) > 0 ? "Pending Payment" : "Fully Paid"}
                </Badge>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Recent Payments</CardTitle>
            </CardHeader>
            <CardContent>
              {paymentLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center justify-between rounded-md border p-3">
                    <div>
                      <p className="font-medium">Tuition Fee - Semester {student?.semester || "Current"}</p>
                      <p className="text-sm text-muted-foreground">Status: {student?.feeStatus || "Pending"}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">
                        ₹{((paymentData?.totalCollected || 0) / 2).toLocaleString()}
                      </p>
                      <Badge variant={student?.feeStatus === "PAID" ? "default" : "secondary"}>
                        {student?.feeStatus || "PENDING"}
                      </Badge>
                    </div>
                  </div>
                  {paymentData && paymentData.totalPending > 0 && (
                    <div className="flex items-center justify-between rounded-md border p-3">
                      <div>
                        <p className="font-medium">Remaining Balance</p>
                        <p className="text-sm text-muted-foreground">Due for current semester</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">₹{paymentData.totalPending.toLocaleString()}</p>
                        <Badge variant="secondary">PENDING</Badge>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-dashed">
            <CardContent className="flex items-start gap-3 py-4">
              <HiOutlineExclamationTriangle className="h-5 w-5 text-amber-500 mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-medium">Backend integration needed</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Detailed fee breakdown, individual payment records, and receipt generation require implementation of{" "}
                  <code className="rounded bg-muted px-1 py-0.5 text-xs">
                    GET /students/me/fees, GET /payments/student/:id
                  </code>
                  .
                </p>
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-2">
            <Button variant="outline" onClick={() => navigate({ to: "/payments/summary" })}>
              <HiOutlineCurrencyRupee className="mr-2 h-4 w-4" />
              Payment Summary
            </Button>
            <Button variant="outline" onClick={() => navigate({ to: "/payments/history" })}>
              <HiOutlineDocumentText className="mr-2 h-4 w-4" />
              Payment History
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
