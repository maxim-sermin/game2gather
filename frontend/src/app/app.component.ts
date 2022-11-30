import {Component, ElementRef, HostBinding, OnInit, ViewChild} from '@angular/core';
import {FormControl} from "@angular/forms";
import {OverlayContainer} from "@angular/cdk/overlay";
import {AuthenticationService} from "./services/security/authentication.service";
import {ActiveSessionsDialogComponent} from "./components/active-sessions-dialog/active-sessions-dialog.component";
import {MatDialog} from "@angular/material/dialog";
import {AppService} from "./services/app.service";
import {IntroJs} from "intro.js";
import {ScoreEndpointService} from "./api/services/score-endpoint.service";
import {ScoreGamesComponent} from "./components/score-games/score-games.component";

declare const introJs: any;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  public darkModeToggle = new FormControl(true);
  @HostBinding('class') className = '';
  public amountUnratedGames = 0;

  @ViewChild('userContainer', {read: ElementRef}) userContainer?: ElementRef<HTMLElement>;

  private actionsContainer?: ElementRef<HTMLElement>;
  @ViewChild('actionsContainer', {read: ElementRef}) set onUserAuthLoaded(actionsContainer: ElementRef<HTMLElement>) {
    this.actionsContainer = actionsContainer;
    if (this.actionsContainer && this.userContainer) {
      if (!localStorage.getItem("intro_shown")) {
        localStorage.setItem("intro_shown", "yeah");
        this.showIntro();
      }
    }
  }

  public showIntro(): void {
    const intro: IntroJs = introJs();
    intro.setOptions({
      steps: [
        {
          element: this.actionsContainer?.nativeElement.children[1],
          intro: "<b>Start here</b> by rating games",
          position: 'right'
        },
        {
          element: this.actionsContainer?.nativeElement.children[0],
          intro: "Add friends and <b>find</b> games to play",
          position: 'right'
        },
        {
          element: this.actionsContainer?.nativeElement.children[2],
          intro: "Edit and <b>add</b> new games",
          position: 'right'
        },
        {
          element: this.userContainer?.nativeElement,
          intro: "Change your <b>user settings</b> and create accounts",
          position: 'left'
        }
      ],
      showProgress: true, showBullets: false, exitOnOverlayClick: false, tooltipClass: 'intro-no-vertical-padding'
    }).start();

  }

  constructor(private overlay: OverlayContainer, public authenticationService: AuthenticationService, private dialog: MatDialog, private appService: AppService, private scoreEndpoint: ScoreEndpointService) { }

  ngOnInit(): void {
    let darkModeLocal = localStorage.getItem('darkMode');
    if (darkModeLocal) {
      let darkModeParsed = JSON.parse(darkModeLocal);
      if (!darkModeParsed) {
        this.darkModeToggle.setValue(darkModeParsed);
        this.changeDarkMode(darkModeParsed);
      }
    }
    this.darkModeToggle.valueChanges.subscribe((darkMode) => {
      this.changeDarkMode(darkMode);
      localStorage.setItem('darkMode', darkMode);
    });
    this.authenticationService.authenticatedUser.subscribe(next => {
      if (next) {
        this.scoreEndpoint.getMyAmountUnrated().subscribe(next => {
          this.amountUnratedGames = next;
        }, error => {
          console.log("Error while getting amount unrated games for badge:");
          console.log(error);
        })
      }
    })
  }

  private changeDarkMode(darkMode: boolean) {
    this.appService.isDarkTheme = darkMode;
    const lightClassName = 'lightMode';
    this.className = darkMode ? '' : lightClassName;
    if (darkMode) {
      this.overlay.getContainerElement().classList.remove(lightClassName);
    } else {
      this.overlay.getContainerElement().classList.add(lightClassName);
    }
  }

  public openActiveSessionsDialog() {
    this.dialog.open(ActiveSessionsDialogComponent);
  }

  public getAbbreviatedAmountUnratedGames(): string {
    if (this.amountUnratedGames > ScoreGamesComponent.GAMES_TO_RATE_SLICE) {
      return ScoreGamesComponent.GAMES_TO_RATE_SLICE + '+';
    } else {
      return this.amountUnratedGames.toString();
    }
  }

  public showServerLoading(): boolean {
    return this.authenticationService.authenticatedUser.value === undefined && this.authenticationService.loginCheckRunning;
  }
}
