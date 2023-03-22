import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-process-analysis',
  templateUrl: './process-analysis.component.html',
  styleUrls: ['./process-analysis.component.scss'],
})
export class ProcessAnalysisComponent implements OnInit {
  constructor(
    @Inject(MAT_DIALOG_DATA) private data: any,
    private modalRef: MatDialogRef<ProcessAnalysisComponent>
  ) {}

  ngOnInit(): void {}
  closeDialog() {
    this.modalRef.close();
  }
}
