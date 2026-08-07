"use client";

import { useState, useRef, useEffect } from "react";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Notification {
  id: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
}

const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: "1",
    title: "New Application",
    message: "Priya Sharma submitted a new application",
    time: "2 min ago",
    read: false,
  },
  {
    id: "2",
    title: "Document Verified",
    message: "Arjun Kumar's documents have been verified",
    time: "15 min ago",
    read: false,
  },
  {
    id: "3",
    title: "Admission Approved",
    message: "Meera Reddy's admission has been approved",
    time: "1 hour ago",
    read: true,
  },
];

interface NotificationDropdownProps {
  children: React.ReactNode;
}

export function NotificationDropdown({ children }: NotificationDropdownProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const unreadCount = MOCK_NOTIFICATIONS.filter((n) => !n.read).length;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button onClick={() => setOpen((v) => !v)} className="relative">
        {children}
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-medium text-destructive-foreground">
            {unreadCount}
          </span>
        )}
      </button>
      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-80 rounded-lg border bg-card shadow-lg">
          <div className="border-b px-4 py-3">
            <h3 className="font-semibold">Notifications</h3>
          </div>
          <div className="max-h-96 overflow-y-auto">
            {MOCK_NOTIFICATIONS.length === 0 ? (
              <div className="p-4 text-center text-sm text-muted-foreground">No notifications</div>
            ) : (
              MOCK_NOTIFICATIONS.map((notification) => (
                <div
                  key={notification.id}
                  className={cn(
                    "border-b px-4 py-3 last:border-b-0 hover:bg-accent/50",
                    !notification.read && "bg-accent/30",
                  )}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-medium">{notification.title}</p>
                      <p className="text-xs text-muted-foreground">{notification.message}</p>
                      <p className="mt-1 text-xs text-muted-foreground">{notification.time}</p>
                    </div>
                    {!notification.read && (
                      <span className="ml-2 h-2 w-2 rounded-full bg-primary" />
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
          <div className="border-t p-2">
            <Button variant="ghost" className="w-full text-sm" onClick={() => setOpen(false)}>
              View all notifications
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
