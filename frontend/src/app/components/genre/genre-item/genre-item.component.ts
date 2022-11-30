import {Component, Input, OnInit} from '@angular/core';
import {Genre} from "../../../api/models/genre";
import {ConfirmDialogComponent} from "../../confirm-dialog/confirm-dialog.component";
import {AppService} from "../../../services/app.service";
import {MatDialog} from "@angular/material/dialog";
import {MatSnackBar} from "@angular/material/snack-bar";
import {GenreService} from "../../../services/genre.service";
import {GenreEndpointService} from "../../../api/services/genre-endpoint.service";
import {AuthenticationService} from "../../../services/security/authentication.service";

@Component({
  selector: 'app-genre-item',
  templateUrl: './genre-item.component.html',
  styleUrls: ['./genre-item.component.scss']
})
export class GenreItemComponent implements OnInit {

  @Input() genre?: Genre;
  public deleteGenreRunning = false;
  public currentlyEditing = false;

  constructor(public genreService: GenreService, private genreEndpoint: GenreEndpointService, private dialog: MatDialog, private snackBar: MatSnackBar, public authenticationService: AuthenticationService) { }

  ngOnInit(): void {
  }

  public deleteGenre(): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent);

    dialogRef.componentInstance.dialogTitle = "Really delete genre?"
    dialogRef.componentInstance.dialogMessageFirstLine = "This action cannot be undone";

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.deleteGenreRunning = true;
        this.genreEndpoint.deleteGenre({id: this.genre?.id!}).subscribe(next => {
          this.deleteGenreRunning = false;
          this.genreService.refreshGenreList(true);
          AppService.showSnackBar(`Genre '${this.genre?.name}' successfully deleted`, false, this.snackBar);
        }, error => {
          console.log('Error while delete genre:');
          console.log(error);
          AppService.showSnackBar('Genre could not be deleted', true, this.snackBar);
          this.deleteGenreRunning = false;
        })
      }
    });
  }

  public toggleEdit(): void {
    this.currentlyEditing = !this.currentlyEditing;
  }
}
