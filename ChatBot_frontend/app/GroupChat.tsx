import React, { useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";

export default function GroupChat() {
  const { groupId, groupName } = useLocalSearchParams(); // Dynamic parameters
  const [messages, setMessages] = useState<
    { senderId: string; content: string; timestamp: string }[]
  >([]);
  const [newMessage, setNewMessage] = useState("");
  const [userId, setUserId] = useState<string | null>(null);
  const [memberNames, setMemberNames] = useState<{ [key: string]: string }>({}); // Map of userId to usernames

  const fetchGroupMessages = async () => {
    try {
      const response = await fetch(`http://10.0.2.2:8080/groups/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ groupId }),
      });

      if (response.ok) {
        const data = await response.json();
        setMessages(data);
      } else {
        Alert.alert("Error", "Failed to fetch messages.");
      }
    } catch (error) {
      console.error("Error fetching group messages:", error);
    }
  };

  const fetchUserId = async () => {
    const storedId = await AsyncStorage.getItem("userId");
    setUserId(storedId);
  };

  const fetchMemberNames = async () => {
    try {
      const response = await fetch(`http://10.0.2.2:8080/groups/members`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ groupId }),
      });

      if (response.ok) {
        const memberIds = await response.json();

        // Fetch names for each memberId
        const names = await Promise.all(
          memberIds.map(async (id: string) => {
            const nameResponse = await fetch(
              `http://10.0.2.2:8080/users/${id}/name`
            );
            const name = await nameResponse.text();
            return { id, name };
          })
        );

        // Map userId to usernames
        const nameMap: { [key: string]: string } = {};
        names.forEach(({ id, name }) => {
          nameMap[id] = name;
        });

        setMemberNames(nameMap);
      } else {
        Alert.alert("Error", "Failed to fetch group members.");
      }
    } catch (error) {
      console.error("Error fetching member names:", error);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !userId) return;

    try {
      const response = await fetch(`http://10.0.2.2:8080/groups/send-message`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          groupId,
          senderId: userId,
          content: newMessage,
          //timestamp: new Date().toISOString(),
        }),
      });

      if (response.ok) {
        setMessages((prev) => [
          ...prev,
          { senderId: userId, content: newMessage, timestamp: new Date().toISOString() },
        ]);
        setNewMessage("");
      } else {
        Alert.alert("Error", "Failed to send message.");
      }
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  useEffect(() => {
    fetchUserId();
    fetchGroupMessages();
    fetchMemberNames();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.header}>{groupName}</Text>
      <ScrollView style={styles.messageContainer}>
        {messages.map((msg, index) => (
          <View key={index} style={[styles.messageWrapper]}>
            {msg.senderId === userId ? (
              <Text style={[styles.senderName, styles.rightAlign]}>
                {memberNames[msg.senderId] || "You"}
              </Text>
            ) : (
              <Text style={[styles.senderName, styles.leftAlign]}>
                {memberNames[msg.senderId] || "Unknown"}
              </Text>
            )}
            <View
              style={[
                styles.messageBubble,
                msg.senderId === userId
                  ? styles.sentMessage
                  : styles.receivedMessage,
              ]}
            >
              <Text style={styles.messageText}>{msg.content}</Text>
              
            </View>
          </View>
        ))}
      </ScrollView>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Type a message..."
          value={newMessage}
          onChangeText={setNewMessage}
        />
        <TouchableOpacity style={styles.sendButton} onPress={handleSendMessage}>
          <Text style={styles.sendButtonText}>Send</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  header: { fontSize: 20, fontWeight: "bold", padding: 16, textAlign: "center", backgroundColor: "#eee" },
  messageContainer: { flex: 1, padding: 16 },
  messageWrapper: { marginBottom: 16 },
  senderName: { fontSize: 12, fontWeight: "bold", marginBottom: 3, color: "#555" },
  rightAlign: { alignSelf: "flex-end", textAlign: "right" },
  leftAlign: { alignSelf: "flex-start", textAlign: "left" },
  messageBubble: { padding: 10, borderRadius: 8, maxWidth: "80%" },
  sentMessage: { alignSelf: "flex-end", backgroundColor: "#d78472" },
  receivedMessage: { alignSelf: "flex-start", backgroundColor: "#808080" },
  messageText: { fontSize: 16,color: "#fff" },
  timestamp: { fontSize: 12, color: "#c0c0c0", marginTop: 4, alignSelf: "flex-end" },
  inputContainer: { flexDirection: "row", padding: 16, borderTopWidth: 1, borderColor: "#ccc" },
  input: { flex: 1, borderWidth: 1, borderColor: "#ccc", borderRadius: 8, padding: 8, marginRight: 8 },
  sendButton: { backgroundColor: "#6d6e6d", padding: 12, borderRadius: 8 },
  sendButtonText: { color: "#fff", fontWeight: "bold" },
});
