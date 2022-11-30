import {Component, Input, OnInit} from '@angular/core';
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {GameEndpointService} from "../../../api/services/game-endpoint.service";
import {GamesService} from "../../../services/games.service";
import {MatSnackBar} from "@angular/material/snack-bar";
import {Game} from "../../../api/models/game";
import {AuthenticationService} from "../../../services/security/authentication.service";
import {BehaviorSubject} from "rxjs";
import {AppService} from "../../../services/app.service";
import {GenreService} from "../../../services/genre.service";
import {Genre} from "../../../api/models/genre";

@Component({
  selector: 'app-add-game',
  templateUrl: './add-game.component.html',
  styleUrls: ['./add-game.component.scss']
})
export class AddGameComponent implements OnInit {

  @Input() editExistingGame?: Game;
  public saveGameRunning = false;
  public filteredGameNameOptions: BehaviorSubject<Game[]> = new BehaviorSubject<Game[]>([]);
  public duplicateNameWarning = false;
  public selectedGenre?: Genre;

  public newGameForm: FormGroup = new FormGroup({
    name: new FormControl('', Validators.required),
    link: new FormControl(),
    pictureLink: new FormControl(),
    minPlayers: new FormControl(),
    maxPlayers: new FormControl(),
    hasCoop: new FormControl(),
    hasVs: new FormControl(),
    isFree: new FormControl()
  });

  constructor(private gameEndpoint: GameEndpointService, private gamesService: GamesService, private snackBar: MatSnackBar, public authenticationService: AuthenticationService, public genreService: GenreService) { }

  ngOnInit(): void {
    if (this.editExistingGame) {
      const nameControl = this.newGameForm.controls['name'];
      nameControl.patchValue(this.editExistingGame.name);
      if (!this.authenticationService.isAdmin()) {
        nameControl.disable(); // editing of name of existing games not allowed to avoid trolling (except for admins)
      }

      this.newGameForm.controls['link'].patchValue(this.editExistingGame.link);
      this.newGameForm.controls['pictureLink'].patchValue(this.editExistingGame.pictureLink);
      this.newGameForm.controls['minPlayers'].patchValue(this.editExistingGame.minPlayers);
      this.newGameForm.controls['maxPlayers'].patchValue(this.editExistingGame.maxPlayers);
      this.newGameForm.controls['hasCoop'].patchValue(this.editExistingGame.hasCoop);
      this.newGameForm.controls['hasVs'].patchValue(this.editExistingGame.hasVs);
      this.newGameForm.controls['isFree'].patchValue(this.editExistingGame.isFree);
      this.selectedGenre = this.genreService.getGenreForId(this.editExistingGame.genre?.id);
    }
  }

  public filterGames(): void {
    const filteredGames = this.filterGameName(this.newGameForm.value.name);
    this.filteredGameNameOptions.next(filteredGames);
  }

  private filterGameName(value: string): Game[] {
    if (!this.gamesService.allGames.value || !value) {
      return [];
    }
    const filterValue = value.toLowerCase();

    const filteredGames: Game[] = []
    this.duplicateNameWarning = false;
    for (const game of this.gamesService.allGames.value) {
      let gameNameLower = game.name.toLowerCase();
      if (gameNameLower.includes(filterValue)) {
        if (game.id !== this.editExistingGame?.id && gameNameLower === filterValue && gameNameLower !== this.editExistingGame?.name) {
          this.newGameForm.controls['name'].setErrors({'incorrect': true});
          this.duplicateNameWarning = true;
        }
        filteredGames.push(game);
      }
    }

    return filteredGames;
  }

  public saveGame(): void {
    const requestBody: Game = {
      id: this.editExistingGame?.id,
      name: this.newGameForm.value.name,
      link: this.newGameForm.value.link,
      pictureLink: this.newGameForm.value.pictureLink,
      minPlayers: this.newGameForm.value.minPlayers,
      maxPlayers: this.newGameForm.value.maxPlayers,
      hasCoop: this.newGameForm.value.hasCoop ? this.newGameForm.value.hasCoop : false,
      hasVs: this.newGameForm.value.hasVs ? this.newGameForm.value.hasVs : false,
      isFree: this.newGameForm.value.isFree ? this.newGameForm.value.isFree : false,
      genre: this.selectedGenre
    }
    this.saveGameRunning = true;

    if (this.editExistingGame) {
      this.gameEndpoint.updateGame({body: requestBody}).subscribe(next => {
        this.gamesService.updateSingleGameWithoutRefresh(next);
        this.newGameForm.reset(); // not really needed, leaving for consistency
        AppService.showSnackBar('Successfully edited existing game', false, this.snackBar);
        this.saveGameRunning = false;
      }, error => {
        console.log('Error while changing existing game:');
        console.log(error);
        AppService.showSnackBar('Existing game could not be changed', true, this.snackBar);
        this.saveGameRunning = false;
      })
    } else {
      this.gameEndpoint.addGame({body: requestBody}).subscribe(next => {
        this.gamesService.refreshGamesList(true);
        this.newGameForm.reset();
        AppService.showSnackBar('New game successfully added', false, this.snackBar);
        this.saveGameRunning = false;
      }, error => {
        console.log('Error while adding new game:');
        console.log(error);
        AppService.showSnackBar('New Game could not be added', true, this.snackBar);
        this.saveGameRunning = false;
      })
    }
  }

}
