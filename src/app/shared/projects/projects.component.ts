import { Component, OnInit, Inject, ViewChild, ElementRef } from '@angular/core';
import {
  MatDialog,
  MatDialogRef,
  MAT_DIALOG_DATA,
} from '@angular/material/dialog';
import { DialogConfirmComponent } from '../dialog-confirm/dialog-confirm.component';
import { ProcessAnalysisComponent } from '../process-analysis/process-analysis.component';
import { NewProjectComponent } from './new-project/new-project.component';
import { ProjectService } from 'src/app/services/project.service';
import { AuthService } from 'src/app/services/auth.service';
@Component({
  selector: 'app-projects',
  templateUrl: './projects.component.html',
  styleUrls: ['./projects.component.scss'],
})
export class ProjectsComponent implements OnInit {
  public ProjectList: any = [];
  public projectId: any;
  public isDisplay: boolean = false;
  public isUpload: boolean = false;
  public count: any;
  public pageSize: number | any;
  public pageIndex: number | any;
  public pageDifference: number | any;
  public pageEndRange: number | any;
  public pageStartRange = 1;
  public skip: number = 0;
  public fileReset: any;
  public changeDefaultPage: any | undefined;
  public changeStartPage: any | undefined;
  public projectName: any;
  @ViewChild('apploading',{static:true}) apploading: ElementRef | any;
  constructor(
    @Inject(MAT_DIALOG_DATA) private data: any,
    private modalRef: MatDialogRef<ProjectsComponent>,
    public dialog: MatDialog,
    private projectService: ProjectService,
    private authService: AuthService
  ) {
    this.count = 0;
    this.customPageSetting();
  }

  ngOnInit(): void {
    this.ProjectList=[];
    let parameters = {
      skip: this.skip,
      take: this.pageSize,
    };
    this.getProjectList(parameters);
  }
  closeDialog() {
    this.modalRef.close(this.projectName);
  }
  newProject() {
    // this.modalRef.close();
    let dialogRef = this.dialog.open(NewProjectComponent, {
      width: '500px',
      panelClass: 'new-project-cls',
    });
    dialogRef.afterClosed().subscribe((result) => {
      // this.modalRef.close(result);
    });
  }
  updateProject(item: any) {
    let UpdateProjectDialog = this.dialog.open(NewProjectComponent, {
      data: item.projectName,
      width: '500px',
      panelClass: 'new-project-cls',
    });
    UpdateProjectDialog.afterClosed().subscribe((result) => {});
    this.projectId = item.id;
  }
  // call this function load the project
  projectAnalysis(item: any) {
    let projectAnalysisDialog = this.dialog.open(ProcessAnalysisComponent, {
      data: { projectId: item.id, projectName: item.projectName },
      panelClass: 'process-cls',
    });
    projectAnalysisDialog.afterClosed().subscribe((result) => {
      if (result != undefined && result != '') {
        this.projectName = result;
        let parameters = {
          skip: 0,
          take: this.pageSize,
        };
        this.getProjectList(parameters);
      }
    });
  }
  deleteProject(item: any) {
    let deleteDialog = this.dialog.open(DialogConfirmComponent, {
      data: {
        title: 'Delete Project',
        message:
          'Are you sure you want delete this project? <br> This action cannot be undone.',
        buttonText: 'No',
        buttonYesText: 'Yes',
        isShow: true,
      },
      width: '400px',
      panelClass: 'dialog',
    });
    deleteDialog.afterClosed().subscribe((result) => {
      if (result == true) {
        this.projectService.deleteProjectById(item.id).subscribe((result) => {
          if (result.statusCode == 200) {
            this.customPageSetting();
            this.changeDefaultPage = 0;
            this.changeStartPage = 0;
            let parameters = {
              skip: 0,
              take: this.pageSize,
            };
            this.getProjectList(parameters);
          }
        });
      }
    });
  }
  // call this function get the list of project
  getProjectList(parameters: any) {
    let token = this.authService.getToken();
    if (token != null) {
      this.apploading.loadingProcessStart();
      let tokenProp = this.authService.getDecodedAccessToken(token);
      this.projectService
        .getProjectList(tokenProp.UserId, parameters)
        .subscribe((response) => {
          this.ProjectList = response.result;
          this.count = response.count;
          this.apploading.loadingProcessStop();
        });
    }
  }
  // call this function for default setting pagination
  customPageSetting() {
    this.pageIndex = 1;
    this.pageSize = 7;
    this.pageDifference = this.pageSize - this.pageIndex;
    this.pageEndRange = this.pageIndex * this.pageSize;
  }

  // call this function on recent activity page event
  pageChanged(Event: any): any {
    this.resetPaging();
    this.pageIndex = Event;
    this.pageEndRange = this.pageIndex * this.pageSize;
    this.pageStartRange = this.pageEndRange - this.pageDifference;
    this.skip = this.pageStartRange - 1; //custom change -1
    let parameters = {
      skip: this.skip,
      take: this.pageSize,
    };
    this.getProjectList(parameters);
  }
  // call this function reset paging indexing//
  resetPaging() {
    this.changeDefaultPage = undefined;
    this.changeStartPage = undefined;
  }
}
