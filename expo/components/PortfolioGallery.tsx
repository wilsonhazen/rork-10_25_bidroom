import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
  Dimensions,
} from "react-native";
import {
  X,
  MapPin,
  Calendar,
  DollarSign,
  ChevronLeft,
  ChevronRight,
  Grid3x3,
  List,
} from "lucide-react-native";
import Colors from "@/constants/colors";
import { PortfolioItem } from "@/types";
import SafeImage from "@/components/SafeImage";

interface PortfolioGalleryProps {
  portfolio: PortfolioItem[];
}

type ViewMode = "grid" | "list";

const { width: screenWidth } = Dimensions.get("window");
const imageSize = (screenWidth - 48) / 2;

function ImageViewer({
  images,
  initialIndex,
  onClose,
  projectName,
}: {
  images: string[];
  initialIndex: number;
  onClose: () => void;
  projectName: string;
}) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1));
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0));
  };

  return (
    <Modal visible animationType="fade" onRequestClose={onClose}>
      <View style={styles.viewerContainer}>
        <View style={styles.viewerHeader}>
          <View style={styles.viewerHeaderLeft}>
            <Text style={styles.viewerTitle}>{projectName}</Text>
            <Text style={styles.viewerCounter}>
              {currentIndex + 1} of {images.length}
            </Text>
          </View>
          <TouchableOpacity onPress={onClose} style={styles.viewerCloseButton}>
            <X size={24} color={Colors.white} />
          </TouchableOpacity>
        </View>

        <View style={styles.viewerContent}>
          <SafeImage
            uri={images[currentIndex]}
            style={styles.viewerImage}
            resizeMode="contain"
          />

          {images.length > 1 && (
            <>
              <TouchableOpacity
                style={[styles.navButton, styles.navButtonLeft]}
                onPress={goToPrevious}
              >
                <ChevronLeft size={32} color={Colors.white} />
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.navButton, styles.navButtonRight]}
                onPress={goToNext}
              >
                <ChevronRight size={32} color={Colors.white} />
              </TouchableOpacity>
            </>
          )}
        </View>

        {images.length > 1 && (
          <View style={styles.thumbnailContainer}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.thumbnailScroll}
            >
              {images.map((image, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => setCurrentIndex(index)}
                  style={[
                    styles.thumbnail,
                    currentIndex === index && styles.thumbnailActive,
                  ]}
                >
                  <SafeImage
                    uri={image}
                    style={styles.thumbnailImage}
                    resizeMode="cover"
                  />
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}
      </View>
    </Modal>
  );
}

function PortfolioGridItem({
  item,
  onPress,
}: {
  item: PortfolioItem;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity style={styles.gridItem} onPress={onPress}>
      <View style={styles.gridImageContainer}>
        <SafeImage
          uri={item.images[0]}
          style={styles.gridImage}
          resizeMode="cover"
        />
        {item.images.length > 1 && (
          <View style={styles.imageCountBadge}>
            <Grid3x3 size={12} color={Colors.white} />
            <Text style={styles.imageCountText}>{item.images.length}</Text>
          </View>
        )}
      </View>
      <View style={styles.gridItemInfo}>
        <Text style={styles.gridItemTitle} numberOfLines={2}>
          {item.projectName}
        </Text>
        <Text style={styles.gridItemCategory}>{item.category}</Text>
      </View>
    </TouchableOpacity>
  );
}

