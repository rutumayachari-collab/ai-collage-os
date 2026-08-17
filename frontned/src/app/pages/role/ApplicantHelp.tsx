"use client";

import { PageHeader } from "@/app/components/common/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "@tanstack/react-router";
import {
  HiOutlineQuestionMarkCircle,
  HiOutlineChatBubbleLeftRight,
  HiOutlinePhone,
  HiOutlineEnvelope,
  HiOutlineBookOpen,
  HiOutlineUser,
} from "react-icons/hi2";

export function ApplicantHelp() {
  const navigate = useNavigate();

  const faqs = [
    {
      question: "How do I submit my application?",
      answer:
        "Go to the Application page and fill in all required details. Upload your documents and submit the form.",
    },
    {
      question: "How can I check my eligibility?",
      answer: "Visit the Eligibility page to view your eligibility score and status.",
    },
    {
      question: "What documents do I need to upload?",
      answer:
        "You need to upload your photo, ID proof, marksheets, and certificates. Check the Documents page for a complete list.",
    },
    {
      question: "How do I make a payment?",
      answer: "Go to the Payments page to view your fee details and make payments online.",
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader title="Help & Support" description="Get help and support for your application" />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card
          className="hover:shadow-md transition-shadow cursor-pointer"
          onClick={() => navigate({ to: "/inquiries" })}
        >
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Contact Support</CardTitle>
          </CardHeader>
          <CardContent>
            <HiOutlineChatBubbleLeftRight className="h-8 w-8 text-primary mb-2" />
            <p className="text-xs text-muted-foreground">Reach out to our support team</p>
          </CardContent>
        </Card>
        <Card
          className="hover:shadow-md transition-shadow cursor-pointer"
          onClick={() => navigate({ to: "/applicant/counsellor" })}
        >
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">My Counsellor</CardTitle>
          </CardHeader>
          <CardContent>
            <HiOutlineUser className="h-8 w-8 text-primary mb-2" />
            <p className="text-xs text-muted-foreground">Talk to your assigned counsellor</p>
          </CardContent>
        </Card>
        <Card
          className="hover:shadow-md transition-shadow cursor-pointer"
          onClick={() => navigate({ to: "/ai/copilot" })}
        >
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">AI Assistant</CardTitle>
          </CardHeader>
          <CardContent>
            <HiOutlineQuestionMarkCircle className="h-8 w-8 text-primary mb-2" />
            <p className="text-xs text-muted-foreground">Get AI-powered assistance</p>
          </CardContent>
        </Card>
        <Card
          className="hover:shadow-md transition-shadow cursor-pointer"
          onClick={() => window.open("mailto:support@nexora.edu")}
        >
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Email Support</CardTitle>
          </CardHeader>
          <CardContent>
            <HiOutlineEnvelope className="h-8 w-8 text-primary mb-2" />
            <p className="text-xs text-muted-foreground">Send us an email</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Frequently Asked Questions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div key={index} className="border-b pb-4 last:border-b-0">
                <p className="font-medium text-sm">{faq.question}</p>
                <p className="text-sm text-muted-foreground mt-1">{faq.answer}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Contact Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Phone</p>
              <p className="text-base">+91 1800-123-4567</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Email</p>
              <p className="text-base">support@nexora.edu</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Working Hours</p>
              <p className="text-base">Mon - Fri, 9:00 AM - 6:00 PM</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Address</p>
              <p className="text-base">NEXORA AI Campus, Education City</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
