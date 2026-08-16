import { createFileRoute } from "@tanstack/react-router";
import { RegisterPage } from "@/app/pages/auth/RegisterPage";

export const Route = createFileRoute("/register")({
  head: () => ({
    meta: [
      { title: "Register — NEXORA AI CAMPUSOS" },
      { name: "description", content: "Register for NEXORA AI CAMPUSOS" },
    ],
  }),
  component: RegisterPage,
});
