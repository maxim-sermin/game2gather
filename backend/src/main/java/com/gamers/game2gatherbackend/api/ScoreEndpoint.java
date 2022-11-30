package com.gamers.game2gatherbackend.api;

import com.gamers.game2gatherbackend.model.Game;
import com.gamers.game2gatherbackend.model.Score;
import com.gamers.game2gatherbackend.model.User;
import com.gamers.game2gatherbackend.repositories.GameRepository;
import com.gamers.game2gatherbackend.repositories.ScoreRepository;
import com.gamers.game2gatherbackend.repositories.UserRepository;
import io.swagger.v3.oas.annotations.Parameter;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping(path = "/scores")
public class ScoreEndpoint {

    private static final org.slf4j.Logger logger = LoggerFactory.getLogger(ScoreEndpoint.class);

    @Autowired
    private ScoreRepository scoreRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private GameRepository gameRepository;

    @GetMapping(value = "/my", produces = "application/json")
    public ResponseEntity<List<Score>> getMyScores(@Parameter(hidden = true) Principal principal) {
        Optional<User> user = userRepository.findByUsername(principal.getName());
        if (user.isEmpty()) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }

        return new ResponseEntity<>(scoreRepository.findAllByScoredBy(user.get()), HttpStatus.OK);
    }

    @PutMapping(value = "/change", produces = "application/json")
    public ResponseEntity<Score> changeScore(@Parameter(hidden = true) Principal principal, @RequestBody Score changedScore) {
        Optional<Score> existingScoreOptional = Optional.empty();

        if (changedScore.getId() != null) {
            existingScoreOptional = scoreRepository.findById(changedScore.getId());
        }

        if (existingScoreOptional.isEmpty()) {
            // add new score
            if (changedScore.getScoredGame() == null || changedScore.getScoredGame().getId() == null || changedScore.getScore() == null) {
                return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
            }

            Optional<Game> scoredGameOptional = gameRepository.findById(changedScore.getScoredGame().getId());
            if (scoredGameOptional.isEmpty()) {
                return new ResponseEntity<>(HttpStatus.NOT_FOUND);
            }

            Optional<User> user = userRepository.findByUsername(principal.getName());
            if (user.isEmpty()) {
                logger.warn("Got a request to add a new game from user '{}' which does not exist anymore", principal.getName());
                return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
            }

            Score saveScore = new Score();
            saveScore.setScoredBy(user.get());
            saveScore.setScoredGame(scoredGameOptional.get());
            saveScore.setScore(changedScore.getScore());
            saveScore.setOwnGame(changedScore.getOwnGame());
            saveScore.setLastModifiedAt(LocalDateTime.now());

            Score savedScore = scoreRepository.save(saveScore);
            return ResponseEntity.ok(savedScore);
        } else {
            // update existing score
            Score scoreFromDB = existingScoreOptional.get();
            scoreFromDB.setScore(changedScore.getScore());
            scoreFromDB.setOwnGame(changedScore.getOwnGame());
            scoreFromDB.setLastModifiedAt(LocalDateTime.now());

            Score savedScore = scoreRepository.save(scoreFromDB);
            return ResponseEntity.ok(savedScore);
        }
    }

    @DeleteMapping(value = "/delete/{id}", produces = "text/plain")
    public ResponseEntity<String> deleteScore(@Parameter(hidden = true) Principal principal, @PathVariable("id") Long id) {
        Optional<Score> scoreOptional = scoreRepository.findById(id);
        if (scoreOptional.isEmpty()) {
            return new ResponseEntity<>("Score with id '" + id + "' not found", HttpStatus.NOT_FOUND);
        }

        Optional<User> user = userRepository.findByUsername(principal.getName());
        if (user.isEmpty()) {
            logger.warn("Got a request to delete a score from user '{}' which does not exist anymore", principal.getName());
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        }

        Score scoreFromDB = scoreOptional.get();
        if (!user.get().equals(scoreFromDB.getScoredBy())) {
            logger.debug("Got a request to delete a score from user '{}' who is not the creator of the score", principal.getName());
            return new ResponseEntity<>(HttpStatus.FORBIDDEN);
        }

        scoreRepository.delete(scoreFromDB);
        return ResponseEntity.ok("Successfully deleted");
    }

    @GetMapping(value = "/myUnrated", produces = "application/json")
    public ResponseEntity<Long> getMyAmountUnrated(@Parameter(hidden = true) Principal principal) {
        Optional<User> user = userRepository.findByUsername(principal.getName());
        if (user.isEmpty()) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }

        return ResponseEntity.ok(scoreRepository.getAmountNotRatedByUser(user.get().getId()));
    }
}
