import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Lightbulb, AlertTriangle, CheckCircle, Info } from "lucide-react-native";
import Colors from "@/constants/colors";
import { Contractor } from "@/types";
import { generateTrustSuggestions, calculateTrustScore } from "@/utils/trust";

interface TrustSuggestionsProps {
  contractor: Contractor;
}

export default function TrustSuggestions({ contractor }: TrustSuggestionsProps) {
  const suggestions = generateTrustSuggestions(contractor);
  const trustScore = calculateTrustScore(contractor);

  const getSuggestionIcon = (suggestion: string) => {
    if (suggestion.toLowerCase().includes("request") || 
        suggestion.toLowerCase().includes("confirm") ||
        suggestion.toLowerCase().includes("consider")) {
      return <AlertTriangle size={16} color={Colors.warning} />;
    }
    if (suggestion.toLowerCase().includes("top rated") || 
        suggestion.toLowerCase().includes("excellent") ||
        suggestion.toLowerCase().includes("highly")) {
      return <CheckCircle size={16} color={Colors.success} />;
    }
    return <Info size={16} color={Colors.info} />;
  };

  const getSuggestionColor = (suggestion: string): string => {
    if (suggestion.toLowerCase().includes("request") || 
        suggestion.toLowerCase().includes("confirm") ||
        suggestion.toLowerCase().includes("consider")) {
      return Colors.warning + "15";
    }
    if (suggestion.toLowerCase().includes("top rated") || 
        suggestion.toLowerCase().includes("excellent") ||
        suggestion.toLowerCase().includes("highly")) {
      return Colors.success + "15";
    }
    return Colors.info + "15";
  };

  if (suggestions.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Lightbulb size={20} color={Colors.primary} />
        <Text style={styles.title}>Trust Insights</Text>
      </View>

      <View style={styles.suggestionsContainer}>
        {suggestions.map((suggestion, index) => (
          <View 
            key={index} 
            style={[
              styles.suggestionItem,
              { backgroundColor: getSuggestionColor(suggestion) }
            ]}
          >
            <View style={styles.suggestionIcon}>
              {getSuggestionIcon(suggestion)}
            </View>
            <Text style={styles.suggestionText}>{suggestion}</Text>
          </View>
        ))}
      </View>

      {trustScore.score < 70 && (
        <View style={styles.warningBox}>
          <AlertTriangle size={18} color={Colors.warning} />
          <Text style={styles.warningText}>
            This contractor has a trust score below 70%. We recommend extra due diligence before hiring.
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.surface,
    padding: 20,
    marginBottom: 1,
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
  suggestionsContainer: {
    gap: 12,
  },
  suggestionItem: {
    flexDirection: "row" as const,
    padding: 14,
    borderRadius: 10,
    gap: 12,
    alignItems: "flex-start" as const,
  },
  suggestionIcon: {
    marginTop: 2,
  },
  suggestionText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    color: Colors.text,
  },
  warningBox: {
    flexDirection: "row" as const,
    backgroundColor: Colors.warning + "10",
    borderWidth: 1,
    borderColor: Colors.warning + "30",
    borderRadius: 10,
    padding: 14,
    marginTop: 16,
    gap: 12,
    alignItems: "flex-start" as const,
  },
  warningText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
    color: Colors.text,
    fontWeight: "500" as const,
  },
});
