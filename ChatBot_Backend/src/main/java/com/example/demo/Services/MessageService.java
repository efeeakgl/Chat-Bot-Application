package com.example.demo.Services;

import com.example.demo.model.Message;
import com.example.demo.Repository.MessageRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class MessageService {

    @Autowired
    private MessageRepository messageRepository;

    // Save a message to the database
    public Message sendMessage(Message message) {
        return messageRepository.save(message);
    }

    // Get messages by receiver ID
    public List<Message> getMessages(String receiverId) {
        return messageRepository.findByReceiverId(receiverId);
    }

    // Get all messages from the database
    public List<Message> getAllMessages() {
        return messageRepository.findAll();
    }

    public List<Message> getConversation(String senderId, String receiverId) {
        return messageRepository.findBySenderIdAndReceiverIdOrReceiverIdAndSenderId(
                senderId, receiverId, senderId, receiverId
        );
    }
}