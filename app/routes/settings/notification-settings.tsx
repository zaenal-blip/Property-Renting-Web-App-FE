import { useState } from "react";
import { toast } from "sonner";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Label } from "~/components/ui/label";
import { Switch } from "~/components/ui/switch";
import { Separator } from "~/components/ui/separator";

// Simulated notification preferences (local state)
const defaultNotifications = {
  emailOnReservationConfirmed: true,
  emailOnReservationCancelled: true,
  emailPaymentReminder: true,
  bookingReminder: true,
  emailNotifications: true,
  inAppNotifications: true,
};

export default function NotificationSettingsPage() {
  const [notifications, setNotifications] = useState(defaultNotifications);
  const [isSaving, setIsSaving] = useState(false);

  const handleToggle = (key: keyof typeof notifications) => {
    setNotifications((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = () => {
    setIsSaving(true);
    // Simulate API call
    setTimeout(() => {
      setIsSaving(false);
      toast.success("Notification preferences saved!");
    }, 500);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold tracking-tight">
          Notification Settings
        </h2>
        <p className="text-sm text-muted-foreground">
          Control how you receive notifications.
        </p>
      </div>

      {/* Reservation Notifications */}
      <Card>
        <CardHeader>
          <CardTitle>Reservation Notifications</CardTitle>
          <CardDescription>
            Get notified about your booking and reservation updates.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label
                htmlFor="reservation-confirmed"
                className="text-sm font-medium"
              >
                Reservation Confirmed
              </Label>
              <p className="text-sm text-muted-foreground">
                Receive email when your reservation is confirmed.
              </p>
            </div>
            <Switch
              id="reservation-confirmed"
              checked={notifications.emailOnReservationConfirmed}
              onCheckedChange={() =>
                handleToggle("emailOnReservationConfirmed")
              }
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label
                htmlFor="reservation-cancelled"
                className="text-sm font-medium"
              >
                Reservation Cancelled
              </Label>
              <p className="text-sm text-muted-foreground">
                Receive email when your reservation is cancelled.
              </p>
            </div>
            <Switch
              id="reservation-cancelled"
              checked={notifications.emailOnReservationCancelled}
              onCheckedChange={() =>
                handleToggle("emailOnReservationCancelled")
              }
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label
                htmlFor="payment-reminder"
                className="text-sm font-medium"
              >
                Payment Reminder
              </Label>
              <p className="text-sm text-muted-foreground">
                Receive reminder to complete payment before booking expires.
              </p>
            </div>
            <Switch
              id="payment-reminder"
              checked={notifications.emailPaymentReminder}
              onCheckedChange={() => handleToggle("emailPaymentReminder")}
            />
          </div>
        </CardContent>
      </Card>

      {/* Booking Reminders */}
      <Card>
        <CardHeader>
          <CardTitle>Booking Reminders</CardTitle>
          <CardDescription>
            Stay updated about your upcoming stays.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label
                htmlFor="booking-reminder"
                className="text-sm font-medium"
              >
                Check-in Reminder
              </Label>
              <p className="text-sm text-muted-foreground">
                Receive reminder before your check-in date.
              </p>
            </div>
            <Switch
              id="booking-reminder"
              checked={notifications.bookingReminder}
              onCheckedChange={() => handleToggle("bookingReminder")}
            />
          </div>
        </CardContent>
      </Card>

      {/* Notification Channels */}
      <Card>
        <CardHeader>
          <CardTitle>Notification Channels</CardTitle>
          <CardDescription>
            Choose how you want to receive notifications.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="email-notif" className="text-sm font-medium">
                Email Notifications
              </Label>
              <p className="text-sm text-muted-foreground">
                Receive notifications via email.
              </p>
            </div>
            <Switch
              id="email-notif"
              checked={notifications.emailNotifications}
              onCheckedChange={() => handleToggle("emailNotifications")}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="inapp-notif" className="text-sm font-medium">
                In-App Notifications
              </Label>
              <p className="text-sm text-muted-foreground">
                Receive notifications within the app.
              </p>
            </div>
            <Switch
              id="inapp-notif"
              checked={notifications.inAppNotifications}
              onCheckedChange={() => handleToggle("inAppNotifications")}
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? "Saving..." : "Save Preferences"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
