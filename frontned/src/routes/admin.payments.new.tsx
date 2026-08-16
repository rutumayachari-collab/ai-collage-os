import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/app/components/common/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const Route = createFileRoute("/admin/payments/new")({
  head: () => ({ meta: [{ title: "New Payment - NEXORA" }] }),
  component: NewPayment,
});

function NewPayment() {
  return (
    <div className="space-y-6">
      <PageHeader title="New Payment" description="Create a new payment record" />
      <Card>
        <CardHeader>
          <CardTitle>Payment Form</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Payment creation form will be implemented here.</p>
        </CardContent>
      </Card>
    </div>
  );
}
