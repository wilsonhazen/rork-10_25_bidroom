import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, Pressable, Dimensions, Modal } from "react-native";
import { ArrowRightLeft, X } from "lucide-react-native";
import Colors from "@/constants/colors";
import { BeforeAfter } from "@/types";
import SafeImage from "./SafeImage";

interface BeforeAfterComparisonProps {
  projects: BeforeAfter[];
}

export default function BeforeAfterComparison({
  projects,
}: BeforeAfterComparisonProps) {
  const [selectedProject, setSelectedProject] = useState<BeforeAfter | null>(null);

  if (!projects || projects.length === 0) {
    return null;
  }

  return (
    <>
      <View style={styles.container}>
        <View style={styles.header}>
          <ArrowRightLeft size={20} color={Colors.primary} />
          <Text style={styles.title}>Before & After</Text>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {projects.map((project) => (
            <Pressable
              key={project.id}
              style={styles.projectCard}
              onPress={() => setSelectedProject(project)}
            >
              <View style={styles.imagesContainer}>
                <View style={styles.imageWrapper}>
                  <SafeImage
                    uri={project.beforeImage}
                    style={styles.image}
                  />
                  <View style={styles.labelBadge}>
                    <Text style={styles.labelText}>Before</Text>
                  </View>
                </View>

                <View style={styles.arrowDivider}>
                  <View style={styles.arrowCircle}>
                    <ArrowRightLeft size={16} color={Colors.white} />
                  </View>
                </View>

                <View style={styles.imageWrapper}>
                  <SafeImage
                    uri={project.afterImage}
                    style={styles.image}
                  />
                  <View style={[styles.labelBadge, styles.afterBadge]}>
                    <Text style={styles.labelText}>After</Text>
                  </View>
                </View>
              </View>

              <View style={styles.projectInfo}>
                <Text style={styles.projectName} numberOfLines={2}>
                  {project.projectName}
                </Text>
                <Text style={styles.category}>{project.category}</Text>
              </View>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      <Modal
        visible={selectedProject !== null}
        animationType="fade"
        transparent
        onRequestClose={() => setSelectedProject(null)}
      >
        {selectedProject && (
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Pressable
                style={styles.closeButton}
                onPress={() => setSelectedProject(null)}
              >
                <X size={24} color={Colors.text} />
              </Pressable>

              <ScrollView showsVerticalScrollIndicator={false}>
                <Text style={styles.modalTitle}>
                  {selectedProject.projectName}
                </Text>

                <View style={styles.modalImagesContainer}>
                  <View style={styles.modalImageSection}>
                    <Text style={styles.modalImageLabel}>Before</Text>
                    <SafeImage
                      uri={selectedProject.beforeImage}
                      style={styles.modalImage}
                    />
                  </View>

                  <View style={styles.modalImageSection}>
                    <Text style={styles.modalImageLabel}>After</Text>
                    <SafeImage
                      uri={selectedProject.afterImage}
                      style={styles.modalImage}
                    />
                  </View>
                </View>

                <View style={styles.modalDetails}>
                  <Text style={styles.modalDescription}>
                    {selectedProject.description}
                  </Text>

                  <View style={styles.modalMeta}>
                    <View style={styles.metaItem}>
                      <Text style={styles.metaLabel}>Category</Text>
                      <Text style={styles.metaValue}>
                        {selectedProject.category}
                      </Text>
                    </View>
                    <View style={styles.metaItem}>
                      <Text style={styles.metaLabel}>Completed</Text>
                      <Text style={styles.metaValue}>
                        {new Date(
                          selectedProject.completionDate
                        ).toLocaleDateString()}
                      </Text>
                    </View>
                  </View>
                </View>
              </ScrollView>
            </View>
          </View>
        )}
      </Modal>
    </>
  );
}

const screenWidth = Dimensions.get("window").width;

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  header: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 8,
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: Colors.text,
  },
  scrollContent: {
    gap: 16,
    paddingRight: 20,
  },
  projectCard: {
    width: screenWidth - 80,
    maxWidth: 400,
    backgroundColor: Colors.background,
    borderRadius: 12,
    overflow: "hidden" as const,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  imagesContainer: {
    flexDirection: "row" as const,
    height: 180,
  },
  imageWrapper: {
    flex: 1,
    position: "relative" as const,
  },
  image: {
    width: "100%",
    height: "100%",
  },
  labelBadge: {
    position: "absolute" as const,
    top: 8,
    left: 8,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  afterBadge: {
    backgroundColor: Colors.success + "DD",
  },
  labelText: {
    fontSize: 11,
    fontWeight: "700" as const,
    color: Colors.white,
    textTransform: "uppercase" as const,
  },
  arrowDivider: {
    width: 40,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    backgroundColor: Colors.surface,
  },
  arrowCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.primary,
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },
  projectInfo: {
    padding: 12,
  },
  projectName: {
    fontSize: 15,
    fontWeight: "600" as const,
    color: Colors.text,
    marginBottom: 4,
  },
  category: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.9)",
    justifyContent: "center" as const,
    padding: 20,
  },
  modalContent: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    maxHeight: "90%",
    overflow: "hidden" as const,
  },
  closeButton: {
    position: "absolute" as const,
    top: 16,
    right: 16,
    zIndex: 10,
    backgroundColor: Colors.surface,
    borderRadius: 20,
    padding: 8,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700" as const,
    color: Colors.text,
    padding: 20,
    paddingRight: 60,
  },
  modalImagesContainer: {
    gap: 16,
    paddingHorizontal: 20,
  },
  modalImageSection: {
    gap: 8,
  },
  modalImageLabel: {
    fontSize: 14,
    fontWeight: "700" as const,
    color: Colors.textSecondary,
    textTransform: "uppercase" as const,
  },
  modalImage: {
    width: "100%",
    height: 200,
    borderRadius: 12,
  },
  modalDetails: {
    padding: 20,
    gap: 16,
  },
  modalDescription: {
    fontSize: 15,
    lineHeight: 22,
    color: Colors.text,
  },
  modalMeta: {
    flexDirection: "row" as const,
    gap: 24,
  },
  metaItem: {
    gap: 4,
  },
  metaLabel: {
    fontSize: 12,
    fontWeight: "600" as const,
    color: Colors.textSecondary,
    textTransform: "uppercase" as const,
  },
  metaValue: {
    fontSize: 14,
    color: Colors.text,
  },
});
