import Colors from "@/constants/colors";
import { Link, Stack } from "expo-router";
import { AlertCircle } from "lucide-react-native";
import { StyleSheet, Text, View } from "react-native";

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: "Not Found" }} />
      <View style={styles.container}>
        <AlertCircle size={64} color={Colors.error} />
        <Text style={styles.title}>Page Not Found</Text>
        <Text style={styles.description}>
          The page you&apos;re looking for doesn&apos;t exist.
        </Text>
        <Link href="/" style={styles.link}>
          <Text style={styles.linkText}>Go to Home</Text>
        </Link>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    padding: 32,
    backgroundColor: Colors.background,
  },
  title: {
    fontSize: 24,
    fontWeight: "700" as const,
    color: Colors.text,
    marginTop: 24,
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: "center" as const,
    marginBottom: 24,
  },
  link: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 10,
  },
  linkText: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: Colors.surface,
  },
});
