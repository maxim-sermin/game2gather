import { Component, OnInit } from '@angular/core';
import {MatDialogRef} from "@angular/material/dialog";
import {AppService} from "../../services/app.service";

@Component({
  selector: 'app-confirm-dialog',
  templateUrl: './confirm-dialog.component.html',
  styleUrls: ['./confirm-dialog.component.scss']
})
export class ConfirmDialogComponent implements OnInit {

  public dialogTitle = '';
  public dialogMessageFirstLine = '';

  constructor(public dialogRef: MatDialogRef<ConfirmDialogComponent>, public appService: AppService) { }

  ngOnInit() {
  }
}
