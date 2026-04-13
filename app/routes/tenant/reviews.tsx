import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Star,
  MessageSquare,
  Send,
  X,
  Building2,
  User as UserIcon,
  Calendar,
} from "lucide-react";
import { axiosInstance } from "~/lib/axios";
import { useAuthStore } from "~/modules/auth/auth.store";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Textarea } from "~/components/ui/textarea";
import { Skeleton } from "~/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "~/components/ui/dialog";
import { toast } from "sonner";
import { format } from "date-fns";

export default function TenantReviewsPage() {
  const queryClient = useQueryClient();
  const user = useAuthStore((s) => s.user);

  const [replyModal, setReplyModal] = useState<{
    reviewId: string;
    userName: string;
    comment: string;
  } | null>(null);
  const [replyText, setReplyText] = useState("");

  // Fetch reviews for tenant's properties
  const { data: reviewsData, isLoading } = useQuery({
    queryKey: ["tenant-reviews"],
    queryFn: async () => {
      const res = await axiosInstance.get("/reviews", {
        params: { tenantId: user?.id, take: 50 },
      });
      return res.data;
    },
    enabled: !!user?.id,
  });

  const reviews = reviewsData?.data || [];

  // Reply mutation
  const replyMutation = useMutation({
    mutationFn: async ({ reviewId, reply }: { reviewId: string; reply: string }) => {
      return axiosInstance.post(`/reviews/${reviewId}/reply`, { reply });
    },
    onSuccess: () => {
      toast.success("Reply submitted successfully!");
      queryClient.invalidateQueries({ queryKey: ["tenant-reviews"] });
      setReplyModal(null);
      setReplyText("");
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Failed to submit reply");
    },
  });

  const handleReply = () => {
    if (!replyModal || !replyText.trim()) return;
    replyMutation.mutate({ reviewId: replyModal.reviewId, reply: replyText });
  };

  // ─── RENDER ─────────────────────────────────────────────────────────

  return (
    <div className="container mx-auto px-4 py-24 md:py-28 max-w-5xl">
      <div className="flex flex-col gap-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Guest Reviews</h1>
            <p className="text-muted-foreground mt-1">
              Manage and respond to reviews from your guests.
            </p>
          </div>
          <Badge variant="outline" className="px-3 py-1">
            {reviews.length} Reviews
          </Badge>
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-40 w-full rounded-xl" />
            ))}
          </div>
        )}

        {/* Empty */}
        {!isLoading && reviews.length === 0 && (
          <Card className="p-12 text-center border-dashed">
            <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
              <MessageSquare className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold">No reviews yet</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Reviews from your guests will appear here.
            </p>
          </Card>
        )}

        {/* Review List */}
        {!isLoading && reviews.length > 0 && (
          <div className="space-y-4">
            {reviews.map((review: any) => (
              <Card
                key={review.id}
                className="overflow-hidden hover:shadow-md transition-shadow"
              >
                <CardContent className="p-6">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    {/* User Info & Rating */}
                    <div className="flex items-start gap-4 flex-1">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        {review.user?.profilePicture ? (
                          <img
                            src={review.user.profilePicture}
                            alt={review.user.name}
                            className="h-10 w-10 rounded-full object-cover"
                          />
                        ) : (
                          <UserIcon className="h-5 w-5 text-primary" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold">{review.user?.name || "Guest"}</span>
                          <div className="flex items-center gap-0.5">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                className={`h-4 w-4 ${
                                  review.rating >= star
                                    ? "fill-warning text-warning"
                                    : "text-muted-foreground/30"
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {review.createdAt && format(new Date(review.createdAt), "dd MMM yyyy")}
                        </p>
                        <p className="mt-3 text-sm text-foreground leading-relaxed">
                          "{review.comment}"
                        </p>
                      </div>
                    </div>

                    {/* Reply Button */}
                    <div className="shrink-0">
                      {!review.reply ? (
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-2"
                          onClick={() =>
                            setReplyModal({
                              reviewId: review.id,
                              userName: review.user?.name || "Guest",
                              comment: review.comment,
                            })
                          }
                        >
                          <MessageSquare className="h-4 w-4" />
                          Reply
                        </Button>
                      ) : (
                        <Badge
                          variant="outline"
                          className="bg-success/5 text-success border-success/20"
                        >
                          Replied
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Existing Reply */}
                  {review.reply && (
                    <div className="mt-4 ml-14 p-4 bg-muted/30 rounded-xl border border-border">
                      <div className="flex items-center gap-2 mb-2">
                        <Building2 className="h-4 w-4 text-primary" />
                        <span className="text-xs font-bold text-primary">Your Reply</span>
                        <span className="text-[10px] text-muted-foreground">
                          {review.reply.createdAt &&
                            format(new Date(review.reply.createdAt), "dd MMM yyyy")}
                        </span>
                      </div>
                      <p className="text-sm text-foreground">"{review.reply.reply}"</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Reply Modal */}
      <Dialog open={!!replyModal} onOpenChange={(open) => !open && setReplyModal(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Reply to {replyModal?.userName}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-4 bg-muted/30 rounded-xl border text-sm italic">
              "{replyModal?.comment}"
            </div>
            <Textarea
              placeholder="Write your reply..."
              className="min-h-[100px]"
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setReplyModal(null)}>
              Cancel
            </Button>
            <Button
              onClick={handleReply}
              disabled={!replyText.trim() || replyMutation.isPending}
              className="gap-2"
            >
              <Send className="h-4 w-4" />
              {replyMutation.isPending ? "Sending..." : "Send Reply"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
