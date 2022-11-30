package com.gamers.game2gatherbackend.repositories;

import java.util.List;
import java.util.Optional;

import com.gamers.game2gatherbackend.model.Genre;

import org.springframework.data.jpa.repository.JpaRepository;

public interface GenreRepository extends JpaRepository<Genre, Long> {
    List<Genre> findAllByOrderByName();
    Optional<Genre> findByNameIgnoreCase(String name);
}
