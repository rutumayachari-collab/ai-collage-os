"use client";

import { useState } from "react";
import { PageHeader } from "@/app/components/common/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/app/components/tables/DataTable";
import { StatusBadge } from "@/app/components/common/StatusBadge";
import { ErrorState } from "@/app/components/common/ErrorState";
import { useNavigate } from "@tanstack/react-router";
import { usePayments } from "@/app/hooks/queries/usePayments";
import { usePaymentSummary } from "@/app/hooks/queries/usePayments";
import { useAuth } from "@/app/hooks/useAuth";
import { HiOutlineCurrencyRupee, HiOutlineMagnifyingGlass } from "react-icons/hi2";
import type { Payment } from "@/app/types/payment";

export function AdminPayments() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  const { data: paymentsData, isLoading, error } = usePayments({ search, status: statusFilter });
  const { data: summary } = usePaymentSummary();

  const payments = paymentsData?.items || [];
  const canCreate = user?.permissions.includes("payments:create");

  const columns = [
    { key: "applicantName", header: "Applicant" },
    { key: "courseName", header: "Course" },
    {
      key: "amount",
      header: "Amount",
      cell: (row: Payment) => `₹${row.amount.toLocaleString()}`,
    },
    {
      key: "status",
      header: "Status",
      cell: (row: Payment) => <StatusBadge status={row.status} />,
    },
    { key: "method", header: "Method" },
    { key: "provider", header: "Provider" },
    {
      key: "paidAt",
      header: "Paid At",
      cell: (row: Payment) => (row.paidAt ? new Date(row.paidAt).toLocaleDateString() : "-"),
    },
    {
      key: "createdAt",
      header: "Created",
      cell: (row: Payment) => new Date(row.createdAt).toLocaleDateString(),
    },
    {
      key: "actions",
      header: "Actions",
      cell: (row: Payment) => (
        <Button
          size="sm"
          variant="outline"
          onClick={() => navigate({ to: `/payments/${row.paymentId}` })}
        >
          View
        </Button>
      ),
    },
  ];

  if (error) {
    return (
      <div className="space-y-6">
        <PageHeader title="Payments" description="Payment management" />
        <ErrorState title="Failed to load payments" description={error.message} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Payments"
        description="Payment management"
        actions={
          canCreate ? (
            <Button onClick={() => navigate({ to: "/admin/payments/new" })}>
              <HiOutlineCurrencyRupee className="mr-2 h-4 w-4" />
              Record Payment
            </Button>
          ) : undefined
        }
      />

      {summary && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Collected</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">₹{summary.totalCollected.toLocaleString()}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">₹{summary.totalPending.toLocaleString()}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Refunded</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">₹{summary.totalRefunded.toLocaleString()}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Failed</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">₹{summary.totalFailed.toLocaleString()}</p>
            </CardContent>
          </Card>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>All Payments</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            data={payments}
            columns={columns}
            keyExtractor={(row) => row.paymentId}
            isLoading={isLoading}
            searchable
            searchPlaceholder="Search payments..."
            onSearchChange={setSearch}
            emptyState={{
              title: "No payments found",
              description: "Payment records will appear here.",
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
}
