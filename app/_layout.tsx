import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { JobsProvider } from "@/contexts/JobsContext";
import { AppointmentsProvider } from "@/contexts/AppointmentsContext";
import { BidsProvider } from "@/contexts/BidsContext";
import { ProjectsProvider } from "@/contexts/ProjectsContext";
import { NotificationsProvider } from "@/contexts/NotificationsContext";
import { SavedContractorsProvider } from "@/contexts/SavedContractorsContext";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack, useSegments, useRouter } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { ActivityIndicator, View, StyleSheet } from "react-native";
import Colors from "@/constants/colors";

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

function RootLayoutNav() {
  const { isAuthenticated, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === "(tabs)";
    const inAuthScreen = segments[0] === "login" || segments[0] === "register";

    if (!isAuthenticated && inAuthGroup) {
      router.replace("/login");
    } else if (isAuthenticated && inAuthScreen) {
      router.replace("/");
    }
  }, [isAuthenticated, isLoading, segments, router]);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerBackTitle: "Back" }}>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="login" options={{ headerShown: false }} />
      <Stack.Screen name="register" options={{ headerShown: false }} />
      <Stack.Screen name="job-details" options={{ headerShown: false }} />
      <Stack.Screen name="bid-details" options={{ headerShown: false }} />
      <Stack.Screen name="appointment-details" options={{ headerShown: false }} />
      <Stack.Screen name="contractor-profile" options={{ headerShown: false }} />
      <Stack.Screen name="notifications" options={{ headerShown: false }} />
      <Stack.Screen name="messages" options={{ headerShown: false }} />
      <Stack.Screen name="settings" options={{ headerShown: false }} />
      <Stack.Screen name="privacy" options={{ headerShown: false }} />
      <Stack.Screen name="help" options={{ headerShown: false }} />
      <Stack.Screen name="terms" options={{ headerShown: false }} />
      <Stack.Screen name="project-setup" options={{ headerShown: false }} />
      <Stack.Screen name="project-dashboard" options={{ headerShown: false }} />
      <Stack.Screen name="milestone-details" options={{ headerShown: false }} />
      <Stack.Screen name="project-closeout" options={{ headerShown: false }} />
    </Stack>
  );
}

export default function RootLayout() {
  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <NotificationsProvider>
          <JobsProvider>
            <AppointmentsProvider>
              <BidsProvider>
                <ProjectsProvider>
                  <SavedContractorsProvider>
                    <GestureHandlerRootView style={{ flex: 1 }}>
                      <RootLayoutNav />
                    </GestureHandlerRootView>
                  </SavedContractorsProvider>
                </ProjectsProvider>
              </BidsProvider>
            </AppointmentsProvider>
          </JobsProvider>
        </NotificationsProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.background,
  },
});
