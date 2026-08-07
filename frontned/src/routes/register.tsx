import { createFileRoute } from "@tanstack/react-router";
import { LoginPage } from "@/app/pages/auth/LoginPage";

export const Route = createFileRoute("/register")({
  head: () => ({
    meta: [
      { title: "Register — AI-CollegeOS" },
      { name: "description", content: "Register for AI-CollegeOS" },
    ],
  }),
  component: LoginPage,
});
