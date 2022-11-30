package com.gamers.game2gatherbackend.repositories;

import com.gamers.game2gatherbackend.model.Game;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface GameRepository extends JpaRepository<Game, Long> {
    Optional<Game> findByNameIgnoreCase(String name);
}
