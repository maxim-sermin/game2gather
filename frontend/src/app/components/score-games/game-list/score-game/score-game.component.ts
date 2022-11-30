import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {GameWithMyScore, ScoresService} from "../../../../services/scores.service";
import {ScoreEndpointService} from "../../../../api/services/score-endpoint.service";
import {MatSnackBar} from "@angular/material/snack-bar";
import {AppService} from "../../../../services/app.service";

@Component({
  selector: 'app-score-game',
  templateUrl: './score-game.component.html',
  styleUrls: ['./score-game.component.scss']
})
export class ScoreGameComponent implements OnInit {

  public chosenScore = -1;
  public haveThisGame = false;
  public removeScoreRunning = false;

  public _scoreThisGame?: GameWithMyScore;
  @Input() set scoreThisGame(value: GameWithMyScore) {
    this._scoreThisGame = value;
    if (this._scoreThisGame.myScore) {
      this.chosenScore = this.scoresService.scaleScore(this._scoreThisGame.myScore.score!);
      this.haveThisGame = this._scoreThisGame.myScore.ownGame!;
    }
    this.updateGotGame();
  }

  private updateGotGame() {
    if (this._scoreThisGame?.isFree) {
      this.haveThisGame = true;
    }
  }

  @Input() isFirst = false;
  @Input() isInScoredList = false;
  @Output() amountScoredChanged = new EventEmitter<void>();
  @Output() gameSkipped = new EventEmitter<GameWithMyScore>();

  constructor(public scoresService: ScoresService, private scoreEndpoint: ScoreEndpointService, private snackBar: MatSnackBar, public appService: AppService) { }

  ngOnInit(): void {
  }

  public updateScore(): void {
    if (this.chosenScore !== this.scoresService.scaleScore(this._scoreThisGame?.myScore?.score!) || this.haveThisGame !== this._scoreThisGame?.myScore?.ownGame) {
      // not tracking updateScoreRunning because the controls immediately reflect the new state anyway

      // set score to middle value when request was submitted by checking own-box
      if (this.chosenScore < 0) {
        this.chosenScore = 2;
      }

      this.scoreEndpoint.changeScore({
        body: {
          id: this._scoreThisGame?.myScore?.id,
          scoredGame: this._scoreThisGame,
          score: this.scoresService.normalizeScore(this.chosenScore),
          ownGame: this.haveThisGame
        }
      }).subscribe(next => {
        // if this was a new score, this gives us back the id - that way, the score can be changed again immediately without refreshing
        this._scoreThisGame!.myScore = next;
        this.chosenScore = this.scoresService.scaleScore(next.score!);
        this.haveThisGame = next.ownGame!;
        this.updateGotGame(); // not strictly necessary because there's no way in the UI to do this - leaving for consistency
        this.amountScoredChanged.next();
        this.scoresService.addOrUpdateScoreWithoutUpdate(next);
      }, error => {
        console.log('Error while adding new score:');
        console.log(error);
        AppService.showSnackBar('Game score could not be added', true, this.snackBar);
      })
    }
  }

  public removeScore(): void {
    if (this._scoreThisGame?.myScore) {
      this.removeScoreRunning = true;
      this.scoreEndpoint.deleteScore({id: this._scoreThisGame.myScore.id!}).subscribe(next => {
        this.scoresService.removeScoreWithoutUpdate(this._scoreThisGame?.myScore!);
        this._scoreThisGame!.myScore = undefined;
        this.chosenScore = -1;
        this.haveThisGame = false;
        this.updateGotGame();
        AppService.showSnackBar('Successfully removed score', false, this.snackBar);
        this.removeScoreRunning = false;
        this.amountScoredChanged.next();
      }, error => {
        console.log('Error while deleting existing score:');
        console.log(error);
        AppService.showSnackBar('Score could not be removed', true, this.snackBar);
        this.removeScoreRunning = false;
      })
    }
  }

}
