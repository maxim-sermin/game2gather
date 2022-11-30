package com.gamers.game2gatherbackend.model;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

import javax.validation.constraints.NotNull;

@Getter
@Setter
@AllArgsConstructor
public class MatchResponse {

    @NotNull
    public Long gameId;

    @NotNull
    public Long amountHaveScored;

    @NotNull
    public Long everybodyOwns;
}
