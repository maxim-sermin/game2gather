import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {GenreService} from "../../../services/genre.service";
import {GenreEndpointService} from "../../../api/services/genre-endpoint.service";
import {MatSnackBar} from "@angular/material/snack-bar";
import {Genre} from "../../../api/models/genre";
import {AppService} from "../../../services/app.service";

@Component({
  selector: 'app-edit-genre',
  templateUrl: './edit-genre.component.html',
  styleUrls: ['./edit-genre.component.scss']
})
export class EditGenreComponent implements OnInit {

  @Input() existingGenre?: Genre;
  @Output() saveSuccessfullyCompleted = new EventEmitter<void>();

  public saveGenreRunning = false;

  public newGenreForm: FormGroup = new FormGroup({
    name: new FormControl('', Validators.required),
  });

  constructor(public genreService: GenreService, private genreEndpoint: GenreEndpointService, private snackBar: MatSnackBar) {
    this.genreService.refreshGenreList(false);
  }

  ngOnInit(): void {
    if (this.existingGenre) {
      this.newGenreForm.controls['name'].patchValue(this.existingGenre.name);
    }
  }

  public saveGenre(): void {
    const requestBody: Genre = {
      id: this.existingGenre?.id,
      name: this.newGenreForm.value.name
    }
    this.saveGenreRunning = true;

    if (this.existingGenre) {
      this.genreEndpoint.updateGenre({body: requestBody}).subscribe(next => {
        this.genreService.refreshGenreList(true);
        this.newGenreForm.reset();
        AppService.showSnackBar('Genre successfully updated', false, this.snackBar);
        this.saveSuccessfullyCompleted.next();
        this.saveGenreRunning = false;
      }, error => {
        console.log('Error while updating genre:');
        console.log(error);
        AppService.showSnackBar(`Genre '${this.existingGenre?.name}' could not be added`, true, this.snackBar);
        this.saveGenreRunning = false;
      })
    } else {
      this.genreEndpoint.addGenre({body: requestBody}).subscribe(next => {
        this.genreService.refreshGenreList(true);
        this.newGenreForm.reset();
        AppService.showSnackBar('New genre successfully added', false, this.snackBar);
        this.saveSuccessfullyCompleted.next();
        this.saveGenreRunning = false;
      }, error => {
        console.log('Error while adding new genre:');
        console.log(error);
        AppService.showSnackBar('New Genre could not be added', true, this.snackBar);
        this.saveGenreRunning = false;
      })
    }
  }
}
