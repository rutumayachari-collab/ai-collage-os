import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { paymentService } from "@/app/services/payment.service";
import type { PaymentSummary } from "@/app/types/payment";

export function PaymentSummary() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["payment-summary"],
    queryFn: () => paymentService.getSummary(),
  });

  if (isLoading) return <div className="text-muted-foreground">Loading payment summary...</div>;
  if (error) {
    toast.error("Failed to load payment summary");
    return <div className="text-red-500">Error loading payment summary</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Payment Summary</h1>
        <p className="text-muted-foreground">Overview of payment collections</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Fee</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">₹{data?.totalFee?.toLocaleString() || 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Paid Amount</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">₹{data?.paidAmount?.toLocaleString() || 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Pending Amount</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">₹{data?.pendingAmount?.toLocaleString() || 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Payment Status</CardTitle>
          </CardHeader>
          <CardContent>
            <Badge variant={data?.paymentStatus === "PAID" ? "default" : "secondary"}>
              {data?.paymentStatus || "PENDING"}
            </Badge>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
