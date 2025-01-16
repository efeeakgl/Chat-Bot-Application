import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  TextInput,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";

export default function GroupPage() {
  const [userId, setUserId] = useState<string | null>(null);
  const [friends, setFriends] = useState<{ id: string; name: string }[]>([]);
  const [selectedFriends, setSelectedFriends] = useState<string[]>([]);
  const [groupName, setGroupName] = useState<string>("");  // State for group name
  const router = useRouter();

  // Fetch user ID from AsyncStorage
  const fetchUserId = async () => {
    const storedId = await AsyncStorage.getItem("userId");
    setUserId(storedId);
  };

  // Fetch friends from API
  const fetchFriends = async () => {
    if (!userId) return;

    try {
      const response = await fetch(
        `http://10.0.2.2:8080/friends/friendsWithNames?userId=${userId}`
      );
      const result = await response.json();
      if (response.ok) {
        // For each friend, get the user ID by their name
        const friendsWithIds = await Promise.all(
          result.map(async (friend: string) => {
            const idResponse = await fetch(
              `http://10.0.2.2:8080/users/name/${friend}/id`
            );
            const id = await idResponse.text(); // Get the ID for the friend
            return { name: friend, id };
          })
        );
        setFriends(friendsWithIds);
      } else {
        Alert.alert("Error", "Failed to fetch friends.");
      }
    } catch (error) {
      console.error("Error fetching friends:", error);
      Alert.alert("Error", "An error occurred while fetching friends.");
    }
  };

  // Handle friend selection toggle
  const toggleFriendSelection = (friendId: string) => {
    setSelectedFriends((prev) =>
      prev.includes(friendId)
        ? prev.filter((id) => id !== friendId)
        : [...prev, friendId]
    );
  };

  // Handle group creation
  const handleCreateGroup = async () => {
    if (selectedFriends.length === 0) {
      Alert.alert("Error", "Please select at least one friend to create a group.");
      return;
    }

    if (!groupName) {
      Alert.alert("Error", "Please enter a name for the group.");
      return;
    }

    if (!userId) {
      Alert.alert("Error", "User ID is missing.");
      return;
    }

    try {
      // Add the logged-in user (userId) to the members array
      const membersWithUser = [...selectedFriends, userId]; // Ensure user is always added

      const response = await fetch(`http://10.0.2.2:8080/groups/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: groupName, // Include the group name
          members: membersWithUser, // Include logged-in user and selected friends' original IDs
        }),
      });

      if (response.ok) {
        Alert.alert("Success", "Group created successfully!");
        setSelectedFriends([]);
        setGroupName(""); // Reset group name after creation
      } else {
        Alert.alert("Error", "Failed to create group.");
      }
    } catch (error) {
      console.error("Error creating group:", error);
      Alert.alert("Error", "An error occurred while creating the group.");
    }
  };

  useEffect(() => {
    fetchUserId();
  }, []);

  useEffect(() => {
    fetchFriends();
  }, [userId]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create a New Group</Text>

      {/* Input field for Group Name */}
      <TextInput
        style={styles.input}
        placeholder="Enter group name"
        value={groupName}
        onChangeText={setGroupName} // Update state as the user types
      />

      <ScrollView style={styles.friendList}>
        {friends.length === 0 ? (
          <Text style={styles.noFriendsText}>No friends available</Text>
        ) : (
          friends.map((friend) => (
            <TouchableOpacity
              key={friend.id}
              style={[
                styles.friendItem,
                selectedFriends.includes(friend.id) && styles.selectedFriendItem,
              ]}
              onPress={() => toggleFriendSelection(friend.id)}
            >
              <Text
                style={[
                  styles.friendName,
                  selectedFriends.includes(friend.id) && styles.selectedFriendName,
                ]}
              >
                {friend.name}
              </Text>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>

      <TouchableOpacity style={styles.createGroupButton} onPress={handleCreateGroup}>
        <Text style={styles.createGroupButtonText}>Create Group</Text>
      </TouchableOpacity>

      {/* Button to navigate to Group Info page */}
      <TouchableOpacity
        style={styles.showGroupsButton}
        onPress={() => router.push("/groupinfo")}
      >
        <Text style={styles.showGroupsButtonText}>Show the created groups</Text>
      </TouchableOpacity>

      <Text 
        style={styles.backButtonText} 
        onPress={() => router.back()}
        >
        Back to Home
      </Text>
      
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#f9f9f9",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 16,
    textAlign: "center",
  },
  input: {
    height: 40,
    borderColor: "#ddd",
    borderWidth: 1,
    borderRadius: 8,
    paddingLeft: 8,
    marginBottom: 16,
  },
  friendList: {
    flex: 1,
    marginBottom: 16,
  },
  noFriendsText: {
    textAlign: "center",
    fontSize: 18,
    color: "#888",
  },
  friendItem: {
    padding: 10,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: "#fff",
  },
  selectedFriendItem: {
    backgroundColor: "#d3f9d8",
    borderColor: "#64d35f",
  },
  friendName: {
    fontSize: 16,
    color: "#333",
  },
  selectedFriendName: {
    color: "#2a9d46",
    fontWeight: "bold",
  },
  createGroupButton: {
    backgroundColor: "#4CAF50",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  createGroupButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  showGroupsButton: {
    backgroundColor: "#6d6e6d",
    padding: 12,
    borderRadius: 8,
    marginTop: 16,
    alignItems: "center",
  },
  showGroupsButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  backButton: {
    marginTop: 16,
    backgroundColor: "#bbb",
    padding: 10,
    borderRadius: 8,
    alignItems: "center",
  },
  backButtonText: {
    marginTop: 15,
    color: "#333",
    fontSize: 16,
    textAlign: "center",
  },
});
