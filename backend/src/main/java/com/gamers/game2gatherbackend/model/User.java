package com.gamers.game2gatherbackend.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.sun.istack.NotNull;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Getter;
import lombok.Setter;

import javax.persistence.*;


@Entity
@Getter
@Setter
@Table(name = "users")
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @Basic(optional = false)
    @Schema(description = "Username of the user", required = true)
    @Column(name = "username")
    private String username;

    @Basic(optional = false)
    @Column(name = "password")
    @Schema(description = "Password hash of registered user", example = "I'm not telling!", required = true)
    @JsonProperty(required = true, access = JsonProperty.Access.WRITE_ONLY)
    private String password;

    @Basic(optional = false)
    @Column(name = "enabled")
    @NotNull
    private Boolean enabled;

    @Basic(optional = false)
    @Schema(required = true)
    @Column(name = "role")
    @NotNull
    private String role;
}
