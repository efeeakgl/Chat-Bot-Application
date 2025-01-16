package com.example.demo.Controller;

import com.example.demo.model.Group;
import com.example.demo.model.Message;
import com.example.demo.Services.GroupService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/groups")
public class GroupController {

    @Autowired
    private GroupService groupService;

    // Creates a new group with initial members
    @PostMapping("/create")
    public Group createGroup(@RequestBody Group group) {
        return groupService.createGroup(group);
    }

    // Adds a new member to an existing group (accepts groupId and memberId in the body)
    @PostMapping("/add-member")
    public Group addMemberToGroup(@RequestBody Map<String, String> requestBody) {
        String groupId = requestBody.get("groupId");
        String memberId = requestBody.get("memberId");
        return groupService.addMember(groupId, memberId);
    }

    // Sends a message to all members of the specified group
    @PostMapping("/send-message")
    public Message sendMessageToGroup(@RequestBody Map<String, Object> requestBody) {
        String groupId = (String) requestBody.get("groupId");
        String senderId = (String) requestBody.get("senderId");
        String receiverId = (String) requestBody.get("receiverId");  // You need to include receiverId in the request
        String content = (String) requestBody.get("content");
        String timestamp = (String) requestBody.get("timestamp");

        // Create message object with the required parameters
        Message message = new Message(senderId, receiverId, content, timestamp);

        // Send the message to the group using the service
        return groupService.sendMessage(groupId, message);
    }

    // Retrieves the message history for the specified group
    @PostMapping("/messages")
    public List<Message> getMessageHistory(@RequestBody Map<String, String> requestBody) {
        String groupId = requestBody.get("groupId");
        return groupService.getMessageHistory(groupId);
    }

    // Retrieves the list of members for the specified group
    @PostMapping("/members")
    public List<String> getGroupMembers(@RequestBody Map<String, String> requestBody) {
        String groupId = requestBody.get("groupId");
        return groupService.getMembers(groupId);
    }
    @GetMapping("/user/{userId}")
    public List<Group> getUserGroups(@PathVariable String userId) {
        return groupService.getUserGroups(userId);
    }


}