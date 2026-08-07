import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

const API_BASE = import.meta.env.VITE_API_URL || "";

type NotificationChannel = "IN_APP" | "EMAIL" | "WHATSAPP" | "SMS";
type NotificationPriority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";
type NotificationType = "INFO" | "WARNING" | "SUCCESS" | "ERROR";
type NotificationStatus = "PENDING" | "SENT" | "DELIVERED" | "READ" | "FAILED";

type Notification = {
  notificationId: string;
  recipient: {
    userId: string;
    userRole: string;
    email?: string;
    phone?: string;
    whatsappNumber?: string;
  };
  payload: {
    channel: NotificationChannel;
    priority: NotificationPriority;
    type: NotificationType;
    subject: string;
    body: string;
  };
  status: NotificationStatus;
  readAt?: string;
  createdAt: string;
};

type NotificationStats = {
  total: number;
  unread: number;
  read: number;
  failed: number;
  byChannel: Record<NotificationChannel, number>;
  byPriority: Record<NotificationPriority, number>;
};

export function NotificationsPage() {
  const queryClient = useQueryClient();
  const [userId, setUserId] = useState("");
  const [channel, setChannel] = useState<NotificationChannel>("IN_APP");
  const [priority, setPriority] = useState<NotificationPriority>("MEDIUM");
  const [type, setType] = useState<NotificationType>("INFO");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");

  const { data: stats } = useQuery({
    queryKey: ["notification-stats"],
    queryFn: async (): Promise<NotificationStats> => {
      const res = await fetch(`${API_BASE}/notifications/stats/summary`);
      if (!res.ok) throw new Error("Failed to fetch notification stats");
      return res.json();
    },
  });

  const { data: notifications, isLoading } = useQuery({
    queryKey: ["notifications"],
    queryFn: async (): Promise<{ items: Notification[]; total: number }> => {
      const res = await fetch(`${API_BASE}/notifications`);
      if (!res.ok) throw new Error("Failed to fetch notifications");
      return res.json();
    },
  });

  const sendMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`${API_BASE}/notifications/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipient: { userId: userId || "user-1", userRole: "ADMIN", email: "admin@example.com" },
          payload: { channel, priority, type, subject, body },
          createdBy: "user-1",
        }),
      });
      if (!res.ok) throw new Error("Failed to send notification");
      return res.json();
    },
    onSuccess: () => {
      toast.success("Notification sent");
      setSubject("");
      setBody("");
      queryClient.invalidateQueries();
    },
    onError: () => toast.error("Failed to send notification"),
  });

  const markAsReadMutation = useMutation({
    mutationFn: async (notificationId: string) => {
      const res = await fetch(`${API_BASE}/notifications/${notificationId}/read`, {
        method: "PATCH",
      });
      if (!res.ok) throw new Error("Failed to mark as read");
      return res.json();
    },
    onSuccess: () => {
      toast.success("Marked as read");
      queryClient.invalidateQueries();
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Notifications</h1>
        <p className="text-muted-foreground">
          Manage in-app, email, WhatsApp, and SMS notifications
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{stats?.total || 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Unread</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{stats?.unread || 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Read</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{stats?.read || 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Failed</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{stats?.failed || 0}</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="history" className="space-y-4">
        <TabsList>
          <TabsTrigger value="history">Notification History</TabsTrigger>
          <TabsTrigger value="send">Send Notification</TabsTrigger>
        </TabsList>

        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Notification History</CardTitle>
              <CardDescription>Total: {notifications?.total || 0}</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <p className="text-sm text-muted-foreground">Loading notifications...</p>
              ) : (
                <div className="space-y-3">
                  {notifications?.items?.map((notification) => (
                    <div
                      key={notification.notificationId}
                      className="flex items-start justify-between rounded-md border p-3"
                    >
                      <div className="space-y-1">
                        <p className="font-medium">{notification.payload.subject}</p>
                        <p className="text-sm text-muted-foreground">{notification.payload.body}</p>
                        <div className="flex items-center gap-2">
                          <Badge
                            variant={
                              notification.payload.channel === "EMAIL" ? "default" : "secondary"
                            }
                          >
                            {notification.payload.channel}
                          </Badge>
                          <Badge
                            variant={
                              notification.payload.priority === "URGENT" ? "destructive" : "outline"
                            }
                          >
                            {notification.payload.priority}
                          </Badge>
                          <Badge
                            variant={
                              notification.status === "READ"
                                ? "default"
                                : notification.status === "FAILED"
                                  ? "destructive"
                                  : "secondary"
                            }
                          >
                            {notification.status}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">
                          {new Date(notification.createdAt).toLocaleDateString()}
                        </span>
                        {notification.status !== "READ" && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => markAsReadMutation.mutate(notification.notificationId)}
                          >
                            Mark Read
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                  {!notifications?.items?.length && (
                    <p className="text-sm text-muted-foreground">No notifications found</p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="send" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Send Notification</CardTitle>
              <CardDescription>Send in-app, email, WhatsApp, or SMS notification</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Channel</label>
                  <Select
                    value={channel}
                    onValueChange={(value) => setChannel(value as NotificationChannel)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="IN_APP">In-App</SelectItem>
                      <SelectItem value="EMAIL">Email</SelectItem>
                      <SelectItem value="WHATSAPP">WhatsApp</SelectItem>
                      <SelectItem value="SMS">SMS</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Priority</label>
                  <Select
                    value={priority}
                    onValueChange={(value) => setPriority(value as NotificationPriority)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="LOW">Low</SelectItem>
                      <SelectItem value="MEDIUM">Medium</SelectItem>
                      <SelectItem value="HIGH">High</SelectItem>
                      <SelectItem value="URGENT">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Type</label>
                  <Select
                    value={type}
                    onValueChange={(value) => setType(value as NotificationType)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="INFO">Info</SelectItem>
                      <SelectItem value="WARNING">Warning</SelectItem>
                      <SelectItem value="SUCCESS">Success</SelectItem>
                      <SelectItem value="ERROR">Error</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Subject</label>
                  <input
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full rounded-md border px-3 py-2"
                    placeholder="Notification subject"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Body</label>
                <Textarea
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  placeholder="Notification body"
                  rows={4}
                />
              </div>
              <Button
                onClick={() => sendMutation.mutate()}
                disabled={sendMutation.isPending || !subject || !body}
              >
                {sendMutation.isPending ? "Sending..." : "Send Notification"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
