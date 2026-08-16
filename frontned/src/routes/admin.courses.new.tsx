import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/app/components/common/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const Route = createFileRoute("/admin/courses/new")({
  head: () => ({ meta: [{ title: "New Course - NEXORA" }] }),
  component: NewCourse,
});

function NewCourse() {
  return (
    <div className="space-y-6">
      <PageHeader title="New Course" description="Create a new course" />
      <Card>
        <CardHeader>
          <CardTitle>Course Form</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Course creation form will be implemented here.</p>
        </CardContent>
      </Card>
    </div>
  );
}
