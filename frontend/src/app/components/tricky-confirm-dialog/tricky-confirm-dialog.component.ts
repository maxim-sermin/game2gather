import { Component, OnInit } from '@angular/core';
import {MatDialogRef} from "@angular/material/dialog";
import {FormControl} from "@angular/forms";
import {AppService} from "../../services/app.service";

@Component({
  selector: 'app-tricky-confirm-dialog',
  templateUrl: './tricky-confirm-dialog.component.html',
  styleUrls: ['./tricky-confirm-dialog.component.scss']
})
export class TrickyConfirmDialogComponent implements OnInit {

  public dialogTitle?: string;
  public dialogMessageFirstLine?: string;
  public confirmString?: string;
  public confirmInput = new FormControl('');

  constructor(public dialogRef: MatDialogRef<TrickyConfirmDialogComponent>, public appService: AppService) { }


  ngOnInit() {
  }

}
