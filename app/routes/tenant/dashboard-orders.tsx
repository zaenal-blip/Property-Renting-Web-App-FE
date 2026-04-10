import { ClipboardList } from "lucide-react";
import { Card, CardContent } from "~/components/ui/card";

export default function DashboardOrdersPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Orders</h1>
        <p className="text-muted-foreground mt-1">
          View and manage guest reservations.
        </p>
      </div>

      <Card>
        <CardContent className="py-16">
          <div className="flex flex-col items-center justify-center text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 mb-4">
              <ClipboardList className="h-8 w-8 text-primary/60" />
            </div>
            <h3 className="text-lg font-semibold mb-1">No Orders Yet</h3>
            <p className="text-muted-foreground text-sm max-w-sm">
              When guests make reservations for your properties, they will
              appear here for you to manage.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
