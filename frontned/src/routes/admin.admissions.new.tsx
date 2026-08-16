import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/app/components/common/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/admin/admissions/new")({
  head: () => ({ meta: [{ title: "New Admission - NEXORA" }] }),
  component: NewAdmission,
});

function NewAdmission() {
  return (
    <div className="space-y-6">
      <PageHeader title="New Admission" description="Create a new admission record" />
      <Card>
        <CardHeader>
          <CardTitle>Admission Form</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Admission creation form will be implemented here.</p>
        </CardContent>
      </Card>
    </div>
  );
}
