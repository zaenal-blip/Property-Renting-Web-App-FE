import { useState } from "react";
import { Star } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Textarea } from "~/components/ui/textarea";
import { axiosInstance } from "~/lib/axios";
import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";

interface ReviewFormProps {
  reservationId: string;
  onSuccess?: () => void;
}

export function ReviewForm({ reservationId, onSuccess }: ReviewFormProps) {
  const queryClient = useQueryClient();
  const [rating, setRating] = useState(5);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState("");

  const mutation = useMutation({
    mutationFn: (data: any) => axiosInstance.post("/reviews", data),
    onSuccess: () => {
      toast.success("Review submitted! Thank you for your feedback.");
      queryClient.invalidateQueries({ queryKey: ["reservation", reservationId] });
      if (onSuccess) onSuccess();
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Failed to submit review");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return toast.error("Please enter a comment");
    mutation.mutate({ reservationId, rating, comment });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-muted/20 p-6 rounded-2xl border border-border">
      <div>
        <h3 className="text-lg font-bold">Leave a Review</h3>
        <p className="text-sm text-muted-foreground">How was your stay? Let others know!</p>
      </div>

      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            className="focus:outline-none transition-transform hover:scale-110"
            onClick={() => setRating(star)}
            onMouseEnter={() => setHover(star)}
            onMouseLeave={() => setHover(0)}
          >
            <Star
              className={`h-8 w-8 ${
                (hover || rating) >= star ? "fill-warning text-warning" : "text-muted-foreground"
              }`}
            />
          </button>
        ))}
      </div>

      <Textarea
        placeholder="Write your experience here..."
        className="min-h-[100px] bg-background"
        value={comment}
        onChange={(e) => setComment(e.target.value)}
      />

      <Button type="submit" className="w-full" isLoading={mutation.isPending}>
        Submit Review
      </Button>
    </form>
  );
}
