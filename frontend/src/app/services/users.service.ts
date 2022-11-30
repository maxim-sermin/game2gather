import { Injectable } from '@angular/core';
import {UserEndpointService} from "../api/services/user-endpoint.service";
import {BehaviorSubject} from "rxjs";
import {User} from "../api/models/user";
import {MatSnackBar} from "@angular/material/snack-bar";
import {AppService} from "./app.service";

@Injectable({
  providedIn: 'root'
})
export class UsersService {

  public users: BehaviorSubject<User[] | undefined> = new BehaviorSubject<User[] | undefined>(undefined);
  public userRefreshRunning = false;

  constructor(private usersEndpointService: UserEndpointService, private snackBar: MatSnackBar) { }

  public refreshUsers(hard: boolean) {
    if (hard || !this.users.value) {
      this.userRefreshRunning = true;
      this.usersEndpointService.getAllUsers().subscribe(next => {
        this.users.next(next);
        this.userRefreshRunning = false;
      }, error => {
        console.log('Error while loading users:');
        console.log(error);
        AppService.showSnackBar('Users could not be loaded', true, this.snackBar);
        this.userRefreshRunning = false;
      })
    }
  }
}
