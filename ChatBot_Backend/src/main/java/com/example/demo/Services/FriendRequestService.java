package com.example.demo.Services;

import com.example.demo.Repository.UserRepository;
import com.example.demo.model.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class FriendRequestService {

    @Autowired
    private UserRepository userRepository;

    // Send a friend request
    public String sendFriendRequest(String senderId, String receiverId) {
        // Validate sender and receiver existence
        Optional<User> sender = userRepository.findById(senderId);
        Optional<User> receiver = userRepository.findById(receiverId);

        if (sender.isEmpty() || receiver.isEmpty()) {
            return "Sender or Receiver not found";
        }

        User receiverUser = receiver.get();

        // Check for duplicate friend requests
        if (receiverUser.getPendingFriendRequests().contains(senderId)) {
            return "Friend request already sent";
        }

        // Add friend request
        receiverUser.getPendingFriendRequests().add(senderId);
        userRepository.save(receiverUser);

        return "Friend request sent successfully";
    }

    // Accept a friend request
    public String acceptFriendRequest(String senderId, String receiverId) {
        // Validate sender and receiver existence
        Optional<User> sender = userRepository.findById(senderId);
        Optional<User> receiver = userRepository.findById(receiverId);

        if (sender.isEmpty() || receiver.isEmpty()) {
            return "Sender or Receiver not found";
        }

        User senderUser = sender.get();
        User receiverUser = receiver.get();

        // Check if the request exists
        if (!receiverUser.getPendingFriendRequests().contains(senderId)) {
            return "Friend request not found";
        }

        // Remove the friend request
        receiverUser.getPendingFriendRequests().remove(senderId);

        // Add each user to the other's friend list
        senderUser.getFriends().add(receiverId);
        receiverUser.getFriends().add(senderId);

        // Save the updated users
        userRepository.save(senderUser);
        userRepository.save(receiverUser);

        return "Friend request accepted";
    }

    // Get the friend list for a user
    public List<User> getFriendList(String userId) {
        Optional<User> user = userRepository.findById(userId);
        List<User> friendDetails = new ArrayList<>();

        if (user.isPresent()) {
            for (String friendId : user.get().getFriends()) {
                Optional<User> friend = userRepository.findById(friendId);
                friend.ifPresent(friendDetails::add);  // Arkadaşın bilgilerini listeye ekle
            }
        }
        return friendDetails;
    }

    public boolean doesUserExist(String userId) {
        // Implement the logic to check if the user exists in the database
        // This is just a placeholder; you need to query your data source to check for the user.
        return userRepository.existsById(userId); // Assuming userRepository is already set up
    }
    public List<String> getPendingFriendRequests(String userId) {
        Optional<User> user = userRepository.findById(userId);
        if (user.isPresent()) {
            return user.get().getPendingFriendRequests();
        }
        return new ArrayList<>();
    }
    public List<String> getFriendListWithNames(String userId) {
        Optional<User> user = userRepository.findById(userId);
        List<String> friendNames = new ArrayList<>();

        if (user.isPresent()) {
            for (String friendId : user.get().getFriends()) {
                Optional<User> friend = userRepository.findById(friendId);
                if (friend.isPresent()) {
                    friendNames.add(friend.get().getName());  // Arkadaşın adını ekle
                }
            }
        }
        return friendNames;
    }

    public List<String> getFriendListWithIds(String userId) {
        Optional<User> user = userRepository.findById(userId);
        List<String> friendIds = new ArrayList<>();

        if (user.isPresent()) {
            friendIds.addAll(user.get().getFriends()); // Arkadaş ID'lerini ekle
        }

        return friendIds;
    }

}
