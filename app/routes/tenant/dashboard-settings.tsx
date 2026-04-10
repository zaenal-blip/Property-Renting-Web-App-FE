import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { User, Building2, Shield, Bell } from "lucide-react";

// Import the individual settings components as sections
import TenantProfileSection from "./settings-profile";
import TenantBusinessSection from "./settings-business";
import TenantSecuritySection from "./settings-security";
import TenantNotificationsSection from "./settings-notifications";

export default function DashboardSettingsPage() {
  const [activeTab, setActiveTab] = useState("profile");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground mt-1">
          Manage your account and business preferences.
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-grid">
          <TabsTrigger value="profile" className="gap-2">
            <User className="h-4 w-4 hidden sm:block" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="business" className="gap-2">
            <Building2 className="h-4 w-4 hidden sm:block" />
            Business
          </TabsTrigger>
          <TabsTrigger value="security" className="gap-2">
            <Shield className="h-4 w-4 hidden sm:block" />
            Security
          </TabsTrigger>
          <TabsTrigger value="notifications" className="gap-2">
            <Bell className="h-4 w-4 hidden sm:block" />
            Notifications
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="mt-6">
          <TenantProfileSection />
        </TabsContent>
        <TabsContent value="business" className="mt-6">
          <TenantBusinessSection />
        </TabsContent>
        <TabsContent value="security" className="mt-6">
          <TenantSecuritySection />
        </TabsContent>
        <TabsContent value="notifications" className="mt-6">
          <TenantNotificationsSection />
        </TabsContent>
      </Tabs>
    </div>
  );
}
