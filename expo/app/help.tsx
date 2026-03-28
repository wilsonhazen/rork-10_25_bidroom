import Colors from "@/constants/colors";
import { Stack } from "expo-router";
import { HelpCircle, MessageCircle, Mail, Book, Phone } from "lucide-react-native";
import React from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Alert,
  Linking,
} from "react-native";

interface HelpItemProps {
  icon: React.ReactNode;
  label: string;
  description: string;
  onPress: () => void;
}

function HelpItem({ icon, label, description, onPress }: HelpItemProps) {
  return (
    <TouchableOpacity style={styles.helpItem} onPress={onPress}>
      <View style={styles.helpLeft}>
        <View style={styles.helpIcon}><Text>{icon}</Text></View>
        <View style={styles.helpContent}>
          <Text style={styles.helpLabel}>{label}</Text>
          <Text style={styles.helpDescription}>{description}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

interface FAQItemProps {
  question: string;
  answer: string;
}

function FAQItem({ question, answer }: FAQItemProps) {
  const [expanded, setExpanded] = React.useState(false);

  return (
    <TouchableOpacity
      style={styles.faqItem}
      onPress={() => setExpanded(!expanded)}
    >
      <Text style={styles.faqQuestion}>{question}</Text>
      {expanded && <Text style={styles.faqAnswer}>{answer}</Text>}
    </TouchableOpacity>
  );
}

export default function HelpScreen() {
  const handleChat = () => {
    Alert.alert(
      "Live Chat",
      "Our support team is available Monday-Friday, 9AM-5PM EST.",
      [{ text: "OK" }]
    );
  };

  const handleEmail = async () => {
    const email = "support@bidroom.com";
    const url = `mailto:${email}`;
    
    try {
      await Linking.openURL(url);
    } catch (error) {
      Alert.alert("Error", "Could not open email client");
    }
  };

  const handlePhone = async () => {
    Alert.alert(
      "Contact Support",
      "Call us at: 1-800-BIDROOM\n(1-800-243-7666)",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Call", 
          onPress: async () => {
            try {
              await Linking.openURL("tel:18002437666");
            } catch (error) {
              Alert.alert("Error", "Could not open phone dialer");
            }
          }
        }
      ]
    );
  };

  const handleDocs = () => {
    Alert.alert(
      "Documentation",
      "View our comprehensive guides and tutorials.",
      [{ text: "OK" }]
    );
  };

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          headerShown: true,
          headerTitle: "Help & Support",
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
          <HelpCircle size={48} color={Colors.primary} />
          <Text style={styles.headerTitle}>How can we help?</Text>
          <Text style={styles.headerDescription}>
            Get answers to your questions or reach out to our support team.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contact Support</Text>
          <View style={styles.sectionContent}>
            <HelpItem
              icon={<MessageCircle size={20} color={Colors.primary} />}
              label="Live Chat"
              description="Chat with our support team in real-time"
              onPress={handleChat}
            />
            <HelpItem
              icon={<Mail size={20} color={Colors.primary} />}
              label="Email Support"
              description="Send us an email and we'll respond within 24 hours"
              onPress={handleEmail}
            />
            <HelpItem
              icon={<Phone size={20} color={Colors.primary} />}
              label="Phone Support"
              description="Call us for immediate assistance"
              onPress={handlePhone}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Resources</Text>
          <View style={styles.sectionContent}>
            <HelpItem
              icon={<Book size={20} color={Colors.textSecondary} />}
              label="Documentation"
              description="Browse guides and tutorials"
              onPress={handleDocs}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
          <View style={styles.sectionContent}>
            <FAQItem
              question="How do I post a new job?"
              answer="Navigate to the Jobs tab and tap the '+' button in the top right. Fill out the job details and submit."
            />
            <FAQItem
              question="How do I submit a bid?"
              answer="Open any job listing and tap 'Submit Bid'. Enter your bid amount, timeline, and any relevant details."
            />
            <FAQItem
              question="How do I schedule an appointment?"
              answer="From a job detail page, tap 'Book Appointment' and select a date and time that works for you."
            />
            <FAQItem
              question="How do I verify my account?"
              answer="Complete the verification process in your profile settings to gain access to all features."
            />
            <FAQItem
              question="Can I edit or delete my bid?"
              answer="Yes, you can edit or withdraw your bid before it's accepted. Go to your Bids tab and select the bid you want to modify."
            />
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Still need help? Our support team is here to assist you.
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
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "700" as const,
    color: Colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  headerDescription: {
    fontSize: 15,
    color: Colors.textSecondary,
    textAlign: "center" as const,
    lineHeight: 22,
  },
  section: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "700" as const,
    color: Colors.textTertiary,
    textTransform: "uppercase" as const,
    letterSpacing: 0.5,
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  sectionContent: {
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: Colors.border,
  },
  helpItem: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  helpLeft: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    flex: 1,
  },
  helpIcon: {
    width: 32,
    height: 32,
    marginRight: 12,
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },
  helpContent: {
    flex: 1,
  },
  helpLabel: {
    fontSize: 16,
    color: Colors.text,
    fontWeight: "500" as const,
    marginBottom: 2,
  },
  helpDescription: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  faqItem: {
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  faqQuestion: {
    fontSize: 16,
    color: Colors.text,
    fontWeight: "600" as const,
    marginBottom: 8,
  },
  faqAnswer: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
    marginTop: 4,
  },
  footer: {
    alignItems: "center" as const,
    paddingVertical: 32,
    paddingHorizontal: 24,
  },
  footerText: {
    fontSize: 13,
    color: Colors.textTertiary,
    textAlign: "center" as const,
    lineHeight: 20,
  },
});
