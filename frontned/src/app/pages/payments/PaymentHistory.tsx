import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { paymentService } from "@/app/services/payment.service";
import type { Payment } from "@/app/types/payment";

export function PaymentHistory() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["payments"],
    queryFn: () => paymentService.getAll(),
  });

  if (isLoading) return <div className="text-muted-foreground">Loading payments...</div>;
  if (error) {
    toast.error("Failed to load payments");
    return <div className="text-red-500">Error loading payments</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Payment History</h1>
        <p className="text-muted-foreground">Track all payment transactions</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Payments</CardTitle>
          <CardDescription>Total: {data?.total || 0} payments</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {data?.items?.map((payment) => (
              <div
                key={payment.paymentId}
                className="flex items-center justify-between rounded-md border p-3"
              >
                <div>
                  <p className="font-medium">{payment.applicantName}</p>
                  <p className="text-sm text-muted-foreground">{payment.courseName}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(payment.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-medium">₹{payment.amount.toLocaleString()}</p>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={
                        payment.status === "PAID"
                          ? "default"
                          : payment.status === "PENDING"
                            ? "secondary"
                            : "destructive"
                      }
                    >
                      {payment.status}
                    </Badge>
                    <span className="text-xs text-muted-foreground">{payment.method}</span>
                  </div>
                </div>
              </div>
            ))}
            {!data?.items?.length && (
              <p className="text-sm text-muted-foreground">No payments found</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
