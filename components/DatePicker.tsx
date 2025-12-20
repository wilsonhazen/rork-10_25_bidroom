import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from "react-native";
import DateTimePicker, { DateTimePickerEvent } from "@react-native-community/datetimepicker";
import { Calendar } from "lucide-react-native";
import Colors from "@/constants/colors";

interface DatePickerProps {
  value: string;
  onChange: (date: string) => void;
  placeholder?: string;
  label?: string;
  style?: any;
  minimumDate?: Date;
}

export default function DatePicker({
  value,
  onChange,
  placeholder = "Select date",
  label,
  style,
  minimumDate,
}: DatePickerProps) {
  const [showPicker, setShowPicker] = useState(false);
  const [date, setDate] = useState<Date>(
    value ? new Date(value) : new Date()
  );
  const [tempDate, setTempDate] = useState<Date>(date);

  useEffect(() => {
    if (value) {
      const newDate = new Date(value);
      setDate(newDate);
      setTempDate(newDate);
    }
  }, [value]);

  const handleOpenPicker = () => {
    setTempDate(date);
    setShowPicker(true);
  };

  const handleChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    if (Platform.OS === "android") {
      setShowPicker(false);
      if (event.type === "set" && selectedDate) {
        setDate(selectedDate);
        setTempDate(selectedDate);
        const formattedDate = selectedDate.toISOString().split("T")[0];
        onChange(formattedDate);
      }
    } else {
      if (event.type === "set" && selectedDate) {
        setTempDate(selectedDate);
      }
      
      if (event.type === "dismissed") {
        setShowPicker(false);
      }
    }
  };

  const handleIOSConfirm = () => {
    setDate(tempDate);
    const formattedDate = tempDate.toISOString().split("T")[0];
    onChange(formattedDate);
    setShowPicker(false);
  };

  const handleIOSCancel = () => {
    setTempDate(date);
    setShowPicker(false);
  };

  const formatDisplayDate = (dateString: string) => {
    if (!dateString) return "";
    const d = new Date(dateString);
    return d.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (Platform.OS === "web") {
    return (
      <View style={style}>
        {label && <Text style={styles.label}>{label}</Text>}
        <input
          style={{
            backgroundColor: Colors.surface,
            borderRadius: 12,
            paddingLeft: 16,
            paddingRight: 16,
            paddingTop: 12,
            paddingBottom: 12,
            fontSize: 16,
            color: Colors.text,
            borderWidth: 1,
            borderStyle: "solid",
            borderColor: Colors.border,
            width: "100%",
            fontFamily: "inherit",
          }}
          type="date"
          value={value}
          onChange={(e: any) => onChange(e.target.value)}
          placeholder={placeholder}
        />
      </View>
    );
  }

  return (
    <View style={[styles.container, style]}>
      {label && <Text style={styles.label}>{label}</Text>}
      <TouchableOpacity
        style={styles.dateButton}
        onPress={handleOpenPicker}
      >
        <Calendar size={20} color={Colors.primary} style={styles.icon} />
        <Text style={[styles.dateButtonText, !value && styles.placeholder]} numberOfLines={1}>
          {value ? formatDisplayDate(value) : placeholder}
        </Text>
      </TouchableOpacity>

      {showPicker && Platform.OS === "ios" && (
        <View style={styles.iosPickerContainer}>
          <View style={styles.iosPickerHeader}>
            <TouchableOpacity onPress={handleIOSCancel}>
              <Text style={styles.iosPickerButton}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleIOSConfirm}>
              <Text style={[styles.iosPickerButton, styles.iosPickerConfirm]}>Done</Text>
            </TouchableOpacity>
          </View>
          <DateTimePicker
            value={tempDate}
            mode="date"
            display="spinner"
            onChange={handleChange}
            minimumDate={minimumDate}
            style={styles.iosPicker}
          />
        </View>
      )}
      {showPicker && Platform.OS === "android" && (
        <DateTimePicker
          value={date}
          mode="date"
          display="default"
          onChange={handleChange}
          minimumDate={minimumDate}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%" as const,
  },
  label: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.text,
    marginBottom: 8,
  },
  input: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: Colors.text,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  dateButton: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    padding: 12,
    width: "100%" as const,
  },
  icon: {
    marginRight: 12,
    flexShrink: 0,
  },
  dateButtonText: {
    fontSize: 15,
    color: Colors.text,
    flex: 1,
  },
  placeholder: {
    color: Colors.textTertiary,
  },
  iosPickerContainer: {
    position: "absolute" as const,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 5,
    zIndex: 1000,
  },
  iosPickerHeader: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    alignItems: "center" as const,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  iosPickerButton: {
    fontSize: 16,
    color: Colors.primary,
  },
  iosPickerConfirm: {
    fontWeight: "600" as const,
  },
  iosPicker: {
    backgroundColor: Colors.surface,
  },
});
