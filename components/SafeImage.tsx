import React from "react";
import { Image, ImageProps, View, StyleSheet } from "react-native";
import { User } from "lucide-react-native";
import Colors from "@/constants/colors";

interface SafeImageProps extends Omit<ImageProps, "source"> {
  uri?: string | null;
  fallbackIcon?: React.ReactNode;
}

export default function SafeImage({
  uri,
  style,
  fallbackIcon,
  ...rest
}: SafeImageProps) {
  const hasValidUri = uri && uri.trim().length > 0;

  if (!hasValidUri) {
    return (
      <View style={[styles.fallbackContainer, style]}>
        {fallbackIcon || <User size={24} color={Colors.textSecondary} />}
      </View>
    );
  }

  return (
    <Image
      {...rest}
      source={{ uri }}
      style={style}
      onError={(error) => {
        console.warn("Image failed to load:", uri, error);
      }}
    />
  );
}

const styles = StyleSheet.create({
  fallbackContainer: {
    backgroundColor: Colors.background,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    borderWidth: 1,
    borderColor: Colors.border,
  },
});
