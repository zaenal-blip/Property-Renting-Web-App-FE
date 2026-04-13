import { Star, User, Building2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { axiosInstance } from "~/lib/axios";
import { Skeleton } from "~/components/ui/skeleton";
import { format } from "date-fns";

interface ReviewSectionProps {
  propertyId: string;
  rating: number;
  reviewCount: number;
}

function StarBar({
  stars,
  count,
  total,
}: {
  stars: number;
  count: number;
  total: number;
}) {
  const pct = total > 0 ? (count / total) * 100 : 0;
  return (
    <div className="flex items-center gap-2 text-sm">
      <span className="w-3 text-right text-muted-foreground">{stars}</span>
      <Star className="h-3 w-3 fill-warning text-warning" />
      <div className="h-2 flex-1 overflow-hidden rounded-full bg-secondary">
        <div
          className="h-full rounded-full bg-warning transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="w-6 text-right text-xs text-muted-foreground">
        {count}
      </span>
    </div>
  );
}

export function ReviewSection({
  propertyId,
  rating,
  reviewCount,
}: ReviewSectionProps) {
  const { data, isLoading } = useQuery({
    queryKey: ["property-reviews", propertyId],
    queryFn: async () => {
      const res = await axiosInstance.get("/reviews", {
        params: { propertyId, take: 20 },
      });
      return res.data;
    },
  });

  const reviews: any[] = data?.data || [];

  const distribution = [5, 4, 3, 2, 1].map((s) => ({
    stars: s,
    count: reviews.filter((r: any) => r.rating === s).length,
  }));

  return (
    <section>
      <h2 className="mb-4 text-lg font-semibold text-foreground">
        Guest Reviews
      </h2>

      <div className="mb-6 grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-2xl font-bold text-primary-foreground">
            {rating || "—"}
          </div>
          <div>
            <div className="flex items-center gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`h-4 w-4 ${i < Math.round(rating || 0) ? "fill-warning text-warning" : "text-muted-foreground/30"}`}
                />
              ))}
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              {reviewCount || reviews.length} reviews
            </p>
          </div>
        </div>
        <div className="space-y-1.5">
          {distribution.map((d) => (
            <StarBar
              key={d.stars}
              stars={d.stars}
              count={d.count}
              total={reviews.length}
            />
          ))}
        </div>
      </div>

      {isLoading && (
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <Skeleton key={i} className="h-24 w-full rounded-xl" />
          ))}
        </div>
      )}

      {!isLoading && reviews.length === 0 && (
        <p className="text-sm text-muted-foreground py-4">
          No reviews yet. Be the first to review after your stay!
        </p>
      )}

      <div className="space-y-4">
        {reviews.map((review: any) => (
          <div
            key={review.id}
            className="rounded-xl border border-border bg-secondary/30 p-4"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 overflow-hidden">
                {review.user?.profilePicture ? (
                  <img
                    src={review.user.profilePicture}
                    alt={review.user.name}
                    className="h-9 w-9 rounded-full object-cover"
                  />
                ) : (
                  <User className="h-4 w-4 text-primary" />
                )}
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">
                  {review.user?.name || "Guest"}
                </p>
                <p className="text-xs text-muted-foreground">
                  {review.createdAt && format(new Date(review.createdAt), "dd MMM yyyy")}
                </p>
              </div>
              <div className="flex items-center gap-1">
                <Star className="h-3.5 w-3.5 fill-warning text-warning" />
                <span className="text-sm font-medium">{review.rating}</span>
              </div>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              {review.comment}
            </p>

            {/* Tenant Reply */}
            {review.reply && (
              <div className="mt-3 p-3 bg-background rounded-lg border border-border">
                <div className="flex items-center gap-2 mb-1">
                  <Building2 className="h-3.5 w-3.5 text-primary" />
                  <span className="text-xs font-bold text-primary">Property Response</span>
                </div>
                <p className="text-xs text-foreground">{review.reply.reply}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
