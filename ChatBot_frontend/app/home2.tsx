import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  TextInput,
  Button,
  Alert,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";

export default function HomePage() {
  const [userName, setUserName] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [friends, setFriends] = useState<{ id: string; name: string }[]>([]); // Friends with id and name
  const [groups, setGroups] = useState<{ id: string; name: string }[]>([]); // Groups state
  const [activeChat, setActiveChat] = useState<{ id: string; type: "friend" | "group" } | null>(null);
  const [activeChatName, setActiveChatName] = useState<string | null>(null);
  const [message, setMessage] = useState<string>("");
  const [chatHistory, setChatHistory] = useState<{
    [key: string]: { text: string; sender: "me" | "friend" }[];
  }>({});
  const router = useRouter();

  const fetchUserData = async () => {
    const storedName = await AsyncStorage.getItem("userName");
    const storedId = await AsyncStorage.getItem("userId");
    setUserName(storedName);
    setUserId(storedId);
  };

  const fetchFriends = async () => {
    if (!userId) return;

    try {
      const response = await fetch(
        `http://10.0.2.2:8080/friends/friendsWithNames?userId=${userId}`
      );
      const result = await response.json();

      if (response.ok) {
        const formattedFriends = await Promise.all(
          result.map(async (name: string) => {
            const idResponse = await fetch(
              `http://10.0.2.2:8080/users/name/${name}/id`
            );
            const id = await idResponse.text();
            return { id, name };
          })
        );
        setFriends(formattedFriends);
      } else {
        Alert.alert("Error", "Failed to fetch friends.");
      }
    } catch (error) {
      console.error("Error fetching friends:", error);
      Alert.alert("Error", "An error occurred while fetching friends.");
    }
  };

  const fetchGroups = async () => {
    if (!userId) return;

    try {
      const response = await fetch(`http://10.0.2.2:8080/groups/user/${userId}`);
      const result = await response.json();

      if (response.ok) {
        setGroups(result);
      } else {
        Alert.alert("Error", "Failed to fetch groups.");
      }
    } catch (error) {
      console.error("Error fetching groups:", error);
      Alert.alert("Error", "An error occurred while fetching groups.");
    }
  };

  const fetchChatHistory = async (chatId: string, type: "friend" | "group") => {
    const endpoint =
      type === "friend"
        ? `http://10.0.2.2:8080/messages/conversation?senderId=${userId}&receiverId=${chatId}`
        : `http://10.0.2.2:8080/groups/messages`;

    try {
      const response = await fetch(endpoint, {
        method: type === "group" ? "POST" : "GET",
        headers: {
          "Content-Type": "application/json",
        },
        body: type === "group" ? JSON.stringify({ groupId: chatId }) : undefined,
      });

      const result = await response.json();

      if (response.ok) {
        const formattedMessages = result.map((msg: any) => ({
          text: msg.content,
          sender: msg.senderId === userId ? "me" : "friend",
          senderName: msg.senderName || "Unknown",
          timestamp: new Date(msg.timestamp).toISOString(),
        }));

        setChatHistory((prev) => ({
          ...prev,
          [chatId]: formattedMessages,
        }));
      } else {
        Alert.alert("Error", "Failed to fetch chat history.");
      }
    } catch (error) {
      console.error("Error fetching chat history:", error);
      Alert.alert("Error", "An error occurred while fetching chat history.");
    }
  };

  const handleSelectChat = async (id: string, name: string, type: "friend" | "group") => {
    setActiveChat({ id, type });
    setActiveChatName(name);

    try {
      await fetchChatHistory(id, type);
    } catch (error) {
      console.error("Error fetching chat history:", error);
      Alert.alert("Error", "Failed to load chat history.");
    }
  };

  const handleSendMessage = async () => {
    if (!activeChat || !userId || !message.trim()) {
      Alert.alert("Error", "Cannot send an empty message or no chat is selected.");
      return;
    }

    const endpoint =
      activeChat.type === "friend"
        ? "http://10.0.2.2:8080/messages/send"
        : "http://10.0.2.2:8080/groups/send-message";

    const body =
      activeChat.type === "friend"
        ? {
            senderId: userId,
            receiverId: activeChat.id, // Using id for friends
            content: message,
            timestamp: new Date().toISOString(),
          }
        : {
            groupId: activeChat.id,
            senderId: userId,
            content: message,
            timestamp: new Date().toISOString(),
          };

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      if (response.ok) {
        setChatHistory((prev) => ({
          ...prev,
          [activeChat.id]: [
            ...(prev[activeChat.id] || []),
            { text: message, sender: "me" },
          ],
        }));
        setMessage("");
      } else {
        Alert.alert("Error", "Failed to send message.");
      }
    } catch (error) {
      console.error("Error sending message:", error);
      Alert.alert("Error", "An error occurred while sending the message.");
    }
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  useEffect(() => {
    if (userId) {
      fetchFriends();
      fetchGroups();
    }
  }, [userId]);

  const handleRefresh = async () => {
    await fetchUserData();
    await fetchFriends();
    await fetchGroups();
  };

  return (
    <View style={styles.container}>
      <View style={styles.navBar}>
        <TouchableOpacity onPress={handleRefresh}>
          <Text style={styles.navTitle}>Howudoin</Text>
        </TouchableOpacity>
        <View style={styles.navButtons}>
          <TouchableOpacity
            style={styles.groupButton}
            onPress={() => router.push("/group")}
          >
            <Text style={styles.groupButtonText}>Groups</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.addButton} onPress={() => router.push("/add-friend")}>
            <Text style={styles.addButtonText}>+</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.welcomeContainer}>
        <Text style={styles.welcomeText}>Welcome, {userName}</Text>
      </View>

      <View style={styles.mainContent}>
        <View style={styles.friendList}>
          <Text style={styles.friendListTitle}>Your Friends</Text>
          <ScrollView style={styles.friendListContainer}>
            {friends.length === 0 ? (
              <Text style={styles.noFriendsText}>No friends available</Text>
            ) : (
              friends.map((friend) => (
                <TouchableOpacity
                  key={friend.id}
                  style={styles.friendItem}
                  onPress={() => handleSelectChat(friend.id, friend.name, "friend")}
                >
                  <Text style={styles.friendName}>{friend.name}</Text>
                </TouchableOpacity>
              ))
            )}
          </ScrollView>

          <Text style={styles.friendListTitle}>Your Groups</Text>
          <ScrollView style={styles.groupListContainer}>
            {groups.length === 0 ? (
              <Text style={styles.noGroupsText}>No groups available</Text>
            ) : (
              groups.map((group) => (
                <TouchableOpacity
                  key={group.id}
                  style={styles.groupItem}
                  onPress={() => handleSelectChat(group.id, group.name, "group")}
                >
                  <Text style={styles.groupName}>{group.name}</Text>
                </TouchableOpacity>
              ))
            )}
          </ScrollView>
        </View>

        {activeChat && (
          <View style={styles.chatWindow}>
            <View style={styles.chatHeader}>
              <Text style={styles.chatHeaderText}>{activeChatName}</Text>
            </View>

            <ScrollView style={styles.chatContainer}>
              {(chatHistory[activeChat.id] || []).map((msg, index) => (
                
                <View
                  key={index}
                  style={[
                    styles.chatMessageContainer,
                    msg.sender === "me"
                      ? styles.sentMessage
                      : styles.receivedMessage,
                  ]}
                >
                  
                  <Text
                    style={[
                      styles.chatMessage,
                      msg.sender === "me"
                        ? styles.sentMessageText
                        : styles.receivedMessageText,
                    ]}
                  >
                    {msg.text}
                  </Text>
                </View>
              ))}
            </ScrollView>

            <View style={styles.chatInputContainer}>
              <TextInput
                style={styles.chatInput}
                placeholder="Type a message..."
                value={message}
                onChangeText={setMessage}
              />
              <Button title="Send" onPress={handleSendMessage} color="#6d6e6d" />
            </View>
          </View>
        )}
      </View>
    </View>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9f9f9",
  },
  navBar: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 60,
    backgroundColor: "#36454F",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    zIndex: 10,
  },
  navTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
  },
  addButton: {
    backgroundColor: "#36454F",
    borderRadius: 50,
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  addButtonText: {
    color: "#fff",
    fontSize: 24,
  },
  welcomeContainer: {
    marginTop: 80,
    paddingHorizontal: 16,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
  },
  mainContent: {
    marginTop: 20,
    flexDirection: "row",
    flex: 1,
    color: "#808080",
  },
  friendList: {
    width: "26%",
    padding: 12,
    backgroundColor: "#dcd8d8",
    borderRightWidth:0.9,
    borderColor: "#828080",
    height: "100%",
  },
  friendListTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 10,
  },
  friendListContainer: {
    flex: 1,
  },
  noFriendsText: {
    fontSize: 16,
    color: "#999",
    textAlign: "center",
  },
  friendItem: {
    paddingVertical: 10,
    borderBottomWidth: 1, // Alt çizgi kalınlığı
    borderBottomColor: "#828080", // Çizgi rengi
  },
  friendName: {
    fontSize: 16,
    color: "#333",
  },
  chatWindow: {
    flex: 1,
    width: "70%",
    padding: 16,
    backgroundColor: "#fff",
  },
  chatHeader: {
    marginBottom: 10,
    borderBottomWidth: 1,
    borderColor: "#828080",
    paddingBottom: 8,
  },
  chatHeaderText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  chatContainer: {
    flex: 1,
    marginBottom: 16,
  },
  chatMessageContainer: {
    marginBottom: 10,
    maxWidth: "80%",
    padding: 10,
    borderRadius: 10,
  },
  sentMessage: {
    alignSelf: "flex-end",
    backgroundColor: "#d78472",
  },
  receivedMessage: {
    alignSelf: "flex-start",
    backgroundColor: "#c0c0c0",
  },
  chatMessage: {
    fontSize: 16,
  },
  sentMessageText: {
    color: "#fff",
  },
  receivedMessageText: {
    color: "#333",
  },
  chatInputContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  chatInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ddd",
    padding: 8,
    marginRight: 8,
    borderRadius: 4,
  },
  navButtons: {
    flexDirection: "row",
    alignItems: "center",
  },
  groupButton: {
    backgroundColor: "#6c757d",
    borderRadius: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
  },
  groupButtonText: {
    color: "#fff",
    fontSize: 16,
  },
 
    groupListContainer: {
      flex: 1,
      marginTop: 16,
      paddingHorizontal: 2,
    },
    
    noGroupsText: {
      fontSize: 16,
      color: "#999",
      textAlign: "center",
      marginTop: 16,
    },
    groupItem: {
      paddingVertical: 10,
      borderBottomWidth: 1, // Alt çizgi kalınlığı
      borderBottomColor: "#828080", // Çizgi rengi
      borderRadius: 8,
      marginBottom: 8,
      backgroundColor: "#fff",
      
    },
    groupName: {
      fontSize: 16,
      color: "#333",
    },
    senderName: {
      fontSize: 14,
      fontWeight: "bold",
      color: "#555",
      marginBottom: 4,
    },
  });
  
  
  

