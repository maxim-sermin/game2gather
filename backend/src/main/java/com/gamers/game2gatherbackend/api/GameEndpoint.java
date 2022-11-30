package com.gamers.game2gatherbackend.api;

import com.gamers.game2gatherbackend.model.Game;
import com.gamers.game2gatherbackend.model.MatchResponse;
import com.gamers.game2gatherbackend.model.Score;
import com.gamers.game2gatherbackend.model.User;
import com.gamers.game2gatherbackend.repositories.GameRepository;
import com.gamers.game2gatherbackend.repositories.ScoreRepository;
import com.gamers.game2gatherbackend.repositories.UserRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.time.LocalDateTime;
import java.util.*;

@RestController
@RequestMapping(path = "/games")
@Tag(name = "Game Endpoint", description = "Endpoint for interacting with games")
public class GameEndpoint {

    private static final org.slf4j.Logger logger = LoggerFactory.getLogger(GameEndpoint.class);

    @Autowired
    private GameRepository gameRepository;

    @Autowired
    private ScoreRepository scoreRepository;

    @Autowired
    private UserRepository userRepository;

    @GetMapping(value = "/", produces = "application/json")
    public ResponseEntity<List<Game>> getAllGames() {
        return new ResponseEntity<>(gameRepository.findAll(), HttpStatus.OK);
    }

    @Operation(summary = "Add new game")
    @PostMapping(value = "/add", produces = "application/json")
    public ResponseEntity<Game> addGame(@Parameter(hidden = true) Principal principal, @RequestBody Game newGame) {
        Optional<Game> game = gameRepository.findByNameIgnoreCase(newGame.getName());

        if (game.isPresent()) {
            logger.debug("Tried to add game with name '{}' which already exists", newGame.getName());
            return new ResponseEntity<>(HttpStatus.CONFLICT);
        }

        Optional<User> user = userRepository.findByUsername(principal.getName());
        if (user.isEmpty()) {
            logger.warn("Got a request to save a new game from user '{}' which does not exist anymore", principal.getName());
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        }

        newGame.setCreatedBy(user.get());
        newGame.setLastModifiedAt(LocalDateTime.now());

        Game savedGame = gameRepository.save(newGame);
        return ResponseEntity.ok(savedGame);
    }

    @Operation(summary = "Update an existing game")
    @PutMapping(value = "/update", produces = "application/json")
    public ResponseEntity<Game> updateGame(@Parameter(hidden = true) Principal principal, @RequestBody Game changedGame) {
        Optional<Game> gameOptional = gameRepository.findById(changedGame.getId());

        if (gameOptional.isEmpty()) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
        Game gameFromDB = gameOptional.get();

        if (!userAllowedToUpdateOrDelete(gameFromDB, principal.getName())) {
            return new ResponseEntity<>(HttpStatus.FORBIDDEN);
        }

        if (UserEndpoint.isCurrentUserAdmin()) { // ignoring game name in input because it should be immutable (except for admins)
            gameFromDB.setName(changedGame.getName());
        }
        gameFromDB.setLink(changedGame.getLink());
        gameFromDB.setMinPlayers(changedGame.getMinPlayers());
        gameFromDB.setMaxPlayers(changedGame.getMaxPlayers());
        gameFromDB.setPictureLink(changedGame.getPictureLink());
        gameFromDB.setLastModifiedAt(LocalDateTime.now());
        gameFromDB.setHasCoop(changedGame.getHasCoop());
        gameFromDB.setHasVs(changedGame.getHasVs());
        gameFromDB.setIsFree(changedGame.getIsFree());
        gameFromDB.setGenre(changedGame.getGenre());

        Game savedGame = gameRepository.save(gameFromDB);
        return ResponseEntity.ok(savedGame);
    }

    @DeleteMapping(value = "/delete/{id}", produces = "text/plain")
    public ResponseEntity<String> deleteGame(@Parameter(hidden = true) Principal principal, @PathVariable("id") Long id) {
        Optional<Game> gameOptional = gameRepository.findById(id);

        if (gameOptional.isEmpty()) {
            return new ResponseEntity<>("Game with id '" + id + "' not found", HttpStatus.NOT_FOUND);
        }
        Game gameFromDB = gameOptional.get();

        if (!userAllowedToUpdateOrDelete(gameFromDB, principal.getName())) {
            return new ResponseEntity<>("Current user is not allowed to delete game '" + gameFromDB.getName() + "'", HttpStatus.FORBIDDEN);
        }

        List<Score> scoresForGame = scoreRepository.findAllByScoredGame(gameFromDB);
        if (scoresForGame.size() > 0) {
            return new ResponseEntity<>("Game '" + gameFromDB.getName() + "' cannot be deleted because it has scores", HttpStatus.BAD_REQUEST);
        }

        gameRepository.delete(gameFromDB);

        return ResponseEntity.ok("Successfully deleted");
    }

    @GetMapping(value = "/match", produces = "application/json")
    public ResponseEntity<List<MatchResponse>> getSortedGameIdMatches(@Parameter(hidden = true) Principal principal, @RequestParam(required = false) Set<Long> matchWithUserIds) {
        Optional<User> userOptional = userRepository.findByUsername(principal.getName());
        if (userOptional.isEmpty()) {
            logger.warn("Got a request to get game matches from user '{}' which does not exist anymore", principal.getName());
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        }
        User user = userOptional.get();

        if (matchWithUserIds == null) { // only search for current user
            matchWithUserIds = new HashSet<>();
        }

        matchWithUserIds.add(user.getId());

        return ResponseEntity.ok(scoreRepository.getScoreSumsDescending(matchWithUserIds));
    }

    private boolean userAllowedToUpdateOrDelete(Game gameFromDB, String username) {
        Optional<User> user = userRepository.findByUsername(username);
        if (user.isEmpty()) {
            logger.warn("Got a request to update/delete a game from user '{}' which does not exist anymore", username);
            return false;
        }

        if (!UserEndpoint.isCurrentUserAdmin() && !user.get().equals(gameFromDB.getCreatedBy())) {
            logger.debug("Got a request to update/delete the game with id '{}' from user '{}' who is not the creator and not an admin", gameFromDB.getId(), username);
            return false;
        }

        return true;
    }
}
