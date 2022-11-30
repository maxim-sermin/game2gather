import {forwardRef, NgModule, APP_INITIALIZER} from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import {MatToolbarModule} from "@angular/material/toolbar";
import { MatchComponent } from './components/match/match.component';
import {MatButtonModule} from "@angular/material/button";
import {MatIconModule} from "@angular/material/icon";
import {MatSlideToggleModule} from "@angular/material/slide-toggle";
import {ReactiveFormsModule} from "@angular/forms";
import {ConfirmDialogComponent} from "./components/confirm-dialog/confirm-dialog.component";
import {MatDialogModule} from "@angular/material/dialog";
import {LoginDialogComponent} from "./components/login/login-dialog/login-dialog.component";
import {LoginRouteGuardService} from "./services/security/login-route-guard.service";
import {AuthInterceptorService} from "./services/security/auth-interceptor.service";
import {HTTP_INTERCEPTORS, HttpClientModule} from "@angular/common/http";
import {NotFoundComponent} from "./components/not-found/not-found.component";
import {LoginComponent} from "./components/login/login.component";
import {MatCardModule} from "@angular/material/card";
import {MatInputModule} from "@angular/material/input";
import {MatDividerModule} from "@angular/material/divider";
import {MatMenuModule} from "@angular/material/menu";
import { ScoreGamesComponent } from './components/score-games/score-games.component';
import { AddGameComponent } from './components/edit-games/add-game/add-game.component';
import {MAT_SNACK_BAR_DEFAULT_OPTIONS, MatSnackBarModule} from "@angular/material/snack-bar";
import { ScoreGameComponent } from './components/score-games/game-list/score-game/score-game.component';
import {MatSliderModule} from "@angular/material/slider";
import {MatChipsModule} from "@angular/material/chips";
import {MatCheckboxModule} from "@angular/material/checkbox";
import {MAT_TOOLTIP_DEFAULT_OPTIONS, MatTooltipDefaultOptions, MatTooltipModule} from "@angular/material/tooltip";
import {DateAgoPipe} from "./services/date-ago.pipe";
import { GameInfoComponent } from './components/score-games/game-list/game-info/game-info.component';
import { GameListComponent } from './components/score-games/game-list/game-list.component';
import { EditGamesComponent } from './components/edit-games/edit-games.component';
import { EditGameComponent } from './components/edit-games/edit-game/edit-game.component';
import { EmptyListPlaceholderComponent } from './components/empty-list-placeholder/empty-list-placeholder.component';
import {ActiveSessionsDialogComponent} from "./components/active-sessions-dialog/active-sessions-dialog.component";
import {MatExpansionModule} from "@angular/material/expansion";
import {SettingsComponent} from "./components/settings/settings.component";
import {TrickyConfirmDialogComponent} from "./components/tricky-confirm-dialog/tricky-confirm-dialog.component";
import {BlockPasteDirective} from "./components/tricky-confirm-dialog/block-paste-directive";
import {TogglePasswordComponent} from "./components/toggle-password/toggle-password.component";
import {MatRippleModule} from "@angular/material/core";
import {BackButtonComponent} from "./components/back-button/back-button.component";
import {JDENTICON_CONFIG, NgxJdenticonModule} from "ngx-jdenticon";
import {SettingsHttpService} from "./services/environment-specific/settingsHttp.service";
import {MatProgressBarModule} from "@angular/material/progress-bar";
import { GamePictureComponent } from './components/game-picture/game-picture.component';
import {MatAutocompleteModule} from "@angular/material/autocomplete";
import {MatSelectModule} from "@angular/material/select";
import { ExistingUserComponent } from './components/settings/existing-user/existing-user.component';
import {MatBadgeModule} from "@angular/material/badge";
import { GenreComponent } from './components/genre/genre.component';
import { GenreItemComponent } from './components/genre/genre-item/genre-item.component';
import { EditGenreComponent } from './components/genre/edit-genre/edit-genre.component';

export const customTooltipDefaults: MatTooltipDefaultOptions = {
  showDelay: 350,
  hideDelay: 0,
  touchendHideDelay: 0
};

export function app_Init(settingsHttpService: SettingsHttpService) {
  return () => settingsHttpService.initializeApp();
}

@NgModule({
  declarations: [
    AppComponent,
    MatchComponent,
    ConfirmDialogComponent,
    LoginDialogComponent,
    NotFoundComponent,
    LoginComponent,
    ScoreGamesComponent,
    AddGameComponent,
    ScoreGameComponent,
    DateAgoPipe,
    GameInfoComponent,
    GameListComponent,
    EditGamesComponent,
    EditGameComponent,
    EmptyListPlaceholderComponent,
    ActiveSessionsDialogComponent,
    SettingsComponent,
    TrickyConfirmDialogComponent,
    BlockPasteDirective,
    TogglePasswordComponent,
    BackButtonComponent,
    GamePictureComponent,
    ExistingUserComponent,
    GenreComponent,
    GenreItemComponent,
    EditGenreComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatSlideToggleModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatCardModule,
    MatInputModule,
    MatDividerModule,
    HttpClientModule,
    MatMenuModule,
    MatSnackBarModule,
    MatSliderModule,
    MatChipsModule,
    MatCheckboxModule,
    MatTooltipModule,
    MatExpansionModule,
    MatRippleModule,
    NgxJdenticonModule,
    MatProgressBarModule,
    MatAutocompleteModule,
    MatSelectModule,
    MatBadgeModule
  ],
  providers: [
    LoginRouteGuardService,
    AuthInterceptorService,
    {
      provide: HTTP_INTERCEPTORS,
      useExisting: forwardRef(() => AuthInterceptorService),
      multi: true
    },
    {provide: MAT_SNACK_BAR_DEFAULT_OPTIONS, useValue: {duration: 5000}},
    {provide: MAT_TOOLTIP_DEFAULT_OPTIONS, useValue: customTooltipDefaults},
    {
      provide: JDENTICON_CONFIG,
      useValue: {
        backColor: '#0000',
      },
    },
    { provide: APP_INITIALIZER, useFactory: app_Init, deps: [SettingsHttpService], multi: true }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
