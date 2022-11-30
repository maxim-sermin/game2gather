package com.gamers.game2gatherbackend.repositories;

import com.gamers.game2gatherbackend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    List<User> findAllByOrderByUsername();
    Optional<User> findByUsername(String username);
    // beware: custom methods added here can cause @JsonProperty annotations on User to be ignored, thereby exposing the password hash
}
