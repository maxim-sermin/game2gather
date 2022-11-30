package com.gamers.game2gatherbackend.model;

import com.sun.istack.NotNull;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Getter;
import lombok.Setter;

import javax.persistence.*;
import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@Table(name = "scores")
public class Score {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @JoinColumn(name = "scored_by_user_fk")
    @ManyToOne(fetch = FetchType.LAZY)
    private User scoredBy;

    @JoinColumn(name = "scored_game_fk")
    @ManyToOne(fetch = FetchType.LAZY)
    private Game scoredGame;

    @Basic
    @Schema(description = "Score or the game from 0.0 to 1.0")
    @Column(name = "score")
    private Float score;

    @Basic(optional = false)
    @Schema(required = true)
    @Column(name = "own_game")
    @NotNull
    private Boolean ownGame;

    @Basic(optional = false) // non-optional in db
    @Column(name = "last_modified_at")
    @Schema(description = "The date and time when this score was last modified") // optional in json (e.g. when saving new)
    private LocalDateTime lastModifiedAt;
}
