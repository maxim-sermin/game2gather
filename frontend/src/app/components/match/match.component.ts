import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {FormControl} from "@angular/forms";
import {User} from "../../api/models/user";
import {UsersService} from "../../services/users.service";
import {BehaviorSubject} from "rxjs";
import {MatAutocompleteSelectedEvent, MatAutocompleteTrigger} from "@angular/material/autocomplete";
import {AuthenticationService} from "../../services/security/authentication.service";
import {GamesService, GameWithMatchInfo} from "../../services/games.service";
import {GameEndpointService} from "../../api/services/game-endpoint.service";
import {MatSnackBar} from "@angular/material/snack-bar";
import {Game} from "../../api/models/game";
import {AppService} from "../../services/app.service";
import {MatchCacheService} from "../../services/caches/match-cache.service";
import {GenreService} from "../../services/genre.service";

@Component({
  selector: 'app-match',
  templateUrl: './match.component.html',
  styleUrls: ['./match.component.scss']
})
export class MatchComponent implements OnInit {

  public filteredUsers: BehaviorSubject<User[]> = new BehaviorSubject<User[]>([]);
  public selectUserInput = new FormControl();
  @ViewChild('usersInput', {read: ElementRef}) usersInput?: ElementRef<HTMLInputElement>;
  @ViewChild(MatAutocompleteTrigger, { read: MatAutocompleteTrigger }) matAutoComplete?: MatAutocompleteTrigger;
  public matchSearchRunning = false;
  public allGenresSelected = false;

  constructor(public usersService: UsersService, public authenticationService: AuthenticationService, private gamesService: GamesService, private gameEndpoint: GameEndpointService, private snackBar: MatSnackBar, public appService: AppService, public matchCacheService: MatchCacheService, public genreService: GenreService) { }

  ngOnInit(): void {
    this.genreService.refreshGenreList(false);
    if (this.matchCacheService.selectedUsers.length < 1) {
      // we just hope those finish before we need them :P
      this.usersService.refreshUsers(false);
      this.gamesService.refreshGamesList(false);

      this.authenticationService.authenticatedUser.subscribe(currentUser => {
        if (currentUser) {
          this.matchCacheService.selectedUsers.push(currentUser);
          this.updateAmountPlayersSuggestion();
        }
      })
    }
  }

  public remove(user: User): void {
    const index = this.matchCacheService.selectedUsers.indexOf(user);

    if (index >= 0) {
      this.matchCacheService.selectedUsers.splice(index, 1);
      this.updateAmountPlayersSuggestion();
    }

    this.filterUsers();
  }

  private resetUsersInput(): void {
    this.usersInput!.nativeElement.value = '';
    this.selectUserInput.setValue(null);
  }

  public filterUsers() {
    const filteredUserOptions = this.filterByName(this.selectUserInput.value, this.usersService.users.value || []);
    this.filteredUsers.next(filteredUserOptions);
  }

  public selected(event: MatAutocompleteSelectedEvent): void {
    const user = event.option.value as User;
    if (!this.userAlreadyAdded(user)) {
      this.matchCacheService.selectedUsers.push(user);
      this.updateAmountPlayersSuggestion();
    }
    this.resetUsersInput();
    this.filterUsers();
    setTimeout(() => {this.matAutoComplete?.openPanel()});
  }

  public getMatchingGamesList(): void {
    this.matchSearchRunning = true;
    this.gameEndpoint.getSortedGameIdMatches({matchWithUserIds: this.getIdsFromSelectedUsers()}).subscribe(next => {
      this.matchCacheService.skippedGames = [];
      this.matchCacheService.sortedGames = this.gamesService.getGamesFromIds(next);
      this.matchCacheService.searchedGamesForAmountUsers = this.matchCacheService.selectedUsers.length; // this is used for some chips which should stay even while user input form changes
      this.updateFilters();
      this.matchSearchRunning = false;
    }, error => {
      console.log("Could not get game matches:");
      console.log(error);
      AppService.showSnackBar('Could not find matching games', true, this.snackBar);
      this.matchSearchRunning = false;
    })
  }

  public updateFilters(): void {
    this.matchCacheService.filteredGames = [];
    for (const sortedGame of this.matchCacheService.sortedGames) {
      if (GamesService.excludeGameOnGenre(sortedGame.game, this.matchCacheService.selectedShowOnlyGenre.value)) {
        continue;
      }

      if (GamesService.excludeGameOnCoopVs(sortedGame.game, this.matchCacheService.selectedShowOnlyCoop.value, this.matchCacheService.selectedShowOnlyVs.value)) {
        continue;
      }

      if (GamesService.excludeGameOnPlayers(sortedGame.game, this.matchCacheService.selectedAmountPlayers.value)) {
        continue;
      }

      if (this.matchCacheService.selectedShowOnlyRatedByAll.value && !this.isGameRatedByAll(sortedGame)) {
        continue;
      }

      if (this.matchCacheService.selectedShowOnlyOwnedByAlL.value && !this.isGameOwnedByAll(sortedGame)) {
        continue;
      }

      if (this.matchCacheService.skippedGames.includes(sortedGame)) {
        continue;
      }

      this.matchCacheService.filteredGames.push(sortedGame);
    }
  }

  public isGameRatedByAll(game: GameWithMatchInfo): boolean {
    return game.amountHaveScored === this.matchCacheService.searchedGamesForAmountUsers;
  }

  public isGameOwnedByAll(game: GameWithMatchInfo): boolean {
    return game.everybodyOwns === this.matchCacheService.searchedGamesForAmountUsers || game.game.isFree;
  }

  public skipMatchedGame(skippedGame: GameWithMatchInfo) {
    this.matchCacheService.skippedGames.push(skippedGame);
    this.updateFilters();
  }

  private getIdsFromSelectedUsers(): number[] {
    let ids: number[] = [];
    for (const selectedUser of this.matchCacheService.selectedUsers) {
      if (selectedUser !== this.authenticationService.authenticatedUser.value) {
        ids.push(selectedUser.id!);
      }
    }
    return ids;
  }

  // value is of type User when suggestion gets selected and of type string when input event is handled
  private filterByName(value: any, filterThose: User[]): User[] {
    let filterValue = '';
    if (value && typeof value === 'string') {
      filterValue = value.toLowerCase();
    }
    return filterThose.filter(option => option.username.toLowerCase().includes(filterValue) && !this.matchCacheService.selectedUsers.some(selected => selected.id === option.id));
  }

  private userAlreadyAdded(userToAdd: User): boolean{
    for (const user of this.matchCacheService.selectedUsers) {
      if (user.id === userToAdd.id) {
        return true;
      }
    }
    return false;
  }

  private updateAmountPlayersSuggestion(): void {
    this.matchCacheService.selectedAmountPlayers.patchValue(this.matchCacheService.selectedUsers.length);
  }
}

interface GameWithProperties {
  game: Game[];
  allOwn: boolean;
  allScored: boolean;
}
