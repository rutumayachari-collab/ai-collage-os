import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/app/components/common/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const Route = createFileRoute("/admin/departments/new")({
  head: () => ({ meta: [{ title: "New Department - NEXORA" }] }),
  component: NewDepartment,
});

function NewDepartment() {
  return (
    <div className="space-y-6">
      <PageHeader title="New Department" description="Create a new department" />
      <Card>
        <CardHeader>
          <CardTitle>Department Form</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Department creation form will be implemented here.</p>
        </CardContent>
      </Card>
    </div>
  );
}
