package com.gamers.game2gatherbackend.api;

import java.util.List;
import java.util.Optional;

import com.gamers.game2gatherbackend.model.Genre;
import com.gamers.game2gatherbackend.repositories.GenreRepository;

import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;


@RestController
@RequestMapping(path = "/genre")
@Tag(name = "Genre Endpoint", description = "Endpoint for interacting with genres")
public class GenreEndpoint {

    private static final org.slf4j.Logger logger = LoggerFactory.getLogger(GenreEndpoint.class);

    
    @Autowired
    private GenreRepository genreRepository;

    @GetMapping(value = "/", produces = "application/json")
    public ResponseEntity<List<Genre>> getAllGenre() {
        return new ResponseEntity<>(genreRepository.findAllByOrderByName(), HttpStatus.OK);
    }

    @Operation(summary = "Add new Genre")
    @PostMapping(value = "/add", produces = "application/json")
    public ResponseEntity<Genre> addGenre(@RequestBody Genre newGenre) {
        Optional<Genre> genreOptional = genreRepository.findByNameIgnoreCase(newGenre.getName());

        if (genreOptional.isPresent()) {
            logger.debug("Tried to add Genre with name '{}' which already exists", newGenre.getName());
            return new ResponseEntity<>(HttpStatus.CONFLICT);
        }

        if (!UserEndpoint.isCurrentUserAdmin()) {
            logger.debug("Got a request to add Genre with id from user who is not an admin");
            return new ResponseEntity<>(HttpStatus.FORBIDDEN);
        } else {
            logger.debug("Got a request to add Genre from user who is an admin");

            Genre savedGenre = genreRepository.save(newGenre);
            return ResponseEntity.ok(savedGenre);
        }
    }

    @DeleteMapping(value = "/delete/{id}", produces = "text/plain")
    public ResponseEntity<String> deleteGenre(@PathVariable("id") Long id) {
        if (!UserEndpoint.isCurrentUserAdmin()) {
            logger.debug("Got a request to delete genre from user who is not an admin");
            return new ResponseEntity<>(HttpStatus.FORBIDDEN);
        }

        Optional<Genre> genreOptional = genreRepository.findById(id);

        if (genreOptional.isEmpty()) {
            return new ResponseEntity<>("Genre with id '" + id + "' not found", HttpStatus.NOT_FOUND);
        }
        Genre genreFromDB = genreOptional.get();
        genreRepository.delete(genreFromDB);
        return ResponseEntity.ok("Successfully deleted");
    }

    @Operation(summary = "Update an existing genre")
    @PutMapping(value = "/update", produces = "application/json")
    public ResponseEntity<Genre> updateGenre(@RequestBody Genre changedGenre) {
        if (!UserEndpoint.isCurrentUserAdmin()) {
            logger.debug("Got a request to update genre from user who is not an admin");
            return new ResponseEntity<>(HttpStatus.FORBIDDEN);
        }

        Optional<Genre> genreOptional = genreRepository.findById(changedGenre.getId());

        if (genreOptional.isEmpty()) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
        Genre genreFromDB = genreOptional.get();

        genreFromDB.setName(changedGenre.getName());

        Genre savedGenre = genreRepository.save(genreFromDB);
        return ResponseEntity.ok(savedGenre);
    }
}
