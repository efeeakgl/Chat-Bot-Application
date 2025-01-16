package com.example.demo.model;

import org.springframework.data.annotation.Id;

public class Message {

    @Id
    private String id;          // Unique identifier for the message
    private String senderId;    // ID of the user who sent the message
    private String receiverId;  // ID of the user receiving the message
    private String content;     // Content of the message
    private String timestamp;   // Timestamp of when the message was sent

    // Constructor with 4 parameters
    public Message(String senderId, String receiverId, String content, String timestamp) {
        this.senderId = senderId;
        this.receiverId = receiverId;
        this.content = content;
        this.timestamp = timestamp;
    }

    // Getters and Setters
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getSenderId() {
        return senderId;
    }

    public void setSenderId(String senderId) {
        this.senderId = senderId;
    }

    public String getReceiverId() {
        return receiverId;
    }

    public void setReceiverId(String receiverId) {
        this.receiverId = receiverId;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public String getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(String timestamp) {
        this.timestamp = timestamp;
    }
}
