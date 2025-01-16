package com.example.demo.Services;

import com.example.demo.model.User;
import com.example.demo.Repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    // Register a new user
    public User register(User user) {
        if (userRepository.findByEmail(user.getEmail()).isPresent()) {
            throw new RuntimeException("The e-mail " + user.getEmail() + " is currently used by another user.");
        }
        if (userRepository.findByName(user.getName()).isPresent()) {
            throw new RuntimeException("The username " + user.getName() + " is currently used by another user.");
        }

        return userRepository.save(user);
    }

    // Login user by verifying email and password
    public User login(String email, String password) {
        Optional<User> userOptional = userRepository.findByEmail(email); // Optional<User> döner
        if (userOptional.isPresent() && userOptional.get().getPassword().equals(password)) {
            return userOptional.get(); // Kullanıcıyı döndür
        }
        throw new RuntimeException("Invalid email or password");
    }

    public List<String> getFriendList(String userId) {
        Optional<User> user = userRepository.findById(userId);

        if (user.isEmpty()) {
            System.out.println("No user found with ID: " + userId); // Debugging log
            throw new RuntimeException("User not found");
        }

        return user.get().getFriends();
    }

    // Fetch all users
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public String getUserNameById(String id) {
        Optional<User> user = userRepository.findById(id);
        if (user.isPresent()) {
            return user.get().getName();
        }
        throw new RuntimeException("User not found with ID: " + id);
    }

    public String getUserIdByName(String name) {
        Optional<User> user = userRepository.findByName(name); // `findByName` metodu repository'de tanımlı olmalı
        if (user.isPresent()) {
            return user.get().getId();
        }
        throw new RuntimeException("User not found with name: " + name);
    }
}
