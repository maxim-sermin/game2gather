import {Component, OnInit} from '@angular/core';
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {MatSnackBar} from "@angular/material/snack-bar";
import {MatDialog} from "@angular/material/dialog";
import {TrickyConfirmDialogComponent} from "../tricky-confirm-dialog/tricky-confirm-dialog.component";
import {NoopScrollStrategy} from "@angular/cdk/overlay";
import {AuthenticationService} from "../../services/security/authentication.service";
import {UsersService} from "../../services/users.service";
import {UserEndpointService} from "../../api/services/user-endpoint.service";
import {AppService} from "../../services/app.service";

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit {

  constructor(public authenticationService: AuthenticationService, private usersEndpointService: UserEndpointService, private snackBar: MatSnackBar, private dialog: MatDialog, public usersService: UsersService) { }

  newUserNameForm = new FormGroup({
    userName: new FormControl('')
  })

  newPasswordForm = new FormGroup({
    newPassword: new FormControl('',[Validators.required, Validators.minLength(8)]),
  })

  addNewUserForm = new FormGroup({
    userName: new FormControl('',Validators.required),
    password: new FormControl('',[Validators.required, Validators.minLength(8)]),
    makeAdmin: new FormControl(),
  })

  public saveUsernameRunning = false;
  public savePasswordRunning = false;
  public deleteAccountRunning = false;
  public addNewUserRunning = false;

  ngOnInit(): void {
  }

  public handleUsersPanelOpened() {
    this.usersService.refreshUsers(false);
  }

  public changeUsername(): void {
    this.saveUsernameRunning = true;
    this.usersEndpointService.updateUsername({body: this.newUserNameForm.value.userName}).subscribe(next => {
      AppService.showSnackBar('Username was successfully updated', false, this.snackBar);
      this.authenticationService.authenticatedUser.value!.username = this.newUserNameForm.value.userName;
      this.newUserNameForm.controls['userName'].patchValue('');
      this.usersService.refreshUsers(true);
      this.saveUsernameRunning = false;
    }, error => {
      if (error.status == 409) {
        AppService.showSnackBar(`Username '${this.newUserNameForm.value.userName}' is already taken`, true, this.snackBar);
      } else {
        console.log("Error while updating username:");
        console.log(error);
        AppService.showSnackBar('Username could not be updated', true, this.snackBar);
      }
      this.saveUsernameRunning = false;
    })
  }

  public changePassword(): void {
    this.savePasswordRunning = true;
    this.usersEndpointService.updatePassword({body: this.newPasswordForm.value.newPassword}).subscribe(next => {
      AppService.showSnackBar('Password was successfully updated', false, this.snackBar);
      this.newPasswordForm.controls['newPassword'].patchValue('');
      this.savePasswordRunning = false;
    }, error => {
      console.log("Error while updating password:");
      console.log(error);
      AppService.showSnackBar('Password could not be updated', true, this.snackBar);
      this.savePasswordRunning = false;
    })
  }

  public deleteAccount(): void {
    const dialogRef = this.dialog.open(TrickyConfirmDialogComponent, {
      autoFocus: false,
      scrollStrategy: new NoopScrollStrategy() // this is super important now! without it pages with scroll will get squashed!
    });

    dialogRef.componentInstance.dialogMessageFirstLine = 'Really delete account?';
    dialogRef.componentInstance.confirmString = this.authenticationService.authenticatedUser.value?.username;

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.deleteAccountRunning = true;
        this.usersEndpointService.deleteAccount().subscribe(next => {
          this.authenticationService.performLogout();
          this.deleteAccountRunning = false;
        }, error => {
          console.log("Error while deleting account:");
          console.log(error);
          AppService.showSnackBar('Account could not be deleted', true, this.snackBar);
          this.deleteAccountRunning = false;
        })
      }
    });
  }

  public addNewUser(): void {
    this.addNewUserRunning = true;
    this.usersEndpointService.registerUser({body: {username: this.addNewUserForm.value.userName, password: this.addNewUserForm.value.password, role: this.addNewUserForm.value.makeAdmin ? this.authenticationService.ADMIN_ROLE_NAME : ''}}).subscribe(next => {
      AppService.showSnackBar(`User '${this.addNewUserForm.value.userName}' was successfully added`, false, this.snackBar);
      this.addNewUserForm.controls['userName'].patchValue('');
      this.addNewUserForm.controls['password'].patchValue('');
      this.usersService.refreshUsers(true);
      this.addNewUserRunning = false;
    }, error => {
      if (error.status == 409) {
        AppService.showSnackBar(`Username '${this.addNewUserForm.value.userName}' is already taken`, true, this.snackBar);
      } else {
        console.log("Error while adding new user:");
        console.log(error);
        AppService.showSnackBar('New user could not be added', true, this.snackBar);
      }
      this.addNewUserRunning = false;
    })
  }
}
