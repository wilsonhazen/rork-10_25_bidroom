import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
} from "react-native";
import {
  Star,
  ThumbsUp,
  Calendar,
  Filter,
  X,
  MessageSquare,
} from "lucide-react-native";
import Colors from "@/constants/colors";
import { Review } from "@/types";

interface ReviewsListProps {
  reviews: Review[];
  averageRating: number;
  totalReviews: number;
}

type SortOption = "recent" | "highest" | "lowest" | "helpful";
type FilterOption = "all" | 1 | 2 | 3 | 4 | 5;

function RatingStars({ rating, size = 14 }: { rating: number; size?: number }) {
  return (
    <View style={styles.starsContainer}>
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          size={size}
          color={star <= rating ? Colors.warning : Colors.border}
          fill={star <= rating ? Colors.warning : "transparent"}
        />
      ))}
    </View>
  );
}

function RatingDistribution({ reviews }: { reviews: Review[] }) {
  const distribution = useMemo(() => {
    const counts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviews.forEach((review) => {
      counts[review.rating as keyof typeof counts]++;
    });
    return counts;
  }, [reviews]);



  return (
    <View style={styles.distributionContainer}>
      {[5, 4, 3, 2, 1].map((rating) => {
        const count = distribution[rating as keyof typeof distribution];
        const percentage = reviews.length > 0 ? (count / reviews.length) * 100 : 0;

        return (
          <View key={rating} style={styles.distributionRow}>
            <View style={styles.distributionLabel}>
              <Text style={styles.distributionRating}>{rating}</Text>
              <Star size={12} color={Colors.warning} fill={Colors.warning} />
            </View>
            <View style={styles.distributionBarContainer}>
              <View
                style={[
                  styles.distributionBar,
                  { width: `${percentage}%` },
                ]}
              />
            </View>
            <Text style={styles.distributionCount}>{count}</Text>
          </View>
        );
      })}
    </View>
  );
}

