import { Component, OnInit, Inject } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { AnalysisResultComponent } from '../analysis-result/analysis-result.component';
import { DialogConfirmComponent } from '../dialog-confirm/dialog-confirm.component';

@Component({
  selector: 'app-process-analysis',
  templateUrl: './process-analysis.component.html',
  styleUrls: ['./process-analysis.component.scss'],
})
export class ProcessAnalysisComponent implements OnInit {
  constructor(
    @Inject(MAT_DIALOG_DATA) private data: any,
    private modalRef: MatDialogRef<ProcessAnalysisComponent>,
    public dialog: MatDialog,
  ) {}

  ngOnInit(): void {}
  closeDialog() {
    this.modalRef.close();
  }
  deleteProject()
  {
    this.dialog.open(DialogConfirmComponent,{data: {
      title: 'Delete Project Analysis',
      message: "Are you sure you want delete this project Analysis? <br> This action cannot be undone.",
      buttonText: 'No',
      buttonYesText:'Yes',
      isShow:true
    },
    width:"400px",
    panelClass:'dialog'})
  }
  analysesScore()
  {
    this.dialog.open(AnalysisResultComponent,{panelClass:'project-analysis-cls'})
  }

}
