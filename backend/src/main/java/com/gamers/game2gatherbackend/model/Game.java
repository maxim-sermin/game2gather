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
@Table(name = "games")
public class Game {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @Basic(optional = false)
    @Schema(description = "Name of the game", required = true)
    @Column(name = "name")
    private String name;

    @Basic(optional = false) // non-optional in db
    @Column(name = "last_modified_at")
    @Schema(description = "The date and time when this game was last modified") // optional in json (e.g. when saving new)
    private LocalDateTime lastModifiedAt;

    @Basic
    @Schema(description = "Link to store/review/etc page")
    @Column(name = "link")
    private String link;

    @Basic
    @Schema(description = "Link to a picture of the game/cover")
    @Column(name = "picture_link")
    private String pictureLink;

    @Basic
    @Column(name = "min_players")
    @Schema(description = "Minimal amount of players")
    private Integer minPlayers;

    @Basic
    @Column(name = "max_players")
    @Schema(description = "Maximal amount of players")
    private Integer maxPlayers;

    @JoinColumn(name = "created_by_user_fk")
    @ManyToOne(fetch = FetchType.LAZY)
    private User createdBy;

    @Basic(optional = false)
    @Schema(required = true)
    @Column(name = "has_coop")
    @NotNull
    private Boolean hasCoop;

    @Basic(optional = false)
    @Schema(required = true)
    @Column(name = "has_vs")
    @NotNull
    private Boolean hasVs;

    @Basic(optional = false)
    @Schema(required = true)
    @Column(name = "is_free")
    @NotNull
    private Boolean isFree;

    @JoinColumn(name = "genre_fk")
    @ManyToOne(fetch = FetchType.EAGER)
    private Genre genre;
}
