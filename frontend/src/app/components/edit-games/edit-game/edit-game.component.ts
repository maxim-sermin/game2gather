import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {GameEndpointService} from "../../../api/services/game-endpoint.service";
import {MatSnackBar} from "@angular/material/snack-bar";
import {GamesService, GameWithEditInfo} from "../../../services/games.service";
import {MatDialog} from "@angular/material/dialog";
import {ConfirmDialogComponent} from "../../confirm-dialog/confirm-dialog.component";
import {AppService} from "../../../services/app.service";

@Component({
  selector: 'app-edit-game',
  templateUrl: './edit-game.component.html',
  styleUrls: ['./edit-game.component.scss']
})
export class EditGameComponent implements OnInit {

  @Output() currentlyEditingChanged = new EventEmitter<boolean>();
  @Input() someGameCurrentlyEditing?: boolean;
  @Input() game?: GameWithEditInfo;
  public currentlyEditing = false;
  public deleteGameRunning = false;

  constructor(private gamesService: GamesService, private gameEndpoint: GameEndpointService, private snackBar: MatSnackBar, private dialog: MatDialog) { }

  ngOnInit(): void {
  }

  public deleteGame(gameIdToDelete: number): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent);

    dialogRef.componentInstance.dialogTitle = "Really delete game?"
    dialogRef.componentInstance.dialogMessageFirstLine = "This action cannot be undone";

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.deleteGameRunning = true;
        this.gameEndpoint.deleteGame({id: gameIdToDelete}).subscribe(next => {
          this.gamesService.refreshGamesList(true);
          AppService.showSnackBar('Game successfully deleted', false, this.snackBar);
          this.deleteGameRunning = false;
        }, error => {
          console.log('Error while deleting game:');
          console.log(error);
          AppService.showSnackBar(error.error, true, this.snackBar);
          this.deleteGameRunning = false;
        })
      }
    });
  }

  public toggleEdit(): void {
    this.currentlyEditing = !this.currentlyEditing;
    this.currentlyEditingChanged.next(this.currentlyEditing);
  }
}
