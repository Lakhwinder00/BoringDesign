import { Component, OnInit,Inject } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DialogConfirmComponent } from '../dialog-confirm/dialog-confirm.component';
import { ProcessAnalysisComponent } from '../process-analysis/process-analysis.component';
import { NewProjectComponent } from './new-project/new-project.component';
@Component({
  selector: 'app-projects',
  templateUrl: './projects.component.html',
  styleUrls: ['./projects.component.scss']
})
export class ProjectsComponent implements OnInit {

  constructor(@Inject(MAT_DIALOG_DATA)private data: any,private modalRef: MatDialogRef<ProjectsComponent>, public dialog: MatDialog) { }


  ngOnInit(): void {
  }
  closeDialog()
  {
    this.modalRef.close(true);
  }
  newProject() {
   // this.modalRef.close();
   let dialogRef= this.dialog.open(NewProjectComponent,{width:'500px',panelClass:'new-project-cls'});
   dialogRef.afterClosed().subscribe(result=>{
    this.modalRef.close(result);
   })
  }
  projectAnalysis()
  {
    this.dialog.open(ProcessAnalysisComponent,{panelClass:'project-analysis-cls'});
  }
  deleteProject()
  {
    this.dialog.open(DialogConfirmComponent,{data: {
      title: 'Delete Project',
      message: "Are you sure you want delete this project? <br> This action cannot be undone.",
      buttonText: 'No',
      buttonYesText:'Yes',
      isShow:true
    },
    width:"400px",
    panelClass:'dialog'})
  }
}