function PortfolioListItem({
  item,
  onPress,
}: {
  item: PortfolioItem;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity style={styles.listItem} onPress={onPress}>
      <View style={styles.listImageContainer}>
        <SafeImage
          uri={item.images[0]}
          style={styles.listImage}
          resizeMode="cover"
        />
        {item.images.length > 1 && (
          <View style={styles.imageCountBadge}>
            <Grid3x3 size={12} color={Colors.white} />
            <Text style={styles.imageCountText}>{item.images.length}</Text>
          </View>
        )}
      </View>
      <View style={styles.listItemInfo}>
        <Text style={styles.listItemTitle} numberOfLines={1}>
          {item.projectName}
        </Text>
        <Text style={styles.listItemDescription} numberOfLines={2}>
          {item.description}
        </Text>
        <View style={styles.listItemMeta}>
          <View style={styles.listItemMetaItem}>
            <MapPin size={12} color={Colors.textTertiary} />
            <Text style={styles.listItemMetaText}>{item.location}</Text>
          </View>
          <View style={styles.listItemMetaItem}>
            <Calendar size={12} color={Colors.textTertiary} />
            <Text style={styles.listItemMetaText}>
              {new Date(item.completedDate).toLocaleDateString("en-US", {
                year: "numeric",
                month: "short",
              })}
            </Text>
          </View>
          {item.budget && (
            <View style={styles.listItemMetaItem}>
              <DollarSign size={12} color={Colors.textTertiary} />
              <Text style={styles.listItemMetaText}>{item.budget}</Text>
            </View>
          )}
        </View>
        <View style={styles.categoryBadge}>
          <Text style={styles.categoryText}>{item.category}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

export default function PortfolioGallery({ portfolio }: PortfolioGalleryProps) {
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [selectedProject, setSelectedProject] = useState<PortfolioItem | null>(
    null
  );
  const [imageViewerIndex, setImageViewerIndex] = useState(0);
  const [showImageViewer, setShowImageViewer] = useState(false);

  const openProject = (project: PortfolioItem) => {
    setSelectedProject(project);
  };

  const closeProject = () => {
    setSelectedProject(null);
  };

  const openImageViewer = (index: number) => {
    setImageViewerIndex(index);
    setShowImageViewer(true);
  };

  if (portfolio.length === 0) {
    return (
      <View style={styles.emptyState}>
        <Grid3x3 size={48} color={Colors.textTertiary} />
        <Text style={styles.emptyStateTitle}>No Portfolio Items</Text>
        <Text style={styles.emptyStateText}>
          This contractor has not added any portfolio items yet.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>
          Portfolio ({portfolio.length} project{portfolio.length !== 1 ? "s" : ""})
        </Text>
        <View style={styles.viewModeToggle}>
          <TouchableOpacity
            style={[
              styles.viewModeButton,
              viewMode === "grid" && styles.viewModeButtonActive,
            ]}
            onPress={() => setViewMode("grid")}
          >
            <Grid3x3
              size={18}
              color={viewMode === "grid" ? Colors.primary : Colors.textSecondary}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.viewModeButton,
              viewMode === "list" && styles.viewModeButtonActive,
            ]}
            onPress={() => setViewMode("list")}
          >
            <List
              size={18}
              color={viewMode === "list" ? Colors.primary : Colors.textSecondary}
            />
          </TouchableOpacity>
        </View>
      </View>

      {viewMode === "grid" ? (
        <View style={styles.grid}>
          {portfolio.map((item) => (
            <PortfolioGridItem
              key={item.id}
              item={item}
              onPress={() => openProject(item)}
            />
          ))}
        </View>
      ) : (
        <View style={styles.list}>
          {portfolio.map((item) => (
            <PortfolioListItem
              key={item.id}
              item={item}
              onPress={() => openProject(item)}
            />
          ))}
        </View>
      )}

      <Modal
        visible={selectedProject !== null}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={closeProject}
      >
        {selectedProject && (
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{selectedProject.projectName}</Text>
              <TouchableOpacity onPress={closeProject}>
                <X size={24} color={Colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView
              style={styles.modalContent}
              contentContainerStyle={styles.modalContentInner}
            >
              <View style={styles.imageGallery}>
                {selectedProject.images.map((image, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.galleryImage}
                    onPress={() => openImageViewer(index)}
                  >
                    <SafeImage
                      uri={image}
                      style={styles.galleryImageView}
                      resizeMode="cover"
                    />
                  </TouchableOpacity>
                ))}
              </View>

              <View style={styles.projectDetails}>
                <View style={styles.projectDetailRow}>
                  <Text style={styles.projectDetailLabel}>Category</Text>
                  <Text style={styles.projectDetailValue}>
                    {selectedProject.category}
                  </Text>
                </View>

                <View style={styles.projectDetailRow}>
                  <Text style={styles.projectDetailLabel}>Location</Text>
                  <View style={styles.projectDetailValueRow}>
                    <MapPin size={16} color={Colors.textSecondary} />
                    <Text style={styles.projectDetailValue}>
                      {selectedProject.location}
                    </Text>
                  </View>
                </View>

                <View style={styles.projectDetailRow}>
                  <Text style={styles.projectDetailLabel}>Completed</Text>
                  <View style={styles.projectDetailValueRow}>
                    <Calendar size={16} color={Colors.textSecondary} />
                    <Text style={styles.projectDetailValue}>
                      {new Date(selectedProject.completedDate).toLocaleDateString(
                        "en-US",
                        {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        }
                      )}
                    </Text>
                  </View>
                </View>

                {selectedProject.budget && (
                  <View style={styles.projectDetailRow}>
                    <Text style={styles.projectDetailLabel}>Budget</Text>
                    <View style={styles.projectDetailValueRow}>
                      <DollarSign size={16} color={Colors.success} />
                      <Text
                        style={[
                          styles.projectDetailValue,
                          { color: Colors.success, fontWeight: "700" as const },
                        ]}
                      >
                        {selectedProject.budget}
                      </Text>
                    </View>
                  </View>
                )}
              </View>

              <View style={styles.projectDescription}>
                <Text style={styles.projectDescriptionTitle}>Description</Text>
                <Text style={styles.projectDescriptionText}>
                  {selectedProject.description}
                </Text>
              </View>
            </ScrollView>
          </View>
        )}
      </Modal>

      {showImageViewer && selectedProject && (
        <ImageViewer
          images={selectedProject.images}
          initialIndex={imageViewerIndex}
          onClose={() => setShowImageViewer(false)}
          projectName={selectedProject.projectName}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    alignItems: "center" as const,
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: Colors.text,
  },
  viewModeToggle: {
    flexDirection: "row" as const,
    gap: 4,
    backgroundColor: Colors.background,
    borderRadius: 8,
    padding: 4,
  },
  viewModeButton: {
    padding: 8,
    borderRadius: 6,
  },
  viewModeButtonActive: {
    backgroundColor: Colors.surface,
  },
  grid: {
    flexDirection: "row" as const,
    flexWrap: "wrap" as const,
    gap: 12,
  },
  gridItem: {
    width: imageSize,
    marginBottom: 12,
  },
  gridImageContainer: {
    position: "relative" as const,
    width: "100%",
    height: imageSize,
    borderRadius: 12,
    overflow: "hidden" as const,
    backgroundColor: Colors.background,
  },
  gridImage: {
    width: "100%",
    height: "100%",
  },
  imageCountBadge: {
    position: "absolute" as const,
    top: 8,
    right: 8,
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 4,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  imageCountText: {
    fontSize: 11,
    fontWeight: "600" as const,
    color: Colors.white,
  },
  gridItemInfo: {
    marginTop: 8,
  },
  gridItemTitle: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.text,
    marginBottom: 4,
  },
  gridItemCategory: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  list: {
    gap: 12,
  },
  listItem: {
    flexDirection: "row" as const,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 12,
    gap: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  listImageContainer: {
    position: "relative" as const,
    width: 100,
    height: 100,
    borderRadius: 8,
    overflow: "hidden" as const,
    backgroundColor: Colors.background,
  },
  listImage: {
    width: "100%",
    height: "100%",
  },
  listItemInfo: {
    flex: 1,
    justifyContent: "space-between" as const,
  },
  listItemTitle: {
    fontSize: 15,
    fontWeight: "600" as const,
    color: Colors.text,
    marginBottom: 4,
  },
  listItemDescription: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 18,
    marginBottom: 8,
  },
  listItemMeta: {
    flexDirection: "row" as const,
    flexWrap: "wrap" as const,
    gap: 12,
    marginBottom: 8,
  },
  listItemMetaItem: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 4,
  },
  listItemMetaText: {
    fontSize: 12,
    color: Colors.textTertiary,
  },
  categoryBadge: {
    alignSelf: "flex-start" as const,
    backgroundColor: Colors.primary + "15",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  categoryText: {
    fontSize: 11,
    fontWeight: "600" as const,
    color: Colors.primary,
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
  modalContainer: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  modalHeader: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    alignItems: "center" as const,
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: Colors.text,
    flex: 1,
    marginRight: 16,
  },
  modalContent: {
    flex: 1,
  },
  modalContentInner: {
    padding: 16,
  },
  imageGallery: {
    flexDirection: "row" as const,
    flexWrap: "wrap" as const,
    gap: 8,
    marginBottom: 24,
  },
  galleryImage: {
    width: (screenWidth - 48) / 2,
    height: (screenWidth - 48) / 2,
    borderRadius: 8,
    overflow: "hidden" as const,
    backgroundColor: Colors.surface,
  },
  galleryImageView: {
    width: "100%",
    height: "100%",
  },
  projectDetails: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    gap: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  projectDetailRow: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    alignItems: "center" as const,
  },
  projectDetailLabel: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.textSecondary,
  },
  projectDetailValue: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.text,
  },
  projectDetailValueRow: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 6,
  },
  projectDescription: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  projectDescriptionTitle: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: Colors.text,
    marginBottom: 12,
  },
  projectDescriptionText: {
    fontSize: 14,
    lineHeight: 20,
    color: Colors.text,
  },
  viewerContainer: {
    flex: 1,
    backgroundColor: "#000",
  },
  viewerHeader: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    alignItems: "center" as const,
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: "rgba(0, 0, 0, 0.8)",
  },
  viewerHeaderLeft: {
    flex: 1,
    marginRight: 16,
  },
  viewerTitle: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: Colors.white,
    marginBottom: 4,
  },
  viewerCounter: {
    fontSize: 13,
    color: "rgba(255, 255, 255, 0.7)",
  },
  viewerCloseButton: {
    padding: 8,
  },
  viewerContent: {
    flex: 1,
    justifyContent: "center" as const,
    alignItems: "center" as const,
  },
  viewerImage: {
    width: screenWidth,
    height: "100%",
  },
  navButton: {
    position: "absolute" as const,
    top: "50%",
    transform: [{ translateY: -24 }],
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    borderRadius: 24,
    padding: 8,
  },
  navButtonLeft: {
    left: 16,
  },
  navButtonRight: {
    right: 16,
  },
  thumbnailContainer: {
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    paddingVertical: 12,
  },
  thumbnailScroll: {
    paddingHorizontal: 16,
    gap: 8,
  },
  thumbnail: {
    width: 60,
    height: 60,
    borderRadius: 6,
    overflow: "hidden" as const,
    borderWidth: 2,
    borderColor: "transparent",
  },
  thumbnailActive: {
    borderColor: Colors.primary,
  },
  thumbnailImage: {
    width: "100%",
    height: "100%",
  },
});
