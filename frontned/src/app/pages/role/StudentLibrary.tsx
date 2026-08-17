"use client";

import { PageHeader } from "@/app/components/common/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "@tanstack/react-router";
import { useBorrowings } from "@/app/hooks/queries/useLibrary";
import { useAuth } from "@/app/hooks/useAuth";
import { HiOutlineBookOpen } from "react-icons/hi2";

export function StudentLibrary() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: borrowings = [], isLoading, error } = useBorrowings({ studentId: user?.id });

  if (error) {
    return (
      <div className="space-y-6">
        <PageHeader title="Library" description="View your borrowed books" />
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <HiOutlineBookOpen className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-lg font-medium">Unable to load library data</p>
            <p className="text-sm text-muted-foreground">Please try again later.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Library" description="View your borrowed books" />

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      ) : borrowings.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <HiOutlineBookOpen className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-lg font-medium">No Books Borrowed</p>
            <p className="text-sm text-muted-foreground">You have not borrowed any books yet.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {borrowings.map((borrowing) => (
            <Card key={borrowing.id}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium">{borrowing.bookTitle}</CardTitle>
                  <Badge
                    variant={
                      borrowing.status === "BORROWED"
                        ? "secondary"
                        : borrowing.status === "RETURNED"
                          ? "default"
                          : "destructive"
                    }
                  >
                    {borrowing.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  Borrowed: {new Date(borrowing.borrowedDate).toLocaleDateString()}
                </p>
                <p className="text-sm text-muted-foreground">
                  Due: {new Date(borrowing.dueDate).toLocaleDateString()}
                </p>
                {borrowing.returnedDate && (
                  <p className="text-sm text-muted-foreground">
                    Returned: {new Date(borrowing.returnedDate).toLocaleDateString()}
                  </p>
                )}
                {borrowing.fineAmount > 0 && (
                  <p className="text-sm text-destructive">Fine: ₹{borrowing.fineAmount}</p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
