import React, { useState } from 'react';
import { Bell } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { useNotifications } from '@/lib/notifications';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from 'date-fns';

const NotificationBell = () => {
  const { alerts, unreadCount, markAsRead, markAllAsRead, clearAlerts } = useNotifications();
  const [open, setOpen] = useState(false);

  const handleAlertClick = (id: string) => {
    markAsRead(id);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'danger':
        return 'bg-red-100 border-l-4 border-red-500';
      case 'warning':
        return 'bg-amber-100 border-l-4 border-amber-500';
      case 'info':
      default:
        return 'bg-blue-100 border-l-4 border-blue-500';
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge variant="destructive" className="absolute -top-1 -right-1 px-1.5 py-0.5 min-w-[1.25rem] h-5 rounded-full text-xs font-semibold">
              {unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between p-3 border-b">
          <h2 className="font-semibold text-sm">Notifications</h2>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="h-7 text-xs" onClick={markAllAsRead}>
              Mark all read
            </Button>
            <Button variant="outline" size="sm" className="h-7 text-xs" onClick={clearAlerts}>
              Clear all
            </Button>
          </div>
        </div>
        
        <ScrollArea className="h-[300px]">
          {alerts.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-20 p-4 text-muted-foreground">
              <p>No notifications</p>
            </div>
          ) : (
            <div className="flex flex-col">
              {alerts.map((alert) => (
                <div
                  key={alert.id}
                  className={`${getStatusColor(alert.status)} p-3 ${!alert.read ? 'bg-opacity-80' : 'bg-opacity-30'} border-b cursor-pointer`}
                  onClick={() => handleAlertClick(alert.id)}
                >
                  <div className="flex justify-between items-start">
                    <p className="font-medium text-sm">{alert.category} Budget</p>
                    <span className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(alert.timestamp), { addSuffix: true })}
                    </span>
                  </div>
                  <p className="text-sm mt-1">{alert.message}</p>
                  {!alert.read && (
                    <span className="inline-block h-2 w-2 rounded-full bg-blue-500 ml-1" />
                  )}
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
};

export default NotificationBell;