import { createFileRoute } from "@tanstack/react-router";
import { AICopilot } from "@/app/pages/ai/AICopilot";

export const Route = createFileRoute("/ai/copilot")({
  component: AICopilotPage,
});

function AICopilotPage() {
  return <AICopilot />;
}
