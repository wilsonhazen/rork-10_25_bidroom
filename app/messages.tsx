import React, { useState, useMemo, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Modal,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import {
  MessageCircle,
  Send,
  Search,
  Clock,
  X,
} from "lucide-react-native";
import Colors from "@/constants/colors";
import { useAuth } from "@/contexts/AuthContext";
import { useJobs } from "@/contexts/JobsContext";
import { TEST_USERS } from "@/mocks/test-users";

type ConversationPreview = {
  id: string;
  otherUserId: string;
  otherUserName: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  jobTitle?: string;
};

export default function MessagesScreen() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const { user } = useAuth();
  const { messages, getJobById, sendMessage, markMessageAsRead } = useJobs();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);

  const conversations = useMemo(() => {
    if (!user) return [];

    const conversationMap = new Map<string, ConversationPreview>();

    messages.forEach((msg) => {
      const isReceiver = msg.receiverId === user.id;
      const isSender = msg.senderId === user.id;

      if (!isReceiver && !isSender) return;

      const otherUserId = isReceiver ? msg.senderId : msg.receiverId;
      const key = [user.id, otherUserId].sort().join("-");

      const existing = conversationMap.get(key);
      const isNewer = !existing || 
        new Date(msg.sentAt) > new Date(existing.lastMessageTime);

      if (isNewer || !existing) {
        const job = getJobById(msg.jobId);
        conversationMap.set(key, {
          id: key,
          otherUserId,
          otherUserName: isReceiver ? msg.senderName : "You",
          lastMessage: msg.message,
          lastMessageTime: msg.sentAt,
          unreadCount: isReceiver && !msg.read ? 
            (existing?.unreadCount || 0) + 1 : 
            (existing?.unreadCount || 0),
          jobTitle: job?.title,
        });
      }
    });

    return Array.from(conversationMap.values())
      .sort((a, b) => 
        new Date(b.lastMessageTime).getTime() - new Date(a.lastMessageTime).getTime()
      );
  }, [messages, user, getJobById]);

  const filteredConversations = useMemo(() => {
    return conversations.filter((conv) =>
      conv.otherUserName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conv.jobTitle?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [conversations, searchQuery]);

  const selectedMessages = useMemo(() => {
    if (!selectedConversation || !user) return [];

    const [userId1, userId2] = selectedConversation.split("-");
    const otherUserId = userId1 === user.id ? userId2 : userId1;

    return messages
      .filter(
        (msg) =>
          (msg.senderId === user.id && msg.receiverId === otherUserId) ||
          (msg.receiverId === user.id && msg.senderId === otherUserId)
      )
      .sort((a, b) => 
        new Date(a.sentAt).getTime() - new Date(b.sentAt).getTime()
      );
  }, [messages, selectedConversation, user]);

  const handleSendMessage = useCallback(async () => {
    if (!newMessage.trim() || !selectedConversation || !user) return;

    const [userId1, userId2] = selectedConversation.split("-");
    const otherUserId = userId1 === user.id ? userId2 : userId1;

    const lastMsg = selectedMessages[selectedMessages.length - 1];

    setSending(true);
    try {
      await sendMessage(
        lastMsg?.jobId || "",
        otherUserId,
        newMessage,
        lastMsg?.applicationId
      );
      setNewMessage("");
    } finally {
      setSending(false);
    }
  }, [newMessage, selectedConversation, user, selectedMessages, sendMessage]);

  const handleSelectConversation = useCallback((conversationId: string) => {
    setSelectedConversation(conversationId);
  }, []);

  useEffect(() => {
    if (selectedConversation && user) {
      const unreadMessages = selectedMessages.filter(
        (msg) => msg.receiverId === user.id && !msg.read
      );
      unreadMessages.forEach((msg) => markMessageAsRead(msg.id));
    }
  }, [selectedConversation, selectedMessages, user, markMessageAsRead]);

  useEffect(() => {
    if (params.userId && user) {
      const userId = Array.isArray(params.userId) ? params.userId[0] : params.userId;
      const conversationId = [user.id, userId].sort().join("-");
      const conversation = conversations.find(c => c.id === conversationId);
      
      if (conversation) {
        handleSelectConversation(conversationId);
      } else {
        const recipientUser = TEST_USERS.find(u => u.id === userId);
        if (recipientUser) {
          handleSelectConversation(conversationId);
        }
      }
    }
  }, [params.userId, user, conversations, handleSelectConversation]);

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          headerShown: true,
          headerTitle: "Messages",
          headerStyle: {
            backgroundColor: Colors.surface,
          },
          headerTitleStyle: {
            color: Colors.text,
            fontWeight: "700" as const,
          },
        }}
      />

      <View style={styles.searchContainer}>
        <Search size={20} color={Colors.textSecondary} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search messages..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor={Colors.textTertiary}
        />
      </View>

      <FlatList
        data={filteredConversations}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.conversationCard,
              item.unreadCount > 0 && styles.conversationUnread,
            ]}
            onPress={() => handleSelectConversation(item.id)}
          >
            <View style={styles.avatarContainer}>
              <Text style={styles.avatarText}>
                {item.otherUserName
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </Text>
              {item.unreadCount > 0 && (
                <View style={styles.unreadBadge}>
                  <Text style={styles.unreadBadgeText}>{item.unreadCount}</Text>
                </View>
              )}
            </View>

            <View style={styles.conversationContent}>
              <View style={styles.conversationHeader}>
                <Text style={styles.conversationName} numberOfLines={1}>
                  {item.otherUserName}
                </Text>
                <View style={styles.timeContainer}>
                  <Clock size={12} color={Colors.textTertiary} />
                  <Text style={styles.conversationTime}>
                    {formatTime(item.lastMessageTime)}
                  </Text>
                </View>
              </View>
              {item.jobTitle && (
                <Text style={styles.jobTitle} numberOfLines={1}>
                  {item.jobTitle}
                </Text>
              )}
              <Text
                style={[
                  styles.lastMessage,
                  item.unreadCount > 0 && styles.lastMessageUnread,
                ]}
                numberOfLines={1}
              >
                {item.lastMessage}
              </Text>
            </View>
          </TouchableOpacity>
        )}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <MessageCircle size={48} color={Colors.textTertiary} />
            <Text style={styles.emptyStateTitle}>No Messages</Text>
            <Text style={styles.emptyStateText}>
              Your conversations will appear here
            </Text>
          </View>
        }
      />

      <Modal
        visible={selectedConversation !== null}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        {selectedConversation && (
          <KeyboardAvoidingView
            style={styles.chatContainer}
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 20}
          >
            <View style={styles.chatHeader}>
              <Text style={styles.chatTitle}>
                {(() => {
                  const conv = conversations.find((c) => c.id === selectedConversation);
                  if (conv) return conv.otherUserName;
                  
                  if (params.userId && selectedConversation) {
                    const [userId1, userId2] = selectedConversation.split("-");
                    const otherUserId = userId1 === user?.id ? userId2 : userId1;
                    const recipientUser = TEST_USERS.find(u => u.id === otherUserId);
                    return recipientUser?.name || "Unknown User";
                  }
                  return "Chat";
                })()}
              </Text>
              <TouchableOpacity onPress={() => {
                setSelectedConversation(null);
                if (params.userId) {
                  router.back();
                }
              }}>
                <X size={24} color={Colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView
              style={styles.messagesScroll}
              contentContainerStyle={styles.messagesContent}
            >
              {selectedMessages.map((msg) => (
                <View
                  key={msg.id}
                  style={[
                    styles.messageContainer,
                    msg.senderId === user?.id
                      ? styles.messageContainerSent
                      : styles.messageContainerReceived,
                  ]}
                >
                  <View
                    style={[
                      styles.messageBubble,
                      msg.senderId === user?.id
                        ? styles.messageBubbleSent
                        : styles.messageBubbleReceived,
                    ]}
                  >
                    <Text
                      style={[
                        styles.messageText,
                        msg.senderId === user?.id && styles.messageTextSent,
                      ]}
                    >
                      {msg.message}
                    </Text>
                    <Text style={styles.messageTime}>
                      {new Date(msg.sentAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </Text>
                  </View>
                </View>
              ))}
            </ScrollView>

            <View style={styles.inputContainer}>
              <TextInput
                style={styles.messageInput}
                placeholder="Type a message..."
                value={newMessage}
                onChangeText={setNewMessage}
                placeholderTextColor={Colors.textTertiary}
                multiline
                maxLength={500}
              />
              <TouchableOpacity
                style={[
                  styles.sendButton,
                  (!newMessage.trim() || sending) && styles.sendButtonDisabled,
                ]}
                onPress={handleSendMessage}
                disabled={!newMessage.trim() || sending}
              >
                <Send size={20} color={Colors.white} />
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        )}
      </Modal>
    </View>
  );
}

function formatTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  searchContainer: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    margin: 16,
    gap: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: Colors.text,
  },
  listContent: {
    paddingHorizontal: 16,
  },
  conversationCard: {
    flexDirection: "row" as const,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  conversationUnread: {
    borderColor: Colors.primary,
    borderWidth: 2,
  },
  avatarContainer: {
    position: "relative" as const,
    marginRight: 12,
  },
  avatarText: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: Colors.primary + "20",
    textAlign: "center" as const,
    lineHeight: 50,
    fontSize: 18,
    fontWeight: "700" as const,
    color: Colors.primary,
  },
  unreadBadge: {
    position: "absolute" as const,
    top: -4,
    right: -4,
    backgroundColor: Colors.error,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    paddingHorizontal: 6,
  },
  unreadBadgeText: {
    fontSize: 11,
    fontWeight: "700" as const,
    color: Colors.white,
  },
  conversationContent: {
    flex: 1,
  },
  conversationHeader: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    marginBottom: 4,
  },
  conversationName: {
    flex: 1,
    fontSize: 16,
    fontWeight: "600" as const,
    color: Colors.text,
    marginRight: 8,
  },
  timeContainer: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 4,
  },
  conversationTime: {
    fontSize: 12,
    color: Colors.textTertiary,
  },
  jobTitle: {
    fontSize: 13,
    color: Colors.primary,
    marginBottom: 4,
  },
  lastMessage: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  lastMessageUnread: {
    fontWeight: "600" as const,
    color: Colors.text,
  },
  emptyState: {
    alignItems: "center" as const,
    justifyContent: "center" as const,
    paddingVertical: 64,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: "600" as const,
    color: Colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  chatContainer: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  chatHeader: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    alignItems: "center" as const,
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  chatTitle: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: Colors.text,
  },
  messagesScroll: {
    flex: 1,
  },
  messagesContent: {
    padding: 16,
  },
  messageContainer: {
    marginBottom: 12,
  },
  messageContainerSent: {
    alignItems: "flex-end" as const,
  },
  messageContainerReceived: {
    alignItems: "flex-start" as const,
  },
  messageBubble: {
    maxWidth: "75%",
    borderRadius: 16,
    padding: 12,
  },
  messageBubbleSent: {
    backgroundColor: Colors.primary,
    borderBottomRightRadius: 4,
  },
  messageBubbleReceived: {
    backgroundColor: Colors.surface,
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 15,
    color: Colors.text,
    marginBottom: 4,
  },
  messageTextSent: {
    color: Colors.white,
  },
  messageTime: {
    fontSize: 11,
    color: Colors.textTertiary,
  },
  inputContainer: {
    flexDirection: "row" as const,
    padding: 16,
    paddingBottom: Platform.OS === "ios" ? 16 : 16,
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    gap: 12,
  },
  messageInput: {
    flex: 1,
    backgroundColor: Colors.background,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 15,
    color: Colors.text,
    maxHeight: 100,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.primary,
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
});
