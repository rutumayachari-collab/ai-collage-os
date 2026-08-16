import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/app/components/common/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const Route = createFileRoute("/admin/notifications/new")({
  head: () => ({ meta: [{ title: "New Notification - NEXORA" }] }),
  component: NewNotification,
});

function NewNotification() {
  return (
    <div className="space-y-6">
      <PageHeader title="New Notification" description="Send a new notification" />
      <Card>
        <CardHeader>
          <CardTitle>Notification Form</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Notification creation form will be implemented here.</p>
        </CardContent>
      </Card>
    </div>
  );
}
