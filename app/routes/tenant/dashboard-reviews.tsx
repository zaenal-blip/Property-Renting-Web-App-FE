import { Star } from "lucide-react";
import { Card, CardContent } from "~/components/ui/card";

export default function DashboardReviewsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Reviews</h1>
        <p className="text-muted-foreground mt-1">
          See what guests are saying about your properties.
        </p>
      </div>

      <Card>
        <CardContent className="py-16">
          <div className="flex flex-col items-center justify-center text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 mb-4">
              <Star className="h-8 w-8 text-primary/60" />
            </div>
            <h3 className="text-lg font-semibold mb-1">No Reviews Yet</h3>
            <p className="text-muted-foreground text-sm max-w-sm">
              Guest reviews will appear here after they complete their stays at
              your properties.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
