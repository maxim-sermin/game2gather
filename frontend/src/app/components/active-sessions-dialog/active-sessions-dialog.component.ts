import { Component, OnInit } from '@angular/core';
import {MatDialogRef} from "@angular/material/dialog";
import {UserEndpointService} from "../../api/services/user-endpoint.service";
import {AuthenticationService} from "../../services/security/authentication.service";
import {MatSnackBar} from "@angular/material/snack-bar";
import {AppService} from "../../services/app.service";

@Component({
  selector: 'app-active-sessions-dialog',
  templateUrl: './active-sessions-dialog.component.html',
  styleUrls: ['./active-sessions-dialog.component.scss']
})
export class ActiveSessionsDialogComponent implements OnInit {

  public deleteRunning = false;

  constructor(public authenticationService: AuthenticationService, public dialogRef: MatDialogRef<ActiveSessionsDialogComponent>, private userEndpointService: UserEndpointService, private snackBar: MatSnackBar) { }

  ngOnInit(): void {
  }

  public deleteAllSessions(): void {
    if (this.authenticationService.isAdmin()) {
      this.deleteRunning = true;
      this.userEndpointService.deleteAllSessions().subscribe(next => {
        this.deleteRunning = false;
        this.authenticationService.performLogout();
        this.dialogRef.close(false);
      }, error => {
        console.log('Error while deleting sessions:');
        console.log(error);
        AppService.showSnackBar('Could not delete sessions', true, this.snackBar);
        this.deleteRunning = false;
      })
    }
  }
}
