import { createFileRoute } from "@tanstack/react-router";
import { NotificationsPage } from "@/app/pages/notifications/NotificationsPage";

export const Route = createFileRoute("/notifications")({
  component: Notifications,
});

function Notifications() {
  return <NotificationsPage />;
}
