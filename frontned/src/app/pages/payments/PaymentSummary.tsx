import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

const API_BASE = import.meta.env.VITE_API_URL || "";

type PaymentSummary = {
  totalCollected: number;
  totalPending: number;
  totalRefunded: number;
  totalFailed: number;
  byMethod: Record<string, number>;
  byStatus: Record<string, number>;
};

export function PaymentSummary() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["payment-summary"],
    queryFn: async (): Promise<PaymentSummary> => {
      const res = await fetch(`${API_BASE}/payments/summary`);
      if (!res.ok) throw new Error("Failed to fetch payment summary");
      return res.json();
    },
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
            <CardTitle className="text-sm font-medium">Total Collected</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">₹{data?.totalCollected?.toLocaleString() || 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">₹{data?.totalPending?.toLocaleString() || 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Refunded</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">₹{data?.totalRefunded?.toLocaleString() || 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Failed</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">₹{data?.totalFailed?.toLocaleString() || 0}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>By Method</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {data?.byMethod &&
                Object.entries(data.byMethod).map(([method, count]) => (
                  <div key={method} className="flex items-center justify-between">
                    <span className="text-sm">{method}</span>
                    <Badge variant="secondary">{count}</Badge>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>By Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {data?.byStatus &&
                Object.entries(data.byStatus).map(([status, count]) => (
                  <div key={status} className="flex items-center justify-between">
                    <span className="text-sm">{status}</span>
                    <Badge
                      variant={
                        status === "COMPLETED"
                          ? "default"
                          : status === "PENDING"
                            ? "secondary"
                            : "destructive"
                      }
                    >
                      {count}
                    </Badge>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
