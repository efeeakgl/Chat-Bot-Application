import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert } from "react-native";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';

export default function AddFriendPage() {
  const [users, setUsers] = useState<any[]>([]); // Backend'den gelen kullanıcı listesi
  const [currentUserId, setCurrentUserId] = useState<string | null>(null); // Mevcut kullanıcı ID'si
  const [pendingRequests, setPendingRequests] = useState<{ [key: string]: boolean }>({});
  const [pendingRequestsList, setPendingRequestsList] = useState<any[]>([]); // Bekleyen isteklerin listesi
  const router = useRouter();

  useEffect(() => {
    const fetchUserData = async () => {
      const storedUserId = await AsyncStorage.getItem("userId");
      setCurrentUserId(storedUserId);
    };
    fetchUserData();
  }, []);

  useEffect(() => {
    if (currentUserId) {
      fetchUsers(currentUserId);
      fetchPendingRequests(currentUserId);
    }
  }, [currentUserId]);

  const fetchUsers = async (currentUserId: string) => {
    try {
      const response = await fetch(`http://10.0.2.2:8080/users/all`);
      const result = await response.json();
      const filteredUsers = result.filter((user: any) => {
        return user.id !== currentUserId && !user.friends.includes(currentUserId);
      });
      setUsers(filteredUsers);
    } catch (error) {
      console.error("Error fetching users:", error);
      Alert.alert("Error", "An error occurred while fetching users.");
    }
  };

  const fetchPendingRequests = async (currentUserId: string) => {
    try {
      const response = await fetch(`http://10.0.2.2:8080/friends/pending?userId=${currentUserId}`);
      const pendingIds = await response.json();
  
      const requestsWithNames = await Promise.all(
        pendingIds.map(async (senderId: string) => {
          const nameResponse = await fetch(`http://10.0.2.2:8080/users/${senderId}/name`);
          const name = await nameResponse.text();
          return { id: senderId, name };
        })
      );
  
      setPendingRequestsList(requestsWithNames);
    } catch (error) {
      console.error("Error fetching pending requests:", error);
      Alert.alert("Error", "An error occurred while fetching pending requests.");
    }
  };

  const handleAddFriend = async (friendId: string) => {
    if (!currentUserId) {
      Alert.alert("Error", "You need to be logged in to add friends.");
      return;
    }

    setPendingRequests((prevState) => ({
      ...prevState,
      [friendId]: true,
    }));

    try {
      const response = await fetch("http://10.0.2.2:8080/friends/add", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          senderId: currentUserId,
          receiverId: friendId,
        }),
      });

      const data = await response.text();

      if (response.ok) {
        Alert.alert("Success", "Friend request sent!");
      } else {
        setPendingRequests((prevState) => ({
          ...prevState,
          [friendId]: false,
        }));
        Alert.alert("Error", data || "Failed to send friend request.");
      }
    } catch (error) {
      console.error("Error adding friend:", error);
      setPendingRequests((prevState) => ({
        ...prevState,
        [friendId]: false,
      }));
      Alert.alert("Error", "Something went wrong. Please try again.");
    }
  };

  const handleAcceptRequest = async (senderId: string) => {
    if (!currentUserId) {
      Alert.alert("Error", "You need to be logged in to accept requests.");
      return;
    }

    try {
      const response = await fetch("http://10.0.2.2:8080/friends/accept", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          senderId: senderId,
          receiverId: currentUserId,
        }),
      });

      const data = await response.text();

      if (response.ok) {
        Alert.alert("Success", "Friend request accepted!");
        setPendingRequestsList((prev) => prev.filter((id) => id !== senderId));
      } else {
        Alert.alert("Error", data || "Failed to accept friend request.");
      }
    } catch (error) {
      console.error("Error accepting friend request:", error);
      Alert.alert("Error", "Something went wrong. Please try again.");
    }
  };

  const handleRejectRequest = (senderId: string) => {
    setPendingRequestsList((prev) => prev.filter((id) => id !== senderId));
  };

  const handleBackToHomePage = () => {
    router.back();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Howudoin</Text>

      <Text style={styles.sectionTitle}>Add Friend</Text>
      <ScrollView style={styles.userList}>
        {users.length === 0 ? (
          <Text style={styles.noUsersText}>No users available to add as a friend.</Text>
        ) : (
          users.map((user) => (
            <View key={user.id} style={styles.userItem}>
              <Text style={styles.userName}>{user.name}</Text>
              <TouchableOpacity
                style={styles.addButton}
                onPress={() => handleAddFriend(user.id)}
                disabled={pendingRequests[user.id]}
              >
                <Text style={styles.addButtonText}>
                  {pendingRequests[user.id] ? "Pending" : "Add"}
                </Text>
              </TouchableOpacity>
            </View>
          ))
        )}
      </ScrollView>

      <Text style={styles.sectionTitle}>Pending Friend Requests</Text>
      <ScrollView style={styles.userList}>
        {pendingRequestsList.length === 0 ? (
          <Text style={styles.noUsersText}>No pending requests.</Text>
        ) : (
          pendingRequestsList.map((request) => (
            <View key={request.id} style={styles.userItem}>
              <Text style={styles.userName}>Request from {request.name}</Text>
              <TouchableOpacity
                style={styles.acceptButton}
                onPress={() => handleAcceptRequest(request.id)}
              >
                <Text style={styles.addButtonText}>Accept</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.rejectButton}
                onPress={() => handleRejectRequest(request.id)}
              >
                <Text style={styles.addButtonText}>Reject</Text>
              </TouchableOpacity>
            </View>
          ))
        )}
      </ScrollView>

      <TouchableOpacity style={styles.backButton} onPress={handleBackToHomePage}>
        <Text style={styles.backButtonText}>Back to Home Page</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9f9f9",
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
  },
  userList: {
    flex: 1,
  },
  userItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderColor: "#ddd",
  },
  userName: {
    fontSize: 18,
  },
  addButton: {
    backgroundColor: "#6d6e6d",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 4,
  },
  addButtonText: {
    color: "#fff",
    fontSize: 16,
  },
  acceptButton: {
    backgroundColor: "#4CAF50",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 4,
    marginRight: 0,
  },
  rejectButton: {
    backgroundColor: "#f44336",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 4,
  },
  noUsersText: {
    textAlign: "center",
    fontSize: 18,
    color: "#888",
  },
  backButton: {
    marginTop: 20,
    paddingVertical: 10,
    backgroundColor: "#f9f9f9",
    borderRadius: 4,
  },
  backButtonText: {
    color: "#333",
    fontSize: 16,
    textAlign: "center",
  },
});
