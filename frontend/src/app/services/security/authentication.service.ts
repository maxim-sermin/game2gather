import {EventEmitter, Injectable, Output} from '@angular/core';
import {Router} from "@angular/router";
import {BehaviorSubject, Observable} from "rxjs";
import {tap} from "rxjs/operators";
import {HttpRequest} from "@angular/common/http";
import {UserEndpointService} from "../../api/services/user-endpoint.service";
import {User} from "../../api/models/user";
import {UserSession} from "../../api/models/user-session";
import {MatSnackBar} from "@angular/material/snack-bar";
import {AppService} from "../app.service";

@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {

  public ADMIN_ROLE_NAME = 'ROLE_ADMIN';
  private _authenticated? : boolean = undefined;
  public authenticatedUser: BehaviorSubject<User | undefined> = new BehaviorSubject<User | undefined>(undefined);
  public loginCheckRunning = false;
  @Output() authenticationChangeEvent = new EventEmitter<boolean>();
  public openSession?: UserSession[] = undefined;
  public amountOpenSessions = 0;
  public openSessionsRefreshRunning = false;

  constructor(private router: Router, private usersEndpointService: UserEndpointService, private snackBar: MatSnackBar) { }

  performLogin(username: string, password: string,): Observable<void> {
    return this.usersEndpointService.swaggerLogin({body: {username: username, password: password}}).pipe(tap(next => {
      this.changeAuthenticated(true);
    }, error => {
      console.log('Error while logging in:')
      console.log(error);
    }));
  }

  changeAuthenticated(isAuthenticated: boolean | undefined) {
    this._authenticated = isAuthenticated;
    this.authenticationChangeEvent.emit(isAuthenticated);
    if (isAuthenticated) {
      this.refreshUserInfo();
    } else {
      this.authenticatedUser.next(undefined);
    }
  }

  performLogout(): void {
    this.usersEndpointService.swaggerLogout().subscribe(next => {
      this.changeAuthenticated(false);
      this.router.navigate(['/login']);
    }, error => {
    });
  }

  public refreshUserInfo() {
    this.usersEndpointService.getUserDetails().subscribe(next => {
      this.authenticatedUser.next(next);
      this.refreshOpenSessions();
    });
  }

  public refreshOpenSessions() {
    if (this.isAdmin()) {
      this.openSessionsRefreshRunning = true;
      this.usersEndpointService.getAllSessions().subscribe(next => {
        this.openSessionsRefreshRunning = false;
        this.openSession = next;
        this.amountOpenSessions = 0;
        for (const userSessions of next) {
          if (userSessions.lastUsed) {
            for (const session of userSessions.lastUsed) {
              this.amountOpenSessions++;
            }
          }
        }
      }, error => {
        console.log('Error while refreshing open sessions:');
        console.log(error);
        AppService.showSnackBar('Could not refresh open sessions', true, this.snackBar);
        this.openSessionsRefreshRunning = false;
      })
    }
  }

  applyHeaders(req: HttpRequest<any>): HttpRequest<any> {
    return req.clone({
      withCredentials: true
    });
  }

  get authenticated(): boolean | undefined {
    return this._authenticated;
  }

  public isAdmin(): boolean {
    if (!this.authenticatedUser.value) {
      return false;
    }

    return this.authenticatedUser.value.role === this.ADMIN_ROLE_NAME;
  }
}
