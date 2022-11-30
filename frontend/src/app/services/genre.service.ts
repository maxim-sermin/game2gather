import { Injectable } from '@angular/core';
import {BehaviorSubject} from "rxjs";
import {Genre} from "../api/models/genre";
import {GenreEndpointService} from "../api/services/genre-endpoint.service";
import {AppService} from "./app.service";
import {MatSnackBar} from "@angular/material/snack-bar";
import {AbstractControl} from "@angular/forms";

@Injectable({
  providedIn: 'root'
})
export class GenreService {

  public allGenres: BehaviorSubject<Genre[] | undefined> = new BehaviorSubject<Genre[] | undefined>(undefined);
  public refreshRunning = false;

  constructor(private genreEndpoint: GenreEndpointService, private snackBar: MatSnackBar) { }

  public refreshGenreList(hard: boolean) {
    if (hard || !this.allGenres.value) {
      this.genreEndpoint.getAllGenre().subscribe(next => {
        this.allGenres.next(next);
      }, error => {
        console.log('Error while loading genres:');
        console.log(error);
        AppService.showSnackBar('Something went wrong while loading genres', true, this.snackBar);
      })
    }
  }

  public getGenreForId(id?: number): Genre | undefined {
    if (!id) {
      return undefined;
    }

    for (const genre of this.allGenres?.value!) {
      if (genre.id === id) {
        return genre;
      }
    }
    return undefined;
  }

  public toggleAllGenres(allGenresSelected: boolean, genreForm: AbstractControl) {
    if (allGenresSelected) {
      genreForm.patchValue([...this.allGenres.value!]);
    } else {
      genreForm.patchValue([]);
    }
  }

  public getAllGenresSelected(genreForm: AbstractControl): boolean {
    return genreForm.value.length === this.allGenres.value?.length;
  }

  public someGenresSelected(allGenresSelected: boolean, genreForm: AbstractControl): boolean {
    return genreForm.value.length > 0 && !allGenresSelected;
  }
}
