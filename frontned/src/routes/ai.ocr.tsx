import { createFileRoute } from "@tanstack/react-router";
import { OCRProcessing } from "@/app/pages/ai/OCRProcessing";

export const Route = createFileRoute("/ai/ocr")({
  component: OCRProcessingPage,
});

function OCRProcessingPage() {
  return <OCRProcessing />;
}
