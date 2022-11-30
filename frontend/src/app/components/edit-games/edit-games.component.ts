import {Component, OnDestroy, OnInit} from '@angular/core';
import {GamesService, GameWithEditInfo, SortDirection, SortDirectionLabelMapping} from "../../services/games.service";
import {Game} from "../../api/models/game";
import {Subscription} from "rxjs";
import {AuthenticationService} from "../../services/security/authentication.service";
import {GenreService} from "../../services/genre.service";
import {FormControl, FormGroup} from "@angular/forms";

@Component({
  selector: 'app-edit-games',
  templateUrl: './edit-games.component.html',
  styleUrls: ['./edit-games.component.scss']
})
export class EditGamesComponent implements OnInit, OnDestroy {

  public sortDirections = SortDirectionLabelMapping;
  public sortDirectionValues = Object.values(SortDirection);
  public gamesWithEditInfo: GameWithEditInfo[] = [];
  public filteredGames: GameWithEditInfo[] = [];
  private gamesSub?: Subscription;
  private userSub?: Subscription;
  public allGenresSelected = false;
  public someGameCurrentlyEditing = false;

  public filterForm: FormGroup = new FormGroup({
    gameTitle: new FormControl(),
    onlyGenre: new FormControl([]),
    supportsPlayers: new FormControl(),
    onlyCoop: new FormControl(),
    onlyVS: new FormControl(),
    onlyFree: new FormControl()
  });
  public showOnlyOwnGames = new FormControl(true);

  constructor(public gamesService: GamesService, public authenticationService: AuthenticationService, public genreService: GenreService) { }

  ngOnInit(): void {
    this.genreService.refreshGenreList(false);
    this.gamesService.refreshGamesList(false);

    this.userSub = this.authenticationService.authenticatedUser.subscribe(next => {
      if (next) {
        this.showOnlyOwnGames.setValue(!this.authenticationService.isAdmin(), { emitEvent: false });

        this.gamesSub = this.gamesService.allGames.subscribe(next => {
          if (next) { // first BehaviorSubject event is initial value
            this.enrichGamesWithEditInfo(next);
          }
        });
      }
    })

    this.filterForm.valueChanges.subscribe(() => this.filterGames());
    this.showOnlyOwnGames.valueChanges.subscribe(() => this.filterGames());
  }

  private enrichGamesWithEditInfo(allGames: Game[]): void {
    this.someGameCurrentlyEditing = false;
    this.gamesWithEditInfo = [];

    let userIsAdmin = this.authenticationService.isAdmin();
    for (const game of allGames) {
      let gameWithEditInfo = {...game} as GameWithEditInfo;
      gameWithEditInfo.canEdit = userIsAdmin || game.createdBy?.id === this.authenticationService.authenticatedUser.value?.id
      this.gamesWithEditInfo.push(gameWithEditInfo);
    }

    this.filterGames();
  }

  private filterGames() {
    this.filteredGames = GamesService.filterGames(this.filterForm.value.onlyGenre, this.gamesWithEditInfo, this.filterForm.value.gameTitle, this.filterForm.value.onlyCoop, this.filterForm.value.onlyVS, this.filterForm.value.onlyFree, this.filterForm.value.supportsPlayers, this.showOnlyOwnGames.value ? this.authenticationService.authenticatedUser.value : undefined);
  }

  ngOnDestroy(): void {
    if (this.gamesSub) {
      this.gamesSub.unsubscribe();
    }
    if (this.userSub) {
      this.userSub.unsubscribe();
    }
  }
}
