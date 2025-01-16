package com.example.demo.Controller;

import com.example.demo.model.User;
import com.example.demo.Services.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/users")
public class UserController {
    @Autowired
    private UserService userService;

    // Register a new user
    @PostMapping("/register")
    public User register(@RequestBody User user) {
        return userService.register(user);
    }

    // Login a user
    @PostMapping("/login")
    public User login(@RequestBody User user) {
        return userService.login(user.getEmail(), user.getPassword());
    }

    // Get all users and their information
    @GetMapping("/all")
    public List<User> getAllUsers() {
        return userService.getAllUsers();
    }

    @GetMapping("/{id}/name")
    public String getUserNameById(@PathVariable String id) {
        return userService.getUserNameById(id);
    }
    @GetMapping("/name/{name}/id")
    public String getUserIdByName(@PathVariable String name) {
        return userService.getUserIdByName(name);
    }
}