function ReviewCard({ review }: { review: Review }) {
  const [expanded, setExpanded] = useState(false);

  const shouldTruncate = review.comment.length > 200;
  const displayComment =
    shouldTruncate && !expanded
      ? review.comment.substring(0, 200) + "..."
      : review.comment;

  return (
    <View style={styles.reviewCard}>
      <View style={styles.reviewHeader}>
        <View style={styles.reviewAuthorContainer}>
          <View style={styles.reviewAvatar}>
            <Text style={styles.reviewAvatarText}>
              {review.authorName
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </Text>
          </View>
          <View style={styles.reviewAuthorInfo}>
            <Text style={styles.reviewAuthor}>{review.authorName}</Text>
            <Text style={styles.reviewCompany}>{review.authorCompany}</Text>
          </View>
        </View>
        <View style={styles.reviewRatingContainer}>
          <RatingStars rating={review.rating} size={14} />
        </View>
      </View>

      <View style={styles.reviewMeta}>
        <View style={styles.reviewMetaItem}>
          <Calendar size={12} color={Colors.textTertiary} />
          <Text style={styles.reviewMetaText}>
            {new Date(review.date).toLocaleDateString("en-US", {
              year: "numeric",
              month: "short",
              day: "numeric",
            })}
          </Text>
        </View>
        {review.projectType && (
          <View style={styles.reviewMetaItem}>
            <Text style={styles.reviewProjectType}>{review.projectType}</Text>
          </View>
        )}
      </View>

      <Text style={styles.reviewComment}>{displayComment}</Text>

      {shouldTruncate && (
        <TouchableOpacity
          onPress={() => setExpanded(!expanded)}
          style={styles.expandButton}
        >
          <Text style={styles.expandButtonText}>
            {expanded ? "Show Less" : "Read More"}
          </Text>
        </TouchableOpacity>
      )}

      {review.response && (
        <View style={styles.responseContainer}>
          <View style={styles.responseHeader}>
            <MessageSquare size={14} color={Colors.primary} />
            <Text style={styles.responseTitle}>Contractor Response</Text>
          </View>
          <Text style={styles.responseMessage}>{review.response.message}</Text>
          <Text style={styles.responseDate}>
            {new Date(review.response.date).toLocaleDateString("en-US", {
              year: "numeric",
              month: "short",
              day: "numeric",
            })}
          </Text>
        </View>
      )}

      <View style={styles.reviewFooter}>
        <View style={styles.reviewHelpful}>
          <ThumbsUp size={14} color={Colors.textSecondary} />
          <Text style={styles.reviewHelpfulText}>
            {review.helpful} found this helpful
          </Text>
        </View>
      </View>
    </View>
  );
}

export default function ReviewsList({
  reviews,
  averageRating,
  totalReviews,
}: ReviewsListProps) {
  const [sortBy, setSortBy] = useState<SortOption>("recent");
  const [filterRating, setFilterRating] = useState<FilterOption>("all");
  const [showFilters, setShowFilters] = useState(false);

  const sortedAndFilteredReviews = useMemo(() => {
    let filtered = [...reviews];

    if (filterRating !== "all") {
      filtered = filtered.filter((review) => review.rating === filterRating);
    }

    filtered.sort((a, b) => {
      switch (sortBy) {
        case "recent":
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        case "highest":
          return b.rating - a.rating;
        case "lowest":
          return a.rating - b.rating;
        case "helpful":
          return b.helpful - a.helpful;
        default:
          return 0;
      }
    });

    return filtered;
  }, [reviews, sortBy, filterRating]);

  if (reviews.length === 0) {
    return (
      <View style={styles.emptyState}>
        <Star size={48} color={Colors.textTertiary} />
        <Text style={styles.emptyStateTitle}>No Reviews Yet</Text>
        <Text style={styles.emptyStateText}>
          This contractor has not received any reviews yet.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.summaryCard}>
        <View style={styles.summaryLeft}>
          <Text style={styles.averageRating}>{averageRating.toFixed(1)}</Text>
          <RatingStars rating={Math.round(averageRating)} size={16} />
          <Text style={styles.totalReviews}>
            {totalReviews} review{totalReviews !== 1 ? "s" : ""}
          </Text>
        </View>
        <View style={styles.summaryRight}>
          <RatingDistribution reviews={reviews} />
        </View>
      </View>

      <View style={styles.controls}>
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setShowFilters(true)}
        >
          <Filter size={16} color={Colors.primary} />
          <Text style={styles.filterButtonText}>
            {filterRating === "all" ? "All Ratings" : `${filterRating} Stars`}
          </Text>
        </TouchableOpacity>

        <View style={styles.sortButtons}>
          <TouchableOpacity
            style={[
              styles.sortButton,
              sortBy === "recent" && styles.sortButtonActive,
            ]}
            onPress={() => setSortBy("recent")}
          >
            <Text
              style={[
                styles.sortButtonText,
                sortBy === "recent" && styles.sortButtonTextActive,
              ]}
            >
              Recent
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.sortButton,
              sortBy === "helpful" && styles.sortButtonActive,
            ]}
            onPress={() => setSortBy("helpful")}
          >
            <Text
              style={[
                styles.sortButtonText,
                sortBy === "helpful" && styles.sortButtonTextActive,
              ]}
            >
              Helpful
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.sortButton,
              sortBy === "highest" && styles.sortButtonActive,
            ]}
            onPress={() => setSortBy("highest")}
          >
            <Text
              style={[
                styles.sortButtonText,
                sortBy === "highest" && styles.sortButtonTextActive,
              ]}
            >
              Highest
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {sortedAndFilteredReviews.length === 0 ? (
        <View style={styles.noResultsState}>
          <Text style={styles.noResultsText}>
            No reviews match your filter criteria
          </Text>
        </View>
      ) : (
        <View style={styles.reviewsList}>
          {sortedAndFilteredReviews.map((review) => (
            <ReviewCard key={review.id} review={review} />
          ))}
        </View>
      )}

      <Modal
        visible={showFilters}
        transparent
        animationType="slide"
        onRequestClose={() => setShowFilters(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Filter Reviews</Text>
              <TouchableOpacity onPress={() => setShowFilters(false)}>
                <X size={24} color={Colors.text} />
              </TouchableOpacity>
            </View>

            <View style={styles.filterOptions}>
              <TouchableOpacity
                style={[
                  styles.filterOption,
                  filterRating === "all" && styles.filterOptionActive,
                ]}
                onPress={() => {
                  setFilterRating("all");
                  setShowFilters(false);
                }}
              >
                <Text
                  style={[
                    styles.filterOptionText,
                    filterRating === "all" && styles.filterOptionTextActive,
                  ]}
                >
                  All Ratings
                </Text>
              </TouchableOpacity>

              {[5, 4, 3, 2, 1].map((rating) => (
                <TouchableOpacity
                  key={rating}
                  style={[
                    styles.filterOption,
                    filterRating === rating && styles.filterOptionActive,
                  ]}
                  onPress={() => {
                    setFilterRating(rating as FilterOption);
                    setShowFilters(false);
                  }}
                >
                  <RatingStars rating={rating} size={14} />
                  <Text
                    style={[
                      styles.filterOptionText,
                      filterRating === rating && styles.filterOptionTextActive,
                    ]}
                  >
                    {rating} Stars
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  summaryCard: {
    flexDirection: "row" as const,
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 24,
  },
  summaryLeft: {
    alignItems: "center" as const,
    justifyContent: "center" as const,
    paddingRight: 24,
    borderRightWidth: 1,
    borderRightColor: Colors.border,
  },
  averageRating: {
    fontSize: 48,
    fontWeight: "700" as const,
    color: Colors.text,
    marginBottom: 8,
  },
  totalReviews: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 8,
  },
  summaryRight: {
    flex: 1,
  },
  distributionContainer: {
    gap: 6,
  },
  distributionRow: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 8,
  },
  distributionLabel: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 4,
    width: 32,
  },
  distributionRating: {
    fontSize: 13,
    fontWeight: "600" as const,
    color: Colors.text,
  },
  distributionBarContainer: {
    flex: 1,
    height: 6,
    backgroundColor: Colors.background,
    borderRadius: 3,
    overflow: "hidden" as const,
  },
  distributionBar: {
    height: "100%",
    backgroundColor: Colors.warning,
    borderRadius: 3,
  },
  distributionCount: {
    fontSize: 12,
    fontWeight: "600" as const,
    color: Colors.textSecondary,
    width: 24,
    textAlign: "right" as const,
  },
  controls: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    alignItems: "center" as const,
    marginBottom: 16,
    gap: 12,
  },
  filterButton: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 8,
    backgroundColor: Colors.surface,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.primary,
  },
  sortButtons: {
    flexDirection: "row" as const,
    gap: 8,
  },
  sortButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  sortButtonActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  sortButtonText: {
    fontSize: 13,
    fontWeight: "600" as const,
    color: Colors.textSecondary,
  },
  sortButtonTextActive: {
    color: Colors.white,
  },
  reviewsList: {
    gap: 12,
  },
  reviewCard: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  reviewHeader: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    marginBottom: 12,
  },
  reviewAuthorContainer: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 12,
  },
  reviewAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary + "20",
    justifyContent: "center" as const,
    alignItems: "center" as const,
  },
  reviewAvatarText: {
    fontSize: 14,
    fontWeight: "700" as const,
    color: Colors.primary,
  },
  reviewAuthorInfo: {
    justifyContent: "center" as const,
  },
  reviewAuthor: {
    fontSize: 15,
    fontWeight: "600" as const,
    color: Colors.text,
    marginBottom: 2,
  },
  reviewCompany: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  reviewRatingContainer: {
    justifyContent: "center" as const,
  },
  starsContainer: {
    flexDirection: "row" as const,
    gap: 2,
  },
  reviewMeta: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 12,
    marginBottom: 12,
  },
  reviewMetaItem: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 4,
  },
  reviewMetaText: {
    fontSize: 12,
    color: Colors.textTertiary,
  },
  reviewProjectType: {
    fontSize: 12,
    fontWeight: "600" as const,
    color: Colors.primary,
    backgroundColor: Colors.primary + "15",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  reviewComment: {
    fontSize: 14,
    lineHeight: 20,
    color: Colors.text,
    marginBottom: 8,
  },
  expandButton: {
    alignSelf: "flex-start" as const,
    marginBottom: 8,
  },
  expandButtonText: {
    fontSize: 13,
    fontWeight: "600" as const,
    color: Colors.primary,
  },
  responseContainer: {
    backgroundColor: Colors.background,
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
    marginBottom: 8,
    borderLeftWidth: 3,
    borderLeftColor: Colors.primary,
  },
  responseHeader: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 6,
    marginBottom: 8,
  },
  responseTitle: {
    fontSize: 13,
    fontWeight: "600" as const,
    color: Colors.primary,
  },
  responseMessage: {
    fontSize: 13,
    lineHeight: 18,
    color: Colors.text,
    marginBottom: 6,
  },
  responseDate: {
    fontSize: 11,
    color: Colors.textTertiary,
  },
  reviewFooter: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    alignItems: "center" as const,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  reviewHelpful: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 6,
  },
  reviewHelpfulText: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  emptyState: {
    alignItems: "center" as const,
    justifyContent: "center" as const,
    paddingVertical: 48,
    paddingHorizontal: 24,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: "600" as const,
    color: Colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: "center" as const,
  },
  noResultsState: {
    paddingVertical: 32,
    alignItems: "center" as const,
  },
  noResultsText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end" as const,
  },
  modalContent: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 32,
  },
  modalHeader: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    alignItems: "center" as const,
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: Colors.text,
  },
  filterOptions: {
    padding: 20,
    gap: 12,
  },
  filterOption: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  filterOptionActive: {
    backgroundColor: Colors.primary + "15",
    borderColor: Colors.primary,
  },
  filterOptionText: {
    fontSize: 15,
    fontWeight: "500" as const,
    color: Colors.text,
  },
  filterOptionTextActive: {
    fontWeight: "600" as const,
    color: Colors.primary,
  },
});
