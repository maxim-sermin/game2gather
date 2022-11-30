import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {MatchComponent} from "./components/match/match.component";
import {LoginComponent} from "./components/login/login.component";
import {LoginRouteGuardService} from "./services/security/login-route-guard.service";
import {NotFoundComponent} from "./components/not-found/not-found.component";
import {EditGamesComponent} from "./components/edit-games/edit-games.component";
import {SettingsComponent} from "./components/settings/settings.component";
import {ScoreGamesComponent} from "./components/score-games/score-games.component";
import { GenreComponent } from './components/genre/genre.component';

const routes: Routes = [
  {path: '', pathMatch: 'full', redirectTo: 'match' }, // empty path goes to match
  {path: 'login', component: LoginComponent},
  {path: 'match', component: MatchComponent, canActivate: [ LoginRouteGuardService ]}, // match shows actual component
  {path: 'rate', component: ScoreGamesComponent, canActivate: [ LoginRouteGuardService ]},
  {path: 'edit', component: EditGamesComponent, canActivate: [ LoginRouteGuardService ]},
  {path: 'settings', component: SettingsComponent, canActivate: [ LoginRouteGuardService ]},
  {path: 'genre', component: GenreComponent, canActivate: [ LoginRouteGuardService ]},
  {path: '**', component: NotFoundComponent } // catch everything else with not found
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
