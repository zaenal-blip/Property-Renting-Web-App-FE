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
  emailOnNewBooking: true,
  emailOnPaymentReceived: true,
  emailOnCancellation: true,
  emailOnReview: true,
  emailNotifications: true,
  inAppNotifications: true,
};

export default function TenantNotificationSettingsPage() {
  const [notifications, setNotifications] = useState(defaultNotifications);
  const [isSaving, setIsSaving] = useState(false);

  const handleToggle = (key: keyof typeof notifications) => {
    setNotifications((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = () => {
    setIsSaving(true);
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
          Control how you receive notifications about your properties.
        </p>
      </div>

      {/* Booking Notifications */}
      <Card>
        <CardHeader>
          <CardTitle>Booking Notifications</CardTitle>
          <CardDescription>
            Get notified about new bookings and reservation updates.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="new-booking" className="text-sm font-medium">
                New Booking
              </Label>
              <p className="text-sm text-muted-foreground">
                Receive email when a guest makes a new reservation.
              </p>
            </div>
            <Switch
              id="new-booking"
              checked={notifications.emailOnNewBooking}
              onCheckedChange={() => handleToggle("emailOnNewBooking")}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label
                htmlFor="payment-received"
                className="text-sm font-medium"
              >
                Payment Received
              </Label>
              <p className="text-sm text-muted-foreground">
                Receive email when payment proof is uploaded by a guest.
              </p>
            </div>
            <Switch
              id="payment-received"
              checked={notifications.emailOnPaymentReceived}
              onCheckedChange={() => handleToggle("emailOnPaymentReceived")}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="cancellation" className="text-sm font-medium">
                Booking Cancellation
              </Label>
              <p className="text-sm text-muted-foreground">
                Receive email when a guest cancels a reservation.
              </p>
            </div>
            <Switch
              id="cancellation"
              checked={notifications.emailOnCancellation}
              onCheckedChange={() => handleToggle("emailOnCancellation")}
            />
          </div>
        </CardContent>
      </Card>

      {/* Review Notifications */}
      <Card>
        <CardHeader>
          <CardTitle>Review Notifications</CardTitle>
          <CardDescription>
            Stay updated about guest reviews on your properties.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="new-review" className="text-sm font-medium">
                New Review
              </Label>
              <p className="text-sm text-muted-foreground">
                Receive email when a guest leaves a review.
              </p>
            </div>
            <Switch
              id="new-review"
              checked={notifications.emailOnReview}
              onCheckedChange={() => handleToggle("emailOnReview")}
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
