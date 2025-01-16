package com.example.demo.Services;

import com.example.demo.Repository.GroupRepository;
import com.example.demo.model.Group;
import com.example.demo.model.Message;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;
import com.example.demo.Repository.UserRepository;

@Service
public class GroupService {

    @Autowired
    private GroupRepository groupRepository;
    @Autowired
    private UserService userService;

    // Creates a new group with initial members
    public Group createGroup(Group group) {
        if (group.getName() == null || group.getName().isEmpty()) {
            throw new RuntimeException("Group name cannot be empty");
        }

        if (group.getMembers() == null || group.getMembers().isEmpty()) {
            throw new RuntimeException("A group must have at least one member");
        }

        group.setCreatedAt(LocalDateTime.now());  // Set the creation time when the group is created
        return groupRepository.save(group);
    }

    // Adds a new member to an existing group
    public Group addMember(String groupId, String memberId) {
        Group group = groupRepository.findById(groupId)
                .orElseThrow(() -> new RuntimeException("Group not found"));

        if (!group.getMembers().contains(memberId)) {
            group.getMembers().add(memberId);
        } else {
            throw new RuntimeException("Member already exists in the group");
        }

        return groupRepository.save(group);
    }

    // Sends a message to all members of the group
    public Message sendMessage(String groupId, Message message) {
        Group group = groupRepository.findById(groupId)
                .orElseThrow(() -> new RuntimeException("Group not found"));

        group.getMessages().add(message);
        groupRepository.save(group);

        return message;
    }

    // Retrieves the message history for the group
    public List<Message> getMessageHistory(String groupId) {
        Group group = groupRepository.findById(groupId)
                .orElseThrow(() -> new RuntimeException("Group not found"));

        return group.getMessages();
    }

    // Retrieves the list of members for the group
    public List<String> getMembers(String groupId) {
        Group group = groupRepository.findById(groupId)
                .orElseThrow(() -> new RuntimeException("Group not found"));

        return group.getMembers();
    }

    // Retrieves all groups that the user is a part of
    public List<Group> getUserGroups(String userId) {
        List<Group> allGroups = groupRepository.findAll();  // Fetch all groups
        return allGroups.stream()
                .filter(group -> group.getMembers().contains(userId))  // Filter groups where the user is a member
                .collect(Collectors.toList());
    }

}