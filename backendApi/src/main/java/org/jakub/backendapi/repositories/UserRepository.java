package org.jakub.backendapi.repositories;


import org.jakub.backendapi.entities.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email); // Renamed from findByLogin

}
