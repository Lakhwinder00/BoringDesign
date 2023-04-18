import { Component, OnInit, Inject } from '@angular/core';
import {
  MatDialog,
  MatDialogRef,
  MAT_DIALOG_DATA,
} from '@angular/material/dialog';
import { AnalysisResultComponent } from '../analysis-result/analysis-result.component';
import { DialogConfirmComponent } from '../dialog-confirm/dialog-confirm.component';
import { ProjectService } from 'src/app/services/project.service';
import {
  AbstractControl,
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { Project, ProjectScore } from 'src/app/core/model/project.model';
import { AuthService } from 'src/app/services/auth.service';
import { Result } from 'postcss';

@Component({
  selector: 'app-process-analysis',
  templateUrl: './process-analysis.component.html',
  styleUrls: ['./process-analysis.component.scss'],
})
export class ProcessAnalysisComponent implements OnInit {
  public projectId: any;
  public ProjectName: any;
  public count: any;
  public pageSize: number | any;
  public pageIndex: number | any;
  public pageDifference: number | any;
  public pageEndRange: number | any;
  public pageStartRange = 1;
  public skip: number = 0;
  public fileReset: any;
  public submitted: boolean = false;
  projectScoreList: any = [];
  constructor(
    @Inject(MAT_DIALOG_DATA) private dialogData: any,
    private modalRef: MatDialogRef<ProcessAnalysisComponent>,
    public dialog: MatDialog,
    public projectService: ProjectService,
    private formBuilder: FormBuilder,
    private authService:AuthService
  ) {
    debugger;
    this.projectId = this.dialogData?.projectId;
    this.ProjectName = this.dialogData?.projectName;
    this.count = 0;
    this.customPageSetting();
  }

  ngOnInit(): void {
    this.analysisFileForm = this.formBuilder.group({
      projectName: [this.ProjectName, [Validators.required]],
    });
    let parameters = {
      skip: this.skip,
      take: this.pageSize,
    };
    this.getProjectScoreList(parameters);
  }

  getProjectScoreList(parameters: any) {
    this.projectService
      .getProjectScoreList(this.projectId, parameters)
      .subscribe((response) => {
        if (response.statusCode == 200) {
          this.projectScoreList = response.result;
          this.count = response.count;
        }
      });
  }
  analysisFileForm: FormGroup = new FormGroup({
    projectName: new FormControl(''),
  });
  get f(): { [key: string]: AbstractControl } {
    return this.analysisFileForm.controls;
  }
  // call this function on recent activity page event
  pageChanged(Event: any): any {
    this.pageIndex = Event;
    this.pageEndRange = this.pageIndex * this.pageSize;
    this.pageStartRange = this.pageEndRange - this.pageDifference;
    this.skip = this.pageStartRange - 1; //custom change -1
    let parameters = {
      skip: this.skip,
      take: this.pageSize,
    };
    this.getProjectScoreList(parameters);
  }
  closeDialog() {
    this.modalRef.close();
  }
  deleteProject(item: any) {
    let deleteDialog = this.dialog.open(DialogConfirmComponent, {
      data: {
        title: 'Delete Project Analysis',
        message:
          'Are you sure you want delete this project Analysis? <br> This action cannot be undone.',
        buttonText: 'No',
        buttonYesText: 'Yes',
        isShow: true,
      },
      width: '400px',
      panelClass: 'dialog',
    });
    deleteDialog.afterClosed().subscribe((result) => {
      if (result == true) {
        this.projectService
          .deleteProjectScoreById(item.id)
          .subscribe((result) => {
            if (result.statusCode == 200) {
              this.customPageSetting();
              let parameters = {
                skip: 0,
                take: this.pageSize,
              };
              this.getProjectScoreList(parameters);
            }
          });
      }
    });
  }
  // call this function for default setting pagination
  customPageSetting() {
    this.pageIndex = 1;
    this.pageSize = 7;
    this.pageDifference = this.pageSize - this.pageIndex;
    this.pageEndRange = this.pageIndex * this.pageSize;
  }
  analysesScore(item: any) {
   let AnalysisDialog= this.dialog.open(AnalysisResultComponent, {
      data: { projectScoreId: item.id, projectId: null,projectScoreName:item.projectScoreName},
      panelClass: 'project-analysis-cls',
    });
    AnalysisDialog.afterClosed().subscribe((result)=>{
      if(result)
      {
        let parameters = {
          skip: 0,
          take: this.pageSize,
        };
        this.getProjectScoreList(parameters);
      }
    })
  }

  // call this function for update the project name
  saveDialog() {
    this.submitted = true;
    if (this.analysisFileForm.invalid) {
      return;
    }
    this.ProjectName=this.analysisFileForm.controls['projectName'].value;
    this.projectService.IsExistsProjectName(this.ProjectName).subscribe((result)=>{
      if (result.statusCode == 200 && result.message == false) {
        let token = this.authService.getToken();
      if (token) {
        let tokenProp = this.authService.getDecodedAccessToken(token);
        let model=new Project(this.projectId,tokenProp.UserId,this.ProjectName)
        this.updateProject(model);
      } 
    }else {
      this.warning(
        'This project name already exists.<br> Please add the new name for save the project'
      );
    }})
  }
  // call this function update the project name//
  updateProject(model:any)
  {
    this.projectService.updateProject(model).subscribe((result)=>{
     if(result.statusCode==200)
     {
       this.modalRef.close(true);
     }else{
      this.warning(result.message)
     }
    })

  }
  warning(message: any) {
    this.dialog.open(DialogConfirmComponent, {
      data: {
        title: 'Warning',
        message: message,
        buttonText: 'Ok',
      },
      panelClass: 'dialog',
      width: '400px',
    });
  }
}
