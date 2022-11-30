import {Component, Input, OnInit} from '@angular/core';
import {User} from "../../../api/models/user";
import {AuthenticationService} from "../../../services/security/authentication.service";
import {FormControl, Validators} from "@angular/forms";
import {UserEndpointService} from "../../../api/services/user-endpoint.service";
import {MatSnackBar} from "@angular/material/snack-bar";
import {UsersService} from "../../../services/users.service";
import {MatDialog} from "@angular/material/dialog";
import {TrickyConfirmDialogComponent} from "../../tricky-confirm-dialog/tricky-confirm-dialog.component";
import {AppService} from "../../../services/app.service";

@Component({
  selector: 'app-existing-user',
  templateUrl: './existing-user.component.html',
  styleUrls: ['./existing-user.component.scss']
})
export class ExistingUserComponent implements OnInit {

  @Input() user?: User;
  public currentlyEditing = false;
  public updatePasswordRunning = false;
  public deleteUserRunning = false;
  public newPassword = new FormControl('', [Validators.required, Validators.minLength(8)]);

  constructor(public authenticationService: AuthenticationService, private userEndpoint: UserEndpointService, private snackBar: MatSnackBar, private dialog: MatDialog, private usersService: UsersService) { }

  ngOnInit(): void {
  }

  public toggleEdit(): void {
    this.currentlyEditing = !this.currentlyEditing;
  }

  public updatePassword(): void {
    this.updatePasswordRunning = true;
    this.userEndpoint.updateOtherPassword({id: this.user?.id!, body: this.newPassword.value}).subscribe(next => {
      this.currentlyEditing = false;
      this.updatePasswordRunning = false;
      this.newPassword.patchValue('');
      AppService.showSnackBar(`Password of user '${this.user?.username}' was successfully updated`, false, this.snackBar);
    }, error => {
      console.log('Error while updating password of user:');
      console.log(error);
      AppService.showSnackBar(`Something went wrong while updating password of user '${this.user?.username}`, true, this.snackBar);
      this.updatePasswordRunning = false;
    })
  }

  public deleteUser(): void {
    const dialogRef = this.dialog.open(TrickyConfirmDialogComponent);

    dialogRef.componentInstance.dialogMessageFirstLine = 'Really delete account?';
    dialogRef.componentInstance.confirmString = this.user?.username;

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.deleteUserRunning = true;
        this.userEndpoint.deleteOtherAccount({id: this.user?.id!}).subscribe(next => {
          this.currentlyEditing = false;
          this.deleteUserRunning = false;
          this.usersService.refreshUsers(true);
          AppService.showSnackBar(`User '${this.user?.username}' was successfully deleted`, false, this.snackBar);
        }, error => {
          console.log('Error while deleting user:');
          console.log(error);
          AppService.showSnackBar(`Something went wrong while deleting user '${this.user?.username}'`, true, this.snackBar);
          this.deleteUserRunning = false;
        })
      }
    });
  }
}
