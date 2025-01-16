import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  TouchableOpacity,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";

export default function GroupInfo() {
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  const [groups, setGroups] = useState<any[]>([]);
  const [friends, setFriends] = useState<{ id: string; name: string }[]>([]);
  const [selectedFriend, setSelectedFriend] = useState<string | null>(null);
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);

  const fetchUserId = async () => {
    const storedId = await AsyncStorage.getItem("userId");
    setUserId(storedId);
  };

  const fetchUserGroups = async () => {
    if (!userId) return;

    try {
      const response = await fetch(`http://10.0.2.2:8080/groups/user/${userId}`);
      const result = await response.json();

      if (response.ok) {
        const updatedGroups = await Promise.all(
          result.map(async (group: { members: string[]; name: string; id: string; createdAt: string }) => {
            const memberNames = await Promise.all(
              group.members.map(async (memberId) => {
                try {
                  const nameResponse = await fetch(`http://10.0.2.2:8080/users/${memberId}/name`);
                  if (nameResponse.ok) {
                    return await nameResponse.text();
                  } else {
                    return `Unknown (${memberId})`;
                  }
                } catch {
                  return `Unknown (${memberId})`;
                }
              })
            );

            return { ...group, members: memberNames };
          })
        );

        setGroups(updatedGroups);
      } else {
        Alert.alert("Error", "Failed to fetch groups.");
      }
    } catch (error) {
      console.error("Error fetching groups:", error);
      Alert.alert("Error", "An error occurred while fetching groups.");
    }
  };

  const fetchFriends = async () => {
    if (!userId) return;

    try {
      const response = await fetch(`http://10.0.2.2:8080/friends/friendsWithNames?userId=${userId}`);
      const result = await response.json();

      if (response.ok) {
        const friendsWithIds = await Promise.all(
          result.map(async (friend: string) => {
            const idResponse = await fetch(`http://10.0.2.2:8080/users/name/${friend}/id`);
            const id = await idResponse.text();
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

  const handleAddMember = async () => {
    if (!selectedFriend || !selectedGroupId) {
      Alert.alert("Error", "Please select a friend and a group.");
      return;
    }

    try {
      const response = await fetch(`http://10.0.2.2:8080/groups/add-member`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          groupId: selectedGroupId,
          memberId: selectedFriend,
        }),
      });

      if (response.ok) {
        Alert.alert("Success", "Member added successfully!");
        fetchUserGroups();
      } else {
        Alert.alert("Error", "Failed to add member.");
      }
    } catch (error) {
      console.error("Error adding member:", error);
      Alert.alert("Error", "An error occurred while adding member.");
    }
  };

  useEffect(() => {
    fetchUserId();
  }, []);

  useEffect(() => {
    if (userId) {
      fetchUserGroups();
      fetchFriends();
    }
  }, [userId]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Your Groups</Text>
      <ScrollView style={styles.groupsList}>
        {groups.length === 0 ? (
          <Text style={styles.noGroupsText}>No groups available</Text>
        ) : (
          groups.map((group) => (
            <View key={group.id} style={styles.groupItem}>
              <TouchableOpacity
              
            onPress={() =>
              router.push(`/GroupChat?groupId=${group.id}&groupName=${group.name}`)
              

            }
          >
            <Text style={styles.groupName}>{group.name}</Text>
          </TouchableOpacity>
              
              <Text style={styles.groupMembers}>Members: {group.members.join(", ")}</Text>
              <Text style={styles.groupCreatedAt}>Created At: {new Date(group.createdAt).toLocaleString()}</Text>

              <TouchableOpacity
                style={styles.addMemberButton}
                onPress={() => setSelectedGroupId(group.id)}
              >
                <Text style={styles.addMemberButtonText}>Add Member</Text>
              </TouchableOpacity>

              {selectedGroupId === group.id && (
                <View style={styles.addMemberForm}>
                  <Text>Select a Friend to Add:</Text>
                  <ScrollView style={styles.friendList}>
                    {friends
                      .filter(friend => !group.members.includes(friend.name))
                      .map(friend => (
                        <TouchableOpacity
                          key={friend.id}
                          style={[styles.friendItem, selectedFriend === friend.id && styles.selectedFriend]}
                          onPress={() => setSelectedFriend(friend.id)}
                        >
                          <Text style={styles.friendName}>{friend.name}</Text>
                        </TouchableOpacity>
                      ))}
                  </ScrollView>
                  <TouchableOpacity style={styles.addMemberButton} onPress={handleAddMember}>
                    <Text style={styles.addMemberButtonText}>Add to Group</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          ))
        )}
      </ScrollView>
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
  groupsList: {
    flex: 1,
  },
  groupItem: {
    padding: 12,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: "#fff",
  },
  groupName: {
    fontSize: 18,
    fontWeight: "bold",
  },
  groupMembers: {
    fontSize: 16,
    color: "#555",
  },
  groupCreatedAt: {
    fontSize: 14,
    color: "#888",
    marginTop: 4,
  },
  addMemberButton: {
    backgroundColor: "#6d6e6d",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginTop: 8,
    alignItems: "center",
    width: 120,
    alignSelf: "center",
  },
  addMemberButtonText: {
    color: "#fff",
    fontSize: 16,
  },
  addMemberForm: {
    marginTop: 10,
    padding: 10,
    borderRadius: 8,
    backgroundColor: "#f0f0f0",
  },
  friendList: {
    maxHeight: 100,
  },
  friendItem: {
    padding: 10,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: "#fff",
  },
  friendName: {
    fontSize: 16,
    color: "#333",
  },
  noGroupsText: {
    textAlign: "center",
    fontSize: 18,
    color: "#888",
  },
  selectedFriend: {
    backgroundColor: "#4CAF50",
    borderColor: "#388E3C",
  },
});
