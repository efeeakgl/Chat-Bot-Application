package com.example.demo.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Data
@Document(collection = "groups")
public class Group {
    @Id
    private String id;
    private String name;
    private List<String> members = new ArrayList<>();
    private List<Message> messages = new ArrayList<>();
    private LocalDateTime createdAt;  // Add createdAt field

    // Constructor with createdAt
    public Group() {
        this.createdAt = LocalDateTime.now();  // Automatically set the creation time
    }
}