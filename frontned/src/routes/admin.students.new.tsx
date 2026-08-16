import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/app/components/common/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const Route = createFileRoute("/admin/students/new")({
  head: () => ({ meta: [{ title: "New Student - NEXORA" }] }),
  component: NewStudent,
});

function NewStudent() {
  return (
    <div className="space-y-6">
      <PageHeader title="New Student" description="Create a new student record" />
      <Card>
        <CardHeader>
          <CardTitle>Student Form</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Student creation form will be implemented here.</p>
        </CardContent>
      </Card>
    </div>
  );
}
