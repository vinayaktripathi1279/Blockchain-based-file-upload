package com.portal.config;

import com.portal.entity.User;
import com.portal.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

/**
 * Automatically seeds the database on startup with demo users:
 * 1. Alice Walker (alice@example.com / password123) - Sender
 * 2. Bob Davis (bob@example.com / password123) - Recipient
 *
 * This ensures demo logins work instantly on both local and cloud environments!
 */
@Component
public class DataInitializer implements CommandLineRunner {

    private static final Logger logger = LoggerFactory.getLogger(DataInitializer.class);

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        // Seed Alice (User A)
        if (!userRepository.existsByEmail("alice@example.com")) {
            User alice = new User();
            alice.setName("Alice Walker");
            alice.setEmail("alice@example.com");
            alice.setPassword(passwordEncoder.encode("password123"));
            alice.setRole("ROLE_USER");
            userRepository.save(alice);
            logger.info("Demo user 'Alice' created: alice@example.com / password123");
        }

        // Seed Bob (User B)
        if (!userRepository.existsByEmail("bob@example.com")) {
            User bob = new User();
            bob.setName("Bob Davis");
            bob.setEmail("bob@example.com");
            bob.setPassword(passwordEncoder.encode("password123"));
            bob.setRole("ROLE_USER");
            userRepository.save(bob);
            logger.info("Demo user 'Bob' created: bob@example.com / password123");
        }
    }
}
