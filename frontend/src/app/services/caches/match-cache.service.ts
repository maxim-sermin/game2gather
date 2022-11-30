import { Injectable } from '@angular/core';
import {User} from "../../api/models/user";
import {FormControl} from "@angular/forms";
import {GameWithMatchInfo} from "../games.service";

@Injectable({
  providedIn: 'root'
})
export class MatchCacheService {

  public selectedUsers: User[] = [];
  public searchedGamesForAmountUsers = 0;
  public selectedShowOnlyGenre = new FormControl([]);
  public selectedShowOnlyCoop = new FormControl();
  public selectedShowOnlyVs = new FormControl();
  public selectedAmountPlayers = new FormControl();
  public selectedShowOnlyRatedByAll = new FormControl();
  public selectedShowOnlyOwnedByAlL = new FormControl();
  public sortedGames: GameWithMatchInfo[] = [];
  public filteredGames: GameWithMatchInfo[] = [];
  public skippedGames: GameWithMatchInfo[] = [];

  constructor() { }
}
