package org.jakub.backendapi.config;

import lombok.RequiredArgsConstructor;
import org.jakub.backendapi.entities.Enums.Role;
import org.jakub.backendapi.entities.User;
import org.jakub.backendapi.entities.UserPreferences;
import org.jakub.backendapi.repositories.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        String adminEmail = "admin@admin.pl";
        if (userRepository.findByEmail(adminEmail).isEmpty()) {
            User adminUser = User.builder()
                    .email(adminEmail)
                    .password(passwordEncoder.encode("admin"))
                    .role(Role.ADMIN)
                    .build();
            UserPreferences userPreferences = new UserPreferences();
            userPreferences.setUser(adminUser);
            adminUser.setUserPreferences(userPreferences);
            userRepository.save(adminUser);
            System.out.println("Admin user created: " + adminEmail);
        } else {
            System.out.println("Admin user " + adminEmail + " already exists.");
        }
    }
}
