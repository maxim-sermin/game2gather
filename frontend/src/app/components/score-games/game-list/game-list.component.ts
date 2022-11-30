import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {GameWithMyScore} from "../../../services/scores.service";

@Component({
  selector: 'app-game-list',
  templateUrl: './game-list.component.html',
  styleUrls: ['./game-list.component.scss']
})
export class GameListComponent implements OnInit {

  @Input() listShowsScored = false;
  @Input() gamesWithMyScores: GameWithMyScore[] = [];
  @Output() amountScoredChanged = new EventEmitter<void>();
  @Output() gameSkipped = new EventEmitter<GameWithMyScore>();

  constructor() { }

  ngOnInit(): void {
  }

}
