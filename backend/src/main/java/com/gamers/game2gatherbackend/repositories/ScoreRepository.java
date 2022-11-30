package com.gamers.game2gatherbackend.repositories;

import com.gamers.game2gatherbackend.model.Game;
import com.gamers.game2gatherbackend.model.MatchResponse;
import com.gamers.game2gatherbackend.model.Score;
import com.gamers.game2gatherbackend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Collection;
import java.util.List;

public interface ScoreRepository extends JpaRepository<Score, Long> {
    List<Score> findAllByScoredGame(Game scoredGame);
    List<Score> findAllByScoredBy(User scoredBy);

    @Query("select new com.gamers.game2gatherbackend.model.MatchResponse(s.scoredGame.id, count(s.ownGame), sum(cast(s.ownGame as int))) from Score s where s.scoredBy.id in (:userIds) group by s.scoredGame.id having min(s.score) > 0 order by sum(s.score) desc, RANDOM()")
    List<MatchResponse> getScoreSumsDescending(@Param("userIds") Collection<Long> userIds);

    @Query("select count(g.id) from Game g where g.id not in (select s.scoredGame.id from Score s where s.scoredBy.id = :userId)")
    Long getAmountNotRatedByUser(@Param("userId") Long userId);
}
