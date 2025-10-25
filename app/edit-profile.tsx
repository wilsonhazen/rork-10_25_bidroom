import Colors from "@/constants/colors";
import { useAuth } from "@/contexts/AuthContext";
import { Stack, useRouter } from "expo-router";
import {
  Building2,
  Camera,
  Mail,
  Phone,
  User,
  Video,
} from "lucide-react-native";
import React, { useState } from "react";
import {
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function EditProfileScreen() {
  const router = useRouter();
  const { user, updateUser } = useAuth();

  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [company, setCompany] = useState(user?.company || "");
  const [bio, setBio] = useState("");
  const [trade, setTrade] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const handleImageUpload = () => {
    if (Platform.OS === "web") {
      Alert.alert(
        "Upload Profile Photo",
        "Image upload integration coming soon!\n\nWill support:\n- Camera capture\n- Photo library selection\n- Image cropping\n- Auto-resize & optimization"
      );
    } else {
      Alert.alert(
        "Upload Profile Photo",
        "Choose an option",
        [
          {
            text: "Take Photo",
            onPress: () => {
              Alert.alert("Camera", "Camera integration coming soon!");
            },
          },
          {
            text: "Choose from Library",
            onPress: () => {
              Alert.alert("Library", "Photo library integration coming soon!");
            },
          },
          {
            text: "Cancel",
            style: "cancel",
          },
        ]
      );
    }
  };

  const handleVideoUpload = () => {
    if (Platform.OS === "web") {
      Alert.alert(
        "Upload Introduction Video",
        "Video upload integration coming soon!\n\nWill support:\n- Video recording\n- Video library selection\n- Video trimming (max 60s)\n- Auto-compression\n\nPerfect for showcasing your work or introducing your team!"
      );
    } else {
      Alert.alert(
        "Upload Introduction Video",
        "Choose an option",
        [
          {
            text: "Record Video",
            onPress: () => {
              Alert.alert("Camera", "Video recording integration coming soon!");
            },
          },
          {
            text: "Choose from Library",
            onPress: () => {
              Alert.alert("Library", "Video library integration coming soon!");
            },
          },
          {
            text: "Cancel",
            style: "cancel",
          },
        ]
      );
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      await updateUser({
        name,
        email,
        phone,
        company,
      });

      Alert.alert("Success", "Profile updated successfully!");
      router.back();
    } catch (error) {
      console.error("Failed to save profile:", error);
      Alert.alert("Error", "Failed to save profile. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          headerShown: true,
          headerTitle: "Edit Profile",
          headerStyle: {
            backgroundColor: Colors.surface,
          },
          headerTitleStyle: {
            color: Colors.text,
            fontWeight: "700" as const,
          },
          headerRight: () => (
            <TouchableOpacity onPress={handleSave} disabled={isSaving}>
              <Text style={[styles.saveButton, isSaving && styles.saveButtonDisabled]}>
                {isSaving ? "Saving..." : "Save"}
              </Text>
            </TouchableOpacity>
          ),
        }}
      />

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.mediaSection}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatarLarge}>
              <Text style={styles.avatarLargeText}>
                {name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </Text>
            </View>
            <TouchableOpacity style={styles.cameraButton} onPress={handleImageUpload}>
              <Camera size={20} color={Colors.surface} />
            </TouchableOpacity>
          </View>
          <Text style={styles.avatarLabel}>Profile Photo</Text>

          <View style={styles.videoPlaceholder}>
            <View style={styles.videoPlaceholderContent}>
              <Video size={48} color={Colors.textTertiary} />
              <Text style={styles.videoPlaceholderTitle}>Introduction Video</Text>
              <Text style={styles.videoPlaceholderSubtitle}>
                Showcase your work or introduce your team
              </Text>
              <TouchableOpacity
                style={styles.uploadVideoButton}
                onPress={handleVideoUpload}
              >
                <Text style={styles.uploadVideoButtonText}>Upload Video</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>Personal Information</Text>
          
          <View style={styles.inputGroup}>
            <View style={styles.inputLabel}>
              <User size={18} color={Colors.textSecondary} />
              <Text style={styles.inputLabelText}>Full Name</Text>
            </View>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="Enter your full name"
              placeholderTextColor={Colors.textTertiary}
            />
          </View>

          <View style={styles.inputGroup}>
            <View style={styles.inputLabel}>
              <Mail size={18} color={Colors.textSecondary} />
              <Text style={styles.inputLabelText}>Email</Text>
            </View>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="Enter your email"
              placeholderTextColor={Colors.textTertiary}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputGroup}>
            <View style={styles.inputLabel}>
              <Phone size={18} color={Colors.textSecondary} />
              <Text style={styles.inputLabelText}>Phone</Text>
            </View>
            <TextInput
              style={styles.input}
              value={phone}
              onChangeText={setPhone}
              placeholder="Enter your phone number"
              placeholderTextColor={Colors.textTertiary}
              keyboardType="phone-pad"
            />
          </View>

          <View style={styles.inputGroup}>
            <View style={styles.inputLabel}>
              <Building2 size={18} color={Colors.textSecondary} />
              <Text style={styles.inputLabelText}>Company</Text>
            </View>
            <TextInput
              style={styles.input}
              value={company}
              onChangeText={setCompany}
              placeholder="Enter your company name"
              placeholderTextColor={Colors.textTertiary}
            />
          </View>

          <View style={styles.inputGroup}>
            <View style={styles.inputLabel}>
              <User size={18} color={Colors.textSecondary} />
              <Text style={styles.inputLabelText}>Bio</Text>
            </View>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={bio}
              onChangeText={setBio}
              placeholder="Tell us about yourself and your experience..."
              placeholderTextColor={Colors.textTertiary}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>
        </View>

        {(user?.role === "Subcontractor" || user?.role === "Trade Specialist") && (
          <View style={styles.formSection}>
            <Text style={styles.sectionTitle}>Professional Information</Text>
            
            <View style={styles.inputGroup}>
              <View style={styles.inputLabel}>
                <Building2 size={18} color={Colors.textSecondary} />
                <Text style={styles.inputLabelText}>Primary Trade</Text>
              </View>
              <TextInput
                style={styles.input}
                value={trade}
                onChangeText={setTrade}
                placeholder="e.g., Electrical, Plumbing, HVAC"
                placeholderTextColor={Colors.textTertiary}
              />
              <Text style={styles.inputHint}>
                This helps others find you for specific jobs
              </Text>
            </View>
          </View>
        )}

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollView: {
    flex: 1,
  },
  saveButton: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: Colors.primary,
    marginRight: 16,
  },
  saveButtonDisabled: {
    color: Colors.textTertiary,
  },
  mediaSection: {
    alignItems: "center" as const,
    paddingVertical: 32,
    paddingHorizontal: 16,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  avatarContainer: {
    position: "relative" as const,
    marginBottom: 8,
  },
  avatarLarge: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: Colors.primary + "20",
    alignItems: "center" as const,
    justifyContent: "center" as const,
    borderWidth: 4,
    borderColor: Colors.surface,
  },
  avatarLargeText: {
    fontSize: 40,
    fontWeight: "700" as const,
    color: Colors.primary,
  },
  cameraButton: {
    position: "absolute" as const,
    right: 0,
    bottom: 0,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    borderWidth: 3,
    borderColor: Colors.surface,
  },
  avatarLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 24,
  },
  videoPlaceholder: {
    width: "100%" as const,
    backgroundColor: Colors.background,
    borderRadius: 12,
    borderWidth: 2,
    borderStyle: "dashed" as const,
    borderColor: Colors.border,
    overflow: "hidden" as const,
  },
  videoPlaceholderContent: {
    padding: 32,
    alignItems: "center" as const,
  },
  videoPlaceholderTitle: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: Colors.text,
    marginTop: 12,
    marginBottom: 4,
  },
  videoPlaceholderSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: "center" as const,
    marginBottom: 16,
  },
  uploadVideoButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: Colors.primary,
    borderRadius: 8,
  },
  uploadVideoButtonText: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.surface,
  },
  formSection: {
    paddingHorizontal: 16,
    paddingTop: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: Colors.text,
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 8,
    marginBottom: 8,
  },
  inputLabelText: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.textSecondary,
  },
  input: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: Colors.text,
  },
  textArea: {
    minHeight: 100,
    paddingTop: 12,
  },
  inputHint: {
    fontSize: 12,
    color: Colors.textTertiary,
    marginTop: 4,
  },
  bottomSpacer: {
    height: 32,
  },
});
