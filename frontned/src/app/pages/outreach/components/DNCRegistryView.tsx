"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { ShieldAlert, Plus, Search, CheckCircle2, UserX } from "lucide-react";
import { callingAgentService } from "@/app/services/calling-agent.service";
import type { DoNotCallItem } from "@/app/types/outreach";
import { toast } from "sonner";

interface DNCRegistryViewProps {
  dncList: DoNotCallItem[];
  onRefresh: () => void;
}

export function DNCRegistryView({ dncList, onRefresh }: DNCRegistryViewProps) {
  const [search, setSearch] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newPhone, setNewPhone] = useState("");
  const [newReason, setNewReason] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  const filtered = dncList.filter(
    (d) =>
      d.phone.includes(search) ||
      (d.studentName && d.studentName.toLowerCase().includes(search.toLowerCase())) ||
      (d.reason && d.reason.toLowerCase().includes(search.toLowerCase())),
  );

  const handleAddDnc = async () => {
    if (!newPhone.trim()) {
      toast.error("Please enter a valid phone number");
      return;
    }

    setIsAdding(true);
    try {
      await callingAgentService.addDnc(newPhone.trim(), newReason.trim());
      toast.success("Number added to Do Not Call registry");
      setIsAddModalOpen(false);
      setNewPhone("");
      setNewReason("");
      onRefresh();
    } catch (err: unknown) {
      const error = err as Record<string, unknown>;
      toast.error((error?.message as string) || "Failed to add to DNC registry");
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <Card className="panel p-5 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/60 pb-3">
        <div className="flex items-center gap-2">
          <ShieldAlert className="size-5 text-destructive" />
          <div>
            <h3 className="font-display font-semibold text-base">
              Do Not Call (DNC) Suppression Registry
            </h3>
            <p className="text-xs text-muted-foreground">
              Numbers in this registry are automatically excluded from all current and future
              admission campaigns
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative w-full sm:w-60">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              placeholder="Search phone or student..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-8 text-xs"
            />
          </div>

          <Button
            size="sm"
            onClick={() => setIsAddModalOpen(true)}
            className="gap-1.5 h-8 text-xs shrink-0"
          >
            <Plus className="size-4" />
            Add Number
          </Button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-xs text-left">
          <thead>
            <tr className="text-muted-foreground border-b border-border/60 bg-muted/20">
              <th className="py-2.5 px-3 font-semibold">Phone Number</th>
              <th className="py-2.5 px-3 font-semibold">Student Name</th>
              <th className="py-2.5 px-3 font-semibold">Opt-Out Reason</th>
              <th className="py-2.5 px-3 font-semibold">Requested At</th>
              <th className="py-2.5 px-3 font-semibold text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/40">
            {filtered.map((d, idx) => (
              <tr key={idx} className="hover:bg-destructive/5 transition-colors">
                <td className="py-2.5 px-3 font-mono font-semibold text-foreground">{d.phone}</td>
                <td className="py-2.5 px-3 text-muted-foreground">
                  {d.studentName || "Self / Prospective Lead"}
                </td>
                <td className="py-2.5 px-3 text-muted-foreground">
                  {d.reason || "Opted out during admission outreach call"}
                </td>
                <td className="py-2.5 px-3 text-muted-foreground font-mono">
                  {new Date(d.requestedAt).toLocaleDateString()}
                </td>
                <td className="py-2.5 px-3 text-right">
                  <Badge variant="destructive" className="text-[10px]">
                    Suppressed
                  </Badge>
                </td>
              </tr>
            ))}

            {filtered.length === 0 && (
              <tr>
                <td colSpan={5} className="py-8 text-center text-muted-foreground space-y-1">
                  <UserX className="size-8 text-muted-foreground mx-auto opacity-50 mb-2" />
                  <p className="font-medium">No numbers registered in Do Not Call registry</p>
                  <p className="text-[11px]">
                    Leads requesting opt-out during calls will be automatically cataloged here.
                  </p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Add Number Modal */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add Number to DNC Registry</DialogTitle>
            <DialogDescription>
              Suppress this phone number from receiving future automated admission outreach calls.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2 text-xs">
            <div className="space-y-1">
              <Label className="text-xs">Phone Number (10 digits with country code)</Label>
              <Input
                placeholder="+91-9876543210"
                value={newPhone}
                onChange={(e) => setNewPhone(e.target.value)}
                className="text-sm font-mono"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Reason for Opt-Out</Label>
              <Input
                placeholder="e.g. Student requested removal / Enrolled elsewhere"
                value={newReason}
                onChange={(e) => setNewReason(e.target.value)}
                className="text-sm"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddModalOpen(false)} disabled={isAdding}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleAddDnc}
              disabled={isAdding}
              className="gap-1.5"
            >
              <CheckCircle2 className="size-4" />
              Add to Suppression List
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
