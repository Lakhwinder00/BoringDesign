import { Component, OnInit,Inject } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-analysis-result',
  templateUrl: './analysis-result.component.html',
  styleUrls: ['./analysis-result.component.scss']
})
export class AnalysisResultComponent implements OnInit {

  constructor(@Inject(MAT_DIALOG_DATA) private data: any,
  private modalRef: MatDialogRef<AnalysisResultComponent>, public dialog: MatDialog) { }

  ngOnInit(): void {
  }
  closeDialog(){
  this.modalRef.close();
  }
}
