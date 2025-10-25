import createContextHook from "@nkzw/create-context-hook";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCallback, useEffect, useMemo, useState } from "react";
import { UserRole } from "@/types";
import { TEST_USERS, TEST_CREDENTIALS } from "@/mocks/test-users";
import * as AuthSession from "expo-auth-session";
import * as WebBrowser from "expo-web-browser";
import { Platform } from "react-native";

WebBrowser.maybeCompleteAuthSession();

export const ROLE_PERMISSIONS = {
  Admin: {
    canManageUsers: true,
    canCreateBids: true,
    canViewAllBids: true,
    canEditAllProjects: true,
    canManagePayments: true,
    canViewReports: true,
    canInviteContractors: true,
    canSchedule: true,
    canPostJobs: true,
    canManageApplications: true,
  },
  GC: {
    canManageUsers: false,
    canCreateBids: true,
    canViewAllBids: true,
    canEditAllProjects: true,
    canManagePayments: true,
    canViewReports: true,
    canInviteContractors: true,
    canSchedule: true,
    canPostJobs: false,
    canManageApplications: false,
  },
  "Project Manager": {
    canManageUsers: false,
    canCreateBids: true,
    canViewAllBids: true,
    canEditAllProjects: false,
    canManagePayments: false,
    canViewReports: true,
    canInviteContractors: true,
    canSchedule: true,
    canPostJobs: true,
    canManageApplications: true,
  },
  Subcontractor: {
    canManageUsers: false,
    canCreateBids: false,
    canViewAllBids: false,
    canEditAllProjects: false,
    canManagePayments: false,
    canViewReports: false,
    canInviteContractors: false,
    canSchedule: false,
    canPostJobs: false,
    canManageApplications: false,
  },
  "Trade Specialist": {
    canManageUsers: false,
    canCreateBids: false,
    canViewAllBids: false,
    canEditAllProjects: false,
    canManagePayments: false,
    canViewReports: false,
    canInviteContractors: false,
    canSchedule: false,
    canPostJobs: false,
    canManageApplications: false,
  },
  Viewer: {
    canManageUsers: false,
    canCreateBids: false,
    canViewAllBids: false,
    canEditAllProjects: false,
    canManagePayments: false,
    canViewReports: true,
    canInviteContractors: false,
    canSchedule: false,
    canPostJobs: false,
    canManageApplications: false,
  },
};

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  company: string;
  phone: string;
  avatar?: string | null;
}



export const [AuthProvider, useAuth] = createContextHook(() => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      await new Promise(resolve => setTimeout(resolve, 100));
      const stored = await AsyncStorage.getItem("user");
      if (stored) {
        setUser(JSON.parse(stored));
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error("Failed to load user:", error);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  const updateUser = useCallback(async (updates: Partial<User>) => {
    if (!user) return;
    
    const updated = { ...user, ...updates };
    setUser(updated);
    
    try {
      await AsyncStorage.setItem("user", JSON.stringify(updated));
    } catch (error) {
      console.error("Failed to update user:", error);
    }
  }, [user]);

  const login = useCallback(async (email: string, password: string) => {
    try {
      console.log("Login attempt:", email);
      
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const testUser = TEST_USERS.find(u => u.email === email);
      
      const validCredential = Object.values(TEST_CREDENTIALS).find(
        cred => cred.email === email && cred.password === password
      );
      
      let userToLogin: User;
      
      if (testUser && validCredential) {
        userToLogin = testUser;
        console.log("Test user login:", testUser.role);
      } else {
        userToLogin = {
          id: Date.now().toString(),
          name: email.split("@")[0],
          email,
          role: email.includes("admin") ? "Admin" : "GC",
          company: "Demo Company",
          phone: "(555) 123-4567",
        };
        console.log("Demo user login");
      }
      
      await AsyncStorage.setItem("user", JSON.stringify(userToLogin));
      setUser(userToLogin);
      setIsAuthenticated(true);
      
      return { success: true };
    } catch (error) {
      console.error("Login failed:", error);
      return { success: false, error: "Login failed" };
    }
  }, []);

  const register = useCallback(async (data: {
    name: string;
    email: string;
    password: string;
    company: string;
    phone: string;
    role: UserRole;
  }) => {
    try {
      console.log("Registration:", data);
      
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const newUser: User = {
        id: Date.now().toString(),
        name: data.name,
        email: data.email,
        role: data.role,
        company: data.company,
        phone: data.phone,
      };
      
      await AsyncStorage.setItem("user", JSON.stringify(newUser));
      setUser(newUser);
      setIsAuthenticated(true);
      
      return { success: true };
    } catch (error) {
      console.error("Registration failed:", error);
      return { success: false, error: "Registration failed" };
    }
  }, []);

  const socialLogin = useCallback(async (provider: "google" | "apple" | "github", userData: {
    id: string;
    email: string;
    name: string;
    avatar?: string;
  }) => {
    try {
      console.log(`${provider} login:`, userData);
      
      const newUser: User = {
        id: userData.id,
        name: userData.name,
        email: userData.email,
        role: "GC",
        company: "New Company",
        phone: "",
        avatar: userData.avatar,
      };
      
      await AsyncStorage.setItem("user", JSON.stringify(newUser));
      await AsyncStorage.setItem("needs_onboarding", "true");
      setUser(newUser);
      setIsAuthenticated(true);
      
      return { success: true, needsOnboarding: true };
    } catch (error) {
      console.error(`${provider} login failed:`, error);
      return { success: false, error: `${provider} login failed` };
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await AsyncStorage.removeItem("user");
      setUser(null);
      setIsAuthenticated(false);
    } catch (error) {
      console.error("Failed to logout:", error);
    }
  }, []);

  const hasPermission = useCallback((permission: keyof typeof ROLE_PERMISSIONS.Admin) => {
    if (!user) return false;
    return ROLE_PERMISSIONS[user.role]?.[permission] || false;
  }, [user]);

  return useMemo(() => ({
    user,
    isLoading: isLoading || !mounted,
    isAuthenticated,
    login,
    register,
    socialLogin,
    updateUser,
    logout,
    hasPermission,
  }), [user, isLoading, mounted, isAuthenticated, login, register, socialLogin, updateUser, logout, hasPermission]);
});
