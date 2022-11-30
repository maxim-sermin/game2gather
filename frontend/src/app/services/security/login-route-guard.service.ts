import { Injectable } from '@angular/core';
import {ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot} from "@angular/router";
import {AuthenticationService} from "./authentication.service";
import {UserEndpointService} from "../../api/services/user-endpoint.service";

@Injectable({
  providedIn: 'root'
})
export class LoginRouteGuardService implements CanActivate {

  constructor(private router: Router, private authenticationService: AuthenticationService, private usersEndpointService: UserEndpointService) {
  }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    if (!this.authenticationService.authenticated) {
      let wantedUrl = state.url;
      console.log(`Attempted to access route '${wantedUrl}' which requires authentication with unknown session state - going to check on server`);

      this.authenticationService.loginCheckRunning = true;
      this.usersEndpointService.checkSession().subscribe(next => {
        console.log('Session turned out be valid, proceeding to desired route');
        this.authenticationService.changeAuthenticated(true);
        this.router.navigate([wantedUrl]);
        this.authenticationService.loginCheckRunning = false;
        return true;
      }, error => {
        this.authenticationService.loginCheckRunning = false;
        // at this point the authenticated variable was already set
        this.handleAuthenticatedState();
      });

      return false;
    }

    return this.handleAuthenticatedState();
  }

  private handleAuthenticatedState() {
    if (!this.authenticationService.authenticated) {
      console.log('Redirecting to login');
      this.router.navigate(['/login']);
      return false;
    } else {
      return true;
    }
  }
}
