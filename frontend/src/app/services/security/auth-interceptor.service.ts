import { Injectable } from '@angular/core';
import {HttpEvent, HttpHandler, HttpInterceptor, HttpRequest} from "@angular/common/http";
import {AuthenticationService} from "./authentication.service";
import {Router} from "@angular/router";
import {MatDialog} from "@angular/material/dialog";
import {Observable} from "rxjs";
import {tap} from "rxjs/operators";
import {LoginDialogComponent} from "../../components/login/login-dialog/login-dialog.component";

@Injectable({
  providedIn: 'root'
})
export class AuthInterceptorService implements HttpInterceptor {

  constructor(private authenticationService: AuthenticationService, private router: Router, private dialog: MatDialog) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const withHeaders = this.authenticationService.applyHeaders(req);
    return next.handle(withHeaders).pipe(
      tap(x => x, err => {
        console.log(`Error performing request, status code = ${err.status}`);
        if (err.status === 0) {
          console.log("This indicates a failed CORS pre-flight check. Since CORS is enabled on server-side, this most probably means that the server did not respond at all")
        } else if (err.status === 401) {
          console.log("User not authenticated");
          this.authenticationService.changeAuthenticated(false);

          if (!err.url.includes('/checkSession') && !this.router.url.includes('login') && this.dialog.openDialogs.length < 1) {
            console.log("The failed request was not just for probing if the session is still valid, going to open login dialog");
            this.dialog.open(LoginDialogComponent, {
              width: '800px',
              maxHeight: '100vh',
              position: {
                top: '5vh',
              },
              panelClass: 'global-dialog-class'
            });
          }
        }
      })
    );
  }
}
