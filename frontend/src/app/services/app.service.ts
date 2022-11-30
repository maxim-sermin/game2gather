import { Injectable } from '@angular/core';
import {UserEndpointService} from "../api/services/user-endpoint.service";
import {MatSnackBar} from "@angular/material/snack-bar";

@Injectable({
  providedIn: 'root'
})
export class AppService {

  public isDarkTheme = true;
  private PING_BACKEND_MINUTES = 10;

  constructor(private userEndpoint: UserEndpointService) {
    // call backend periodically to prevent heroku from making it sleep
    setInterval(() => {
      this.userEndpoint.checkSession().subscribe(); // results are like totally irrelevant here
    }, this.PING_BACKEND_MINUTES * 60 * 1000)
  }

  public static shuffleArray(array: any[]): void {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const temp = array[i];
      array[i] = array[j];
      array[j] = temp;
    }
  }

  public static getRandomInt(min: number, max: number): number {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min) + min); // The maximum is exclusive and the minimum is inclusive
  }

  public static showSnackBar(message: string, isError: boolean, snackBar: MatSnackBar): void {
    let styleClasses = ['mat-toolbar'];
    let buttonText = 'OK';
    let durationSeconds = 4;

    if (isError) {
      styleClasses.push('mat-warn');
      buttonText = 'Yikes';
      durationSeconds = 10;
    }
    snackBar.open(message, buttonText, {panelClass: styleClasses, duration: durationSeconds * 1000});
  }
}
