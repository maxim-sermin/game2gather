import { Injectable } from '@angular/core';
import {GameWithMyScore} from "../scores.service";

@Injectable({
  providedIn: 'root'
})
export class ScoreCacheService {

  public gamesWithMyScores: GameWithMyScore[] = [];
  public gamesNoOwnScoreYet: GameWithMyScore[] = [];
  public currentRateSlicePage = 0;
  public amountScoredFromSlice = 0;
  public confettiPlayedThisSlice = false;
  public currentRateSlice: GameWithMyScore[] = [];
  public firstSliceInitialized = false;

  constructor() { }
}
