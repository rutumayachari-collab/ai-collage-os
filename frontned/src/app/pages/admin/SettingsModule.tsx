"use client";

import { useState } from "react";
import { PageHeader } from "@/app/components/common/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSettings, useUpdateSettings } from "@/app/hooks/queries/useAdmin";
import {
  HiOutlineAcademicCap,
  HiOutlineDocumentText,
  HiOutlineSparkles,
  HiOutlineBell,
} from "react-icons/hi2";

export function SettingsModule() {
  const { data: settings, isLoading } = useSettings();
  const updateMutation = useUpdateSettings();
  const [activeTab, setActiveTab] = useState("academic");

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  const handleSave = async (updates: Record<string, unknown>) => {
    await updateMutation.mutateAsync(updates);
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Settings" description="Manage system configuration" />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList>
          <TabsTrigger value="academic">Academic Year</TabsTrigger>
          <TabsTrigger value="admission">Admission Round</TabsTrigger>
          <TabsTrigger value="departments">Departments</TabsTrigger>
          <TabsTrigger value="courses">Courses</TabsTrigger>
          <TabsTrigger value="scholarships">Scholarships</TabsTrigger>
          <TabsTrigger value="ai">AI Configuration</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
        </TabsList>

        <TabsContent value="academic">
          <Card>
            <CardHeader>
              <CardTitle>Academic Year Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="academicYear">Current Academic Year</Label>
                <Input
                  id="academicYear"
                  defaultValue={settings?.academicYear || "2024-25"}
                  onBlur={(e) => handleSave({ academicYear: e.target.value })}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="admission">
          <Card>
            <CardHeader>
              <CardTitle>Admission Round Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="admissionRound">Current Admission Round</Label>
                <Input
                  id="admissionRound"
                  defaultValue={settings?.admissionRound || "Round 1"}
                  onBlur={(e) => handleSave({ admissionRound: e.target.value })}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="departments">
          <Card>
            <CardHeader>
              <CardTitle>Departments</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">Manage department configurations</p>
              <Button>Add Department</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="courses">
          <Card>
            <CardHeader>
              <CardTitle>Courses</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">Manage course configurations</p>
              <Button>Add Course</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="scholarships">
          <Card>
            <CardHeader>
              <CardTitle>Scholarships</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Manage scholarship configurations
              </p>
              <Button>Add Scholarship</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ai">
          <Card>
            <CardHeader>
              <CardTitle>AI Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Enable AI Features</p>
                  <p className="text-sm text-muted-foreground">Enable AI-powered recommendations</p>
                </div>
                <Switch
                  checked={settings?.aiConfiguration?.enabled ?? true}
                  onCheckedChange={(checked) =>
                    handleSave({
                      aiConfiguration: { ...settings?.aiConfiguration, enabled: checked },
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="threshold">AI Threshold</Label>
                <Input
                  id="threshold"
                  type="number"
                  defaultValue={settings?.aiConfiguration?.threshold || 80}
                  onBlur={(e) =>
                    handleSave({
                      aiConfiguration: {
                        ...settings?.aiConfiguration,
                        threshold: parseInt(e.target.value),
                      },
                    })
                  }
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notification Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Email Notifications</p>
                  <p className="text-sm text-muted-foreground">Send notifications via email</p>
                </div>
                <Switch
                  checked={settings?.notifications?.email ?? true}
                  onCheckedChange={(checked) =>
                    handleSave({ notifications: { ...settings?.notifications, email: checked } })
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">SMS Notifications</p>
                  <p className="text-sm text-muted-foreground">Send notifications via SMS</p>
                </div>
                <Switch
                  checked={settings?.notifications?.sms ?? false}
                  onCheckedChange={(checked) =>
                    handleSave({ notifications: { ...settings?.notifications, sms: checked } })
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">WhatsApp Notifications</p>
                  <p className="text-sm text-muted-foreground">Send notifications via WhatsApp</p>
                </div>
                <Switch
                  checked={settings?.notifications?.whatsapp ?? false}
                  onCheckedChange={(checked) =>
                    handleSave({ notifications: { ...settings?.notifications, whatsapp: checked } })
                  }
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
