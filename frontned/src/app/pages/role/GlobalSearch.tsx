"use client";

import { useState, useMemo } from "react";
import { PageHeader } from "@/app/components/common/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "@tanstack/react-router";
import { useApplicants } from "@/app/hooks/queries/useApplicants";
import { useAdmissions } from "@/app/hooks/queries/useAdmissions";
import { useAuth } from "@/app/hooks/useAuth";
import { HiOutlineMagnifyingGlass, HiOutlineUserGroup } from "react-icons/hi2";
import { toast } from "sonner";

export function GlobalSearch() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<{ type: string; data: Record<string, unknown> }[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const {
    data: applicants = [],
    isLoading: applicantsLoading,
    error: applicantsError,
  } = useApplicants();
  const {
    data: admissions = [],
    isLoading: admissionsLoading,
    error: admissionsError,
  } = useAdmissions();

  const isLoading = applicantsLoading || admissionsLoading;
  const error = applicantsError || admissionsError;

  const handleSearch = async () => {
    if (!query.trim()) return;
    setIsSearching(true);

    try {
      const searchLower = query.toLowerCase();
      const matchedApplicants = applicants.filter(
        (a) =>
          a.fullName?.toLowerCase().includes(searchLower) ||
          a.email?.toLowerCase().includes(searchLower) ||
          a.applicationNumber?.toLowerCase().includes(searchLower),
      );

      const matchedAdmissions = admissions.filter((a) =>
        a.applicantName?.toLowerCase().includes(searchLower),
      );

      const combined = [
        ...matchedApplicants.map((a) => ({ type: "Applicant", data: a })),
        ...matchedAdmissions.map((a) => ({ type: "Admission", data: a })),
      ];

      setResults(combined);
    } catch (err) {
      toast.error("Search failed");
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Global Search"
        description="Search across applicants, admissions, and more"
      />

      <Card>
        <CardHeader>
          <CardTitle>Search</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              placeholder="Search by name, email, application number..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              className="flex-1"
            />
            <Button onClick={handleSearch} disabled={isSearching || isLoading}>
              {isSearching ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              ) : (
                <HiOutlineMagnifyingGlass className="h-4 w-4" />
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {error && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <HiOutlineMagnifyingGlass className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-lg font-medium">Unable to load search data</p>
            <p className="text-sm text-muted-foreground">Please try again later.</p>
          </CardContent>
        </Card>
      )}

      {!error && results.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Results ({results.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {results.map((result, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between rounded-md border p-3 cursor-pointer hover:bg-muted/50"
                  onClick={() => {
                    if (result.type === "Applicant") {
                      navigate({ to: "/applicants/$id", params: { id: result.data.id } });
                    } else {
                      navigate({ to: "/admissions/$id", params: { id: result.data.id } });
                    }
                  }}
                >
                  <div className="flex items-center gap-3">
                    <HiOutlineUserGroup className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">
                        {result.type === "Applicant"
                          ? result.data.fullName ||
                            `${result.data.firstName} ${result.data.lastName}`
                          : result.data.applicantName}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {result.type === "Applicant"
                          ? result.data.email
                          : `${result.data.courseName} - ${result.data.status}`}
                      </p>
                    </div>
                  </div>
                  <Badge variant="outline">{result.type}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {!error && query && !isSearching && results.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <HiOutlineMagnifyingGlass className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-lg font-medium">No Results Found</p>
            <p className="text-sm text-muted-foreground">Try adjusting your search query</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
