package com.example.demo.Controller;

import com.example.demo.model.Message;
import com.example.demo.Services.MessageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/messages")
public class MessageController {

    @Autowired
    private MessageService messageService;

    // Endpoint to send a message
    @PostMapping("/send")
    public Message sendMessage(@RequestBody Message message) {
        return messageService.sendMessage(message);
    }

    // Endpoint to get messages by receiverId
    @GetMapping("/receiver")
    public List<Message> getMessages(@RequestParam String receiverId) {
        return messageService.getMessages(receiverId);
    }

    // Endpoint to get all messages
    @GetMapping("/all")
    public List<Message> getAllMessages() {
        return messageService.getAllMessages();
    }

    @GetMapping("/conversation")
    public List<Message> getConversation(@RequestParam String senderId, @RequestParam String receiverId) {
        return messageService.getConversation(senderId, receiverId);
    }
}