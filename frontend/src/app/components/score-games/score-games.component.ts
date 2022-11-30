import {Component, ElementRef, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {GamesService} from "../../services/games.service";
import {GameWithMyScore, ScoresService} from "../../services/scores.service";
import {Subscription} from "rxjs";
import {AppService} from "../../services/app.service";

import * as confetti from 'canvas-confetti';
import {CreateTypes} from "canvas-confetti";
import {ScoreCacheService} from "../../services/caches/score-cache.service";
import {FormControl} from "@angular/forms";

@Component({
  selector: 'app-games',
  templateUrl: './score-games.component.html',
  styleUrls: ['./score-games.component.scss']
})
export class ScoreGamesComponent implements OnInit, OnDestroy {

  public static GAMES_TO_RATE_SLICE = 5;
  @ViewChild('confettiCanvas', {read: ElementRef}) confettiCanvas?: ElementRef<HTMLCanvasElement>;

  constructor(public gamesService: GamesService, public scoresService: ScoresService, public scoreCacheService: ScoreCacheService) { }

  public showAllUnratedControl = new FormControl(false);

  private gamesSub?: Subscription;
  private scoreSub?: Subscription;
  private confettiCreated?: CreateTypes;

  public confettiParticleCountBase = 60;
  public confettiParticleCountBaseMax = 420;
  private confettiParticleCountRange = 20;

  public confettiSpreadBaseMax = 200;
  public confettiSpreadBase = 45;
  private confettiSpreadRange = 5;

  public confettiSpeedBase = 55;
  public confettiSpeedBaseMax = 100;
  private confettiSpeedRange = 20;

  ngOnInit(): void {
    // update formcontrol when localStorage has a value and it is different from the default
    let allUnratedLocal = localStorage.getItem('allUnrated');
    if (allUnratedLocal) {
      let allUnratedParsed = JSON.parse(allUnratedLocal);
      if (allUnratedParsed) {
        this.showAllUnratedControl.setValue(allUnratedParsed);
      }
    }

    if (this.scoreCacheService.gamesNoOwnScoreYet.length < 1 || this.scoreCacheService.gamesWithMyScores.length < 1) {
      this.gamesService.refreshGamesList(false);

      // refresh scores after games are loaded
      this.gamesSub = this.gamesService.allGames.subscribe(next => {
        if (next) { // first BehaviorSubject event is initial value
          this.scoresService.refreshMyScores(true);
        }
      });

      // enrich games in list with own scores (if exist)
      this.scoreSub = this.scoresService.myScores.subscribe(next => {
        if (next) { // first BehaviorSubject event is initial value
          this.buildRateLists();
        }
      })
    }

    this.showAllUnratedControl.valueChanges.subscribe(next => {
      localStorage.setItem('allUnrated', next);
      this.buildRateLists();
    })
  }

  private resetProgress() {
    this.scoreCacheService.amountScoredFromSlice = 0;
    this.scoreCacheService.currentRateSlicePage = 0;
    this.scoreCacheService.confettiPlayedThisSlice = false;
  }

  private buildRateLists() {
    this.scoreCacheService.gamesWithMyScores = [];
    this.scoreCacheService.gamesNoOwnScoreYet = [];

    for (const game of this.gamesService.allGames.value!) {
      let gameWithMyScore = {...game} as GameWithMyScore;

      const myScoreForGame = this.scoresService.getMyScoreForGame(game);
      if (myScoreForGame) {
        gameWithMyScore.myScore = myScoreForGame;
        this.scoreCacheService.gamesWithMyScores.push(gameWithMyScore);
      } else {
        this.scoreCacheService.gamesNoOwnScoreYet.push(gameWithMyScore);
      }
    }

    this.scoreCacheService.gamesWithMyScores.sort((a, b) => (a.myScore!.score! < b.myScore!.score!) ? 1 : -1);
    AppService.shuffleArray(this.scoreCacheService.gamesNoOwnScoreYet);
    this.updateRateSlice();
    this.scoreCacheService.firstSliceInitialized = true;
    this.resetProgress();
  }

  public updateRateSlice() {
    if (this.showAllUnratedControl.value) {
      this.scoreCacheService.currentRateSlice = [...this.scoreCacheService.gamesNoOwnScoreYet]; // replicating the shallow copy that slice would also do
    } else {
      const offset = this.scoreCacheService.currentRateSlicePage * ScoreGamesComponent.GAMES_TO_RATE_SLICE;
      this.scoreCacheService.currentRateSlice = this.scoreCacheService.gamesNoOwnScoreYet.slice(offset, offset + ScoreGamesComponent.GAMES_TO_RATE_SLICE);
    }
  }

  public ratesLeftInSlice() {
    return this.scoreCacheService.amountScoredFromSlice < this.scoreCacheService.currentRateSlice.length;
  }

  public fireConfettiBoth() {
    this.initConfetti();

    if (Math.random() < 0.5) {
      this.fireLeft(this);
      setTimeout((that: any) => {
        this.fireRight(that);
      }, 105, this);
    } else {
      this.fireRight(this);
      setTimeout((that: any) => {
        this.fireLeft(that);
      }, 105, this);
    }
  }

  public fireLeftButton() {
    this.initConfetti();
    this.fireLeft(this);
  }

  public fireRightButton() {
    this.initConfetti();
    this.fireRight(this);
  }

  private fireLeft(that: any) {
    that.confettiCreated({
      origin: {x: 0, y: 1},
      angle: 45,
      particleCount: ScoreGamesComponent.getConfettiPropertyFromBase(this.confettiParticleCountBase, this.confettiParticleCountRange),
      spread: ScoreGamesComponent.getConfettiPropertyFromBase(this.confettiSpreadBase, this.confettiSpreadRange),
      startVelocity: ScoreGamesComponent.getConfettiPropertyFromBase(this.confettiSpeedBase, this.confettiSpeedRange)
    });
  }

  private fireRight(that: any) {
    that.confettiCreated({
      origin: {x: 1, y: 1},
      angle: 135,
      particleCount: ScoreGamesComponent.getConfettiPropertyFromBase(this.confettiParticleCountBase, this.confettiParticleCountRange),
      spread: ScoreGamesComponent.getConfettiPropertyFromBase(this.confettiSpreadBase, this.confettiSpreadRange),
      startVelocity: ScoreGamesComponent.getConfettiPropertyFromBase(this.confettiSpeedBase, this.confettiSpeedRange)
    });
  }

  private initConfetti() {
    if (!this.confettiCreated) {
      this.confettiCreated = confetti.create(this.confettiCanvas?.nativeElement!, {resize: true, useWorker: true});
    }
  }

  private static getConfettiPropertyFromBase(base: number, range: number): number {
    return base + AppService.getRandomInt(-range, range);
  }

  public handleGameSkipped(skippedGame: GameWithMyScore) {
    let skippedIndex = this.scoreCacheService.gamesNoOwnScoreYet.indexOf(skippedGame);
    if (skippedIndex > -1) {
      // move to end of array
      this.scoreCacheService.gamesNoOwnScoreYet.push(this.scoreCacheService.gamesNoOwnScoreYet.splice(skippedIndex, 1)[0]);
      this.updateRateSlice();
    }
  }

  public handleScoredAmountChanged() {
    this.scoreCacheService.amountScoredFromSlice = 0;
    for (const gameWithMyScore of this.scoreCacheService.currentRateSlice) {
      if (gameWithMyScore.myScore?.score !== undefined) {
        this.scoreCacheService.amountScoredFromSlice++;
      }
    }

    if (!this.scoreCacheService.confettiPlayedThisSlice && !this.ratesLeftInSlice()) {
      this.scoreCacheService.confettiPlayedThisSlice = true;
      this.fireConfettiBoth();
    }
  }

  public showNextRatePage() {
    this.scoreCacheService.amountScoredFromSlice = 0;
    this.scoreCacheService.currentRateSlicePage += 1;
    this.scoreCacheService.confettiPlayedThisSlice = false;
    this.updateRateSlice();
  }

  ngOnDestroy() {
    if (this.gamesSub) {
      this.gamesSub.unsubscribe();
    }
    if (this.scoreSub) {
      this.scoreSub.unsubscribe();
    }
  }
}
