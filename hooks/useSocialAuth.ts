import { useState, useCallback } from "react";
import { Platform } from "react-native";
import { useAuth } from "@/contexts/AuthContext";

export function useSocialAuth() {
  const { socialLogin } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const loginWithGoogle = useCallback(async () => {
    if (Platform.OS === "web") {
      setIsLoading(true);
      try {
        await socialLogin("google", {
          id: "google-" + Date.now(),
          email: "demo@google.com",
          name: "Google User",
          avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Google",
        });
        return { success: true };
      } catch (error) {
        console.error("Google login error:", error);
        return { success: false, error: "Google login failed" };
      } finally {
        setIsLoading(false);
      }
    }

    setIsLoading(true);
    try {
      await socialLogin("google", {
        id: "google-" + Date.now(),
        email: "demo@google.com",
        name: "Google User",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Google",
      });
      return { success: true };
    } catch (error) {
      console.error("Google login error:", error);
      return { success: false, error: "Google login failed" };
    } finally {
      setIsLoading(false);
    }
  }, [socialLogin]);

  const loginWithApple = useCallback(async () => {
    setIsLoading(true);
    try {
      await socialLogin("apple", {
        id: "apple-" + Date.now(),
        email: "demo@apple.com",
        name: "Apple User",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Apple",
      });
      return { success: true };
    } catch (error) {
      console.error("Apple login error:", error);
      return { success: false, error: "Apple login failed" };
    } finally {
      setIsLoading(false);
    }
  }, [socialLogin]);

  const loginWithGitHub = useCallback(async () => {
    if (Platform.OS === "web") {
      setIsLoading(true);
      try {
        await socialLogin("github", {
          id: "github-" + Date.now(),
          email: "demo@github.com",
          name: "GitHub User",
          avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=GitHub",
        });
        return { success: true };
      } catch (error) {
        console.error("GitHub login error:", error);
        return { success: false, error: "GitHub login failed" };
      } finally {
        setIsLoading(false);
      }
    }

    setIsLoading(true);
    try {
      await socialLogin("github", {
        id: "github-" + Date.now(),
        email: "demo@github.com",
        name: "GitHub User",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=GitHub",
      });
      return { success: true };
    } catch (error) {
      console.error("GitHub login error:", error);
      return { success: false, error: "GitHub login failed" };
    } finally {
      setIsLoading(false);
    }
  }, [socialLogin]);

  return {
    isLoading,
    loginWithGoogle,
    loginWithApple,
    loginWithGitHub,
  };
}
