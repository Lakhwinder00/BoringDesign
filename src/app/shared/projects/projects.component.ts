import { Component, OnInit,Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
@Component({
  selector: 'app-projects',
  templateUrl: './projects.component.html',
  styleUrls: ['./projects.component.scss']
})
export class ProjectsComponent implements OnInit {

  constructor(@Inject(MAT_DIALOG_DATA)private data: any,private modalRef: MatDialogRef<ProjectsComponent>) { }


  ngOnInit(): void {
  }
  closeDialog()
  {
    this.modalRef.close(true);
  }
}
