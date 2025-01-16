package com.example.demo.Repository;

import com.example.demo.model.User;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.Optional;

public interface UserRepository extends MongoRepository<User, String> {
    // Find user by email (optional, if needed elsewhere)
    Optional<User> findByEmail(String email);
    Optional<User> findByName(String name);
}
