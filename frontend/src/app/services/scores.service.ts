import { Injectable } from '@angular/core';
import {Score} from "../api/models/score";
import {ScoreEndpointService} from "../api/services/score-endpoint.service";
import {MatSnackBar} from "@angular/material/snack-bar";
import {Game} from "../api/models/game";
import {BehaviorSubject} from "rxjs";
import {AppService} from "./app.service";

@Injectable({
  providedIn: 'root'
})
export class ScoresService {

  public scoreScaleInfo : ScoreInfo[] = [{emoji: "🚫", text: "No way!"}, {emoji: "🥱", text: "Rather not"}, {emoji: "🤔", text: "Maybe"}, {emoji: "😊", text: "Sure"}, {emoji: "😍", text: "Love this game!"}]
  public myScores: BehaviorSubject<Score[] | undefined> = new BehaviorSubject<Score[] | undefined>(undefined);
  public refreshRunning = false;

  constructor(private scoreEndpoint: ScoreEndpointService, private snackBar: MatSnackBar) { }

  public refreshMyScores(hard: boolean) {
    if (hard || !this.myScores.value) {
      this.refreshRunning = true;
      this.scoreEndpoint.getMyScores().subscribe(next => {
        this.myScores.next(next);
        this.refreshRunning = false;
      }, error => {
        console.log('Error while getting own scores:');
        console.log(error);
        AppService.showSnackBar('Own game scores could not be loaded', true, this.snackBar);
        this.refreshRunning = false;
      })
    }
  }

  public getMyScoreForGame(checkThisGame: Game): Score | undefined {
    for (const myScore of this.myScores.value!) {
      if (myScore.scoredGame?.id === checkThisGame.id) {
        return myScore;
      }
    }

    return undefined;
  }

  public normalizeScore(scaledScore: number): number {
    if (scaledScore < 0) { // safety measure when uninitialized score gets passed in
      return 0;
    }

    return scaledScore / (this.scoreScaleInfo.length - 1);
  }

  public scaleScore(normalizedScore: number): number {
    return Math.round(normalizedScore * (this.scoreScaleInfo.length - 1));
  }

  public removeScoreWithoutUpdate(removeThis: Score): void {
    const index = this.myScores.value?.indexOf(removeThis);
    if (index && index > -1) {
      this.myScores.value?.splice(index, 1);
    }
  }

  public addOrUpdateScoreWithoutUpdate(changedScore: Score) {
    for (const score of this.myScores.value!) {
      if (score.id === changedScore.id) {
        score.score = changedScore.score;
        score.ownGame = changedScore.ownGame;
        score.lastModifiedAt = changedScore.lastModifiedAt;
        return;
      }
    }

    this.myScores.value?.push(changedScore);
  }
}

type ScoreInfo = {
  emoji: string,
  text: string
}

export interface GameWithMyScore extends Game {
  myScore?: Score
}
