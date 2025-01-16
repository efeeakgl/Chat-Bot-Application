package com.example.demo.Controller;

import com.example.demo.Services.FriendRequestService;
import com.example.demo.model.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/friends")
public class FriendRequestController {

    @Autowired
    private FriendRequestService friendRequestService;

    // Endpoint to send a friend request using request body
    @PostMapping("/add")
    public String sendFriendRequest(@RequestBody Map<String, String> requestBody) {
        String senderId = requestBody.get("senderId");
        String receiverId = requestBody.get("receiverId");
        return friendRequestService.sendFriendRequest(senderId, receiverId);
    }

    // Endpoint to accept a friend request
    @PostMapping("/accept")
    public String acceptFriendRequest(@RequestBody Map<String, String> requestBody) {
        String senderId = requestBody.get("senderId");
        String receiverId = requestBody.get("receiverId");
        return friendRequestService.acceptFriendRequest(senderId, receiverId);
    }

    // Endpoint to retrieve the friend list of a user
    @GetMapping
    public ResponseEntity<?> getFriendList(@RequestParam String userId) {
        List<User> friends = friendRequestService.getFriendList(userId);
        if (friends.isEmpty()) {
            return ResponseEntity.status(404).body("No friends found");
        }
        return ResponseEntity.ok(friends);  // Arkadaşlar User nesnesi olarak dönecek
    }

    @GetMapping("/pending")
    public ResponseEntity<?> getPendingFriendRequests(@RequestParam String userId) {
        // Check if the user exists
        boolean userExists = friendRequestService.doesUserExist(userId);
        if (!userExists) {
            return ResponseEntity.status(404).body("User not found");
        }

        // Get the list of pending friend requests for the user
        List<String> pendingRequests = friendRequestService.getPendingFriendRequests(userId);
        return ResponseEntity.ok(pendingRequests);
    }

    @GetMapping("/friendsWithNames")
    public ResponseEntity<?> getFriendListWithNames(@RequestParam String userId) {
        List<String> friendNames = friendRequestService.getFriendListWithNames(userId);

        // Eğer arkadaş listesi boşsa, boş bir dizi dönelim
        if (friendNames.isEmpty()) {
            return ResponseEntity.ok(friendNames);  // Boş arkadaş listesi döndür
        }

        return ResponseEntity.ok(friendNames);  // Arkadaş isimleri döndür
    }
    @GetMapping("/friendsWithIds")
    public ResponseEntity<?> getFriendListWithIds(@RequestParam String userId) {
        List<String> friendIds = friendRequestService.getFriendListWithIds(userId);

        // Eğer arkadaş listesi boşsa, boş bir dizi dönelim
        if (friendIds.isEmpty()) {
            return ResponseEntity.ok(friendIds); // Boş arkadaş listesi döndür
        }

        return ResponseEntity.ok(friendIds); // Arkadaş ID'lerini döndür
    }
}
