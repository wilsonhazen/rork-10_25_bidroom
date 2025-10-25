import Colors from "@/constants/colors";
import { Stack } from "expo-router";
import { FileText } from "lucide-react-native";
import React from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

export default function TermsScreen() {
  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          headerShown: true,
          headerTitle: "Terms of Service",
          headerStyle: {
            backgroundColor: Colors.surface,
          },
          headerTitleStyle: {
            color: Colors.text,
            fontWeight: "700" as const,
          },
          headerTintColor: Colors.primary,
        }}
      />
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <FileText size={48} color={Colors.primary} />
          <Text style={styles.headerTitle}>Terms of Service</Text>
          <Text style={styles.headerDescription}>
            Last updated: January 2025
          </Text>
        </View>

        <View style={styles.content}>
          <Text style={styles.sectionTitle}>1. Acceptance of Terms</Text>
          <Text style={styles.paragraph}>
            By accessing and using Bidroom, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
          </Text>

          <Text style={styles.sectionTitle}>2. Use License</Text>
          <Text style={styles.paragraph}>
            Permission is granted to temporarily access Bidroom for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:
          </Text>
          <Text style={styles.bulletPoint}>• Modify or copy the materials</Text>
          <Text style={styles.bulletPoint}>• Use the materials for any commercial purpose</Text>
          <Text style={styles.bulletPoint}>• Attempt to decompile or reverse engineer any software</Text>
          <Text style={styles.bulletPoint}>• Remove any copyright or proprietary notations</Text>

          <Text style={styles.sectionTitle}>3. User Accounts</Text>
          <Text style={styles.paragraph}>
            When you create an account with us, you must provide accurate, complete, and current information at all times. Failure to do so constitutes a breach of the Terms, which may result in immediate termination of your account.
          </Text>

          <Text style={styles.sectionTitle}>4. User Content</Text>
          <Text style={styles.paragraph}>
            Our service allows you to post, link, store, share and otherwise make available certain information, text, graphics, videos, or other material. You are responsible for the content that you post to the service, including its legality, reliability, and appropriateness.
          </Text>

          <Text style={styles.sectionTitle}>5. Bidding and Contracts</Text>
          <Text style={styles.paragraph}>
            When you submit a bid through Bidroom, you agree that:
          </Text>
          <Text style={styles.bulletPoint}>• All information provided is accurate and truthful</Text>
          <Text style={styles.bulletPoint}>• You have the authority to enter into binding contracts</Text>
          <Text style={styles.bulletPoint}>• You will honor all accepted bids and commitments</Text>
          <Text style={styles.bulletPoint}>• Bidroom acts as a platform and is not a party to contracts</Text>

          <Text style={styles.sectionTitle}>6. Payment Terms</Text>
          <Text style={styles.paragraph}>
            Payment terms are agreed upon between the parties directly. Bidroom may charge platform fees for certain services, which will be clearly disclosed before any transaction.
          </Text>

          <Text style={styles.sectionTitle}>7. Intellectual Property</Text>
          <Text style={styles.paragraph}>
            The service and its original content, features, and functionality are and will remain the exclusive property of Bidroom and its licensors. The service is protected by copyright, trademark, and other laws.
          </Text>

          <Text style={styles.sectionTitle}>8. Termination</Text>
          <Text style={styles.paragraph}>
            We may terminate or suspend your account immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms.
          </Text>

          <Text style={styles.sectionTitle}>9. Limitation of Liability</Text>
          <Text style={styles.paragraph}>
            In no event shall Bidroom, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses.
          </Text>

          <Text style={styles.sectionTitle}>10. Disclaimer</Text>
          <Text style={styles.paragraph}>
            Your use of the service is at your sole risk. The service is provided on an "AS IS" and "AS AVAILABLE" basis. The service is provided without warranties of any kind, whether express or implied.
          </Text>

          <Text style={styles.sectionTitle}>11. Governing Law</Text>
          <Text style={styles.paragraph}>
            These Terms shall be governed and construed in accordance with the laws of the United States, without regard to its conflict of law provisions.
          </Text>

          <Text style={styles.sectionTitle}>12. Changes to Terms</Text>
          <Text style={styles.paragraph}>
            We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision is material, we will try to provide at least 30 days' notice prior to any new terms taking effect.
          </Text>

          <Text style={styles.sectionTitle}>13. Contact Us</Text>
          <Text style={styles.paragraph}>
            If you have any questions about these Terms, please contact us at:
          </Text>
          <Text style={styles.paragraph}>
            Email: legal@bidroom.com{"\n"}
            Phone: 1-800-BIDROOM
          </Text>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            © 2025 Bidroom. All rights reserved.
          </Text>
        </View>
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
  header: {
    alignItems: "center" as const,
    paddingVertical: 32,
    paddingHorizontal: 24,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "700" as const,
    color: Colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  headerDescription: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  content: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: Colors.text,
    marginTop: 24,
    marginBottom: 12,
  },
  paragraph: {
    fontSize: 15,
    color: Colors.textSecondary,
    lineHeight: 24,
    marginBottom: 16,
  },
  bulletPoint: {
    fontSize: 15,
    color: Colors.textSecondary,
    lineHeight: 24,
    marginLeft: 16,
    marginBottom: 8,
  },
  footer: {
    alignItems: "center" as const,
    paddingVertical: 32,
    paddingHorizontal: 24,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  footerText: {
    fontSize: 13,
    color: Colors.textTertiary,
    textAlign: "center" as const,
  },
});
