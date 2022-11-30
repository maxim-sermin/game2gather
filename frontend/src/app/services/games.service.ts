import { Injectable } from '@angular/core';
import {Game} from "../api/models/game";
import {GameEndpointService} from "../api/services/game-endpoint.service";
import {MatSnackBar} from "@angular/material/snack-bar";
import {BehaviorSubject} from "rxjs";
import {MatchResponse} from "../api/models/match-response";
import {AppService} from "./app.service";
import {Genre} from "../api/models/genre";
import {User} from "../api/models/user";

@Injectable({
  providedIn: 'root'
})
export class GamesService {

  public allGames: BehaviorSubject<Game[] | undefined> = new BehaviorSubject<Game[] | undefined>(undefined);
  public refreshRunning = false;
  public selectedSortDirection = SortDirection.DateDescending;

  constructor(private gameEndpoint: GameEndpointService, private snackBar: MatSnackBar) { }

  public refreshGamesList(hard: boolean) {
    if (hard || !this.allGames.value) {
      this.refreshRunning = true;
      this.gameEndpoint.getAllGames().subscribe(next => {
        this.allGames.next(this.sortGames(next));
        this.refreshRunning = false;
      }, error => {
        console.log('Error while getting games list:');
        console.log(error);
        AppService.showSnackBar('Existing games could not be loaded', true, this.snackBar);
        this.refreshRunning = false;
      })
    }
  }

  public updateSingleGameWithoutRefresh(newGameValues: Game): void {
    for (const game of this.allGames.value!) {
      if (game.id === newGameValues.id) {
        // update all properties that could have changed
        game.name = newGameValues.name; // updating because admins can change this
        game.pictureLink = newGameValues.pictureLink;
        game.link = newGameValues.link;
        game.minPlayers = newGameValues.minPlayers;
        game.maxPlayers = newGameValues.maxPlayers;
        game.lastModifiedAt = newGameValues.lastModifiedAt;
        game.hasCoop = newGameValues.hasCoop;
        game.hasVs = newGameValues.hasVs;
        game.isFree = newGameValues.isFree;
        game.genre = newGameValues.genre;

        // this is required since e.g. edit-games page builds a separate array of games based on this and the change would not reflect otherwise
        this.allGames.next(this.allGames.value);
        return;
      }
    }
  }

  public sortExistingGames() {
    this.allGames.next(this.sortGames(this.allGames.value!));
  }

  private sortGames(unsorted: Game[]): Game[] {
    if (this.selectedSortDirection === SortDirection.DateDescending) {
      return unsorted.sort(this.compareGamesDate);
    } else {
      return unsorted.sort(this.compareGamesAlphabetic);
    }
  }

  private compareGamesAlphabetic(a: Game, b: Game): number {
    return a.name.localeCompare(b.name);
  }

  private compareGamesDate(a: Game, b: Game): number {
    if (Date.parse(b.lastModifiedAt!) > Date.parse(a.lastModifiedAt!)) {
      return 1;
    } else {
      return -1;
    }
  }

  public getGamesFromIds(matches: MatchResponse[]): GameWithMatchInfo[] {
    let games: GameWithMatchInfo[] = [];
    if (this.allGames.value) {
      for (const match of matches) {
        let gameFromId = this.getGameFromId(match.gameId!);
        if (gameFromId) {
          games.push({game: gameFromId, amountHaveScored: match.amountHaveScored, everybodyOwns: match.everybodyOwns});
        }
      }
    }
    return games;
  }

  public getGameFromId(id: number): Game | undefined {
    for (const game of this.allGames.value!) {
      if (game.id == id) {
        return game;
      }
    }
    return undefined;
  }

  // having this in a separate filter component messed with change detection, hence its at least here as a stateless function
  public static filterGames(onlyGenres: Genre[], unfilteredGames?: GameWithEditInfo[], gameTitle?: string, onlyCoop?: boolean, onlyVS?: boolean, onlyFree?: boolean, supportsPlayers?: number, onlyFromUser?: User): GameWithEditInfo[] {
    const filteredGames: GameWithEditInfo[] = [];
    if (unfilteredGames) {
      for (const unfilteredGame of unfilteredGames) {
        if (GamesService.excludeGameOnTitle(unfilteredGame, gameTitle)) {
          continue;
        }

        if (GamesService.excludeGameOnGenre(unfilteredGame, onlyGenres)) {
          continue;
        }

        if (GamesService.excludeGameOnCoopVs(unfilteredGame, onlyCoop, onlyVS)) {
          continue;
        }

        if (GamesService.excludeGameOnFree(unfilteredGame, onlyFree)) {
          continue;
        }

        if (GamesService.excludeGameOnPlayers(unfilteredGame, supportsPlayers)) {
          continue;
        }

        if (GamesService.excludeGameOnCreator(unfilteredGame, onlyFromUser)) {
          continue;
        }

        // it survived all filters, add it in
        filteredGames.push(unfilteredGame);
      }
    }
    return filteredGames;
  }

  // the individual check are moved into functions so filter on match page can use them as well
  public static excludeGameOnCreator(unfilteredGame: Game, onlyFromUser?: User): boolean {
    if (!onlyFromUser) {
      return false;
    }

    return onlyFromUser?.id !== unfilteredGame.createdBy?.id;
  }

  public static excludeGameOnGenre(unfilteredGame: Game, genres: Genre[]): boolean {
    if (genres.length < 1) { // no genre selected -> include every game
      return false;
    } else { // some genres selected...
      if (!unfilteredGame.genre) { // ...genre not set for game -> exclude
        return true;
      }

      for (const genre of genres) {
        if (genre.id === unfilteredGame.genre.id) {
          return false;
        }
      }

      return true;
    }
  }

  public static excludeGameOnTitle(unfilteredGame: Game, gameTitle?: string): boolean {
    if (gameTitle) {
      let filterNameLower = gameTitle.toLowerCase();
      if (!unfilteredGame.name.toLowerCase().includes(filterNameLower)) {
        return true;
      }
    }

    return false;
  }

  public static excludeGameOnFree(unfilteredGame: Game, onlyFree?: boolean) {
    if (onlyFree && !unfilteredGame.isFree) {
      return true;
    }

    return false;
  }

  public static excludeGameOnCoopVs(unfilteredGame: Game, onlyCoop?: boolean, onlyVS?: boolean) {
    if (onlyCoop && !unfilteredGame.hasCoop) {
      return true;
    }

    if (onlyVS && !unfilteredGame.hasVs) {
      return true;
    }

    return false;
  }

  public static excludeGameOnPlayers(unfilteredGame: Game, supportsPlayers?: number): boolean {
    if (supportsPlayers) {
      if (unfilteredGame.minPlayers && unfilteredGame.minPlayers > supportsPlayers) {
        return true;
      }

      if (unfilteredGame.maxPlayers && unfilteredGame.maxPlayers < supportsPlayers) {
        return true;
      }
    }

    return false;
  }
}

export interface GameWithMatchInfo {
  game: Game;
  amountHaveScored: number;
  everybodyOwns: number;
}

export interface GameWithEditInfo extends Game {
  canEdit: boolean;
}

export enum SortDirection {
  DateDescending="DateDescending",
  AlphabeticAscending="AlphabeticAscending",
}

export const SortDirectionLabelMapping: Record<SortDirection, string> = {
  [SortDirection.DateDescending]: "Date changed (newest)",
  [SortDirection.AlphabeticAscending]: "Alphabetic (A-Z)"
};
