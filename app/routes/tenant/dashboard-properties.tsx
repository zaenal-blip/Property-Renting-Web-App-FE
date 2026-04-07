import { Building2, Plus } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";

export default function DashboardPropertiesPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">My Properties</h1>
          <p className="text-muted-foreground mt-1">
            Manage your listed properties and rooms.
          </p>
        </div>
        <Button className="gap-2" disabled>
          <Plus className="h-4 w-4" />
          Add Property
        </Button>
      </div>

      <Card>
        <CardContent className="py-16">
          <div className="flex flex-col items-center justify-center text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 mb-4">
              <Building2 className="h-8 w-8 text-primary/60" />
            </div>
            <h3 className="text-lg font-semibold mb-1">No Properties Yet</h3>
            <p className="text-muted-foreground text-sm max-w-sm">
              Start listing your properties on Rentivo. Add your first property
              to begin receiving bookings.
            </p>
            <Button className="mt-6 gap-2" disabled>
              <Plus className="h-4 w-4" />
              Add Your First Property
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
