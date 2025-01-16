package com.example.demo.Repository;

import com.example.demo.model.Message;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

public interface MessageRepository extends MongoRepository<Message, String> {

    // Query to find messages by receiverId
    List<Message> findByReceiverId(String receiverId);

    // Find messages between two users (bidirectional query)
    List<Message> findBySenderIdAndReceiverIdOrReceiverIdAndSenderId(
            String senderId, String receiverId, String receiverId2, String senderId2);
}

