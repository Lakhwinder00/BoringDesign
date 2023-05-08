import { Component, OnInit, Inject, Input, ViewChild, ElementRef } from '@angular/core';
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
import { Project } from 'src/app/core/model/project.model';
import { AuthService } from 'src/app/services/auth.service';
@Component({
  selector: 'app-process-analysis',
  templateUrl: './process-analysis.component.html',
  styleUrls: ['./process-analysis.component.scss'],
})
export class ProcessAnalysisComponent implements OnInit {
  public projectId: any;
  public projectName: any;
  public count: any;
  public pageSize: number | any;
  public pageIndex: number | any;
  public pageDifference: number | any;
  public pageEndRange: number | any;
  public changeDefaultPage: any | undefined;
  public changeStartPage: any | undefined;
  pageStartRange = 1;
  skip: number = 0;
  public fileReset: any;
  public isSubmitted: boolean = false;
  projectScoreList: any = [];
  @Input() FileModeldata: any;
  @ViewChild('apploading',{static:true}) apploading: ElementRef | any;
  constructor(
    @Inject(MAT_DIALOG_DATA) private dialogData: any,
    private modalRef: MatDialogRef<ProcessAnalysisComponent>,
    public dialog: MatDialog,
    public projectService: ProjectService,
    private formBuilder: FormBuilder,
    private authService: AuthService
  ) {
    this.projectId = this.dialogData?.projectId;
    this.projectName = this.dialogData?.projectName;
    this.count = 0;
    this.customPageSetting();
  }

  ngOnInit(): void {
    this.projectScoreList=[];     
    this.analysisFileForm = this.formBuilder.group({
      projectName: [this.projectName, [Validators.required]],
    });
    let parameters = {
      skip: this.skip,
      take: this.pageSize,
    };
    this.getProjectScoreList(parameters);
  }

  getProjectScoreList(parameters: any) {
    this.apploading.loadingProcessStart();
    this.projectService
      .getProjectScoreList(this.projectId, parameters)
      .subscribe((response) => {
        if (response.statusCode == 200) {
          this.projectScoreList = response.result;
          this.count = response.count;
          this.apploading.loadingProcessStop();
        }
      });
  }

  analysisFileForm: FormGroup = new FormGroup({
    projectName: new FormControl(''),
  });

  get f(): { [key: string]: AbstractControl } {
    return this.analysisFileForm.controls;
  }

  pageChanged(Event: any): any {
    this.resetPaging();
    this.pageIndex = Event;
    this.pageEndRange = this.pageIndex * this.pageSize;
    this.pageStartRange = this.pageEndRange - this.pageDifference;
    this.skip = this.pageStartRange - 1;
    if (this.skip < 0) {
      this.skip = 0;
    }
    let parameters = {
      skip: this.skip,
      take: this.pageSize,
    };
    this.getProjectScoreList(parameters);
  }

  resetPaging() {
    this.changeDefaultPage = undefined;
    this.changeStartPage = undefined;
  }

  closeDialog() {
    this.modalRef.close();
  }

  deleteProject(item: any) {
    let deleteDialog = this.dialog.open(DialogConfirmComponent, {
      data: {
        title: 'Delete Project Analysis',
        message:
          'Are you sure you want delete this project Analysis?<br>This action cannot be undone',
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
              this.changeDefaultPage = 0;
              this.changeStartPage = 0;
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

  customPageSetting() {
    this.count = 0;
    this.pageIndex = 1;
    this.pageSize = 7;
    this.pageDifference = this.pageSize - this.pageIndex;
    this.pageEndRange = this.pageIndex * this.pageSize;
  }

  analysesScore(item: any) {
    let AnalysisDialog = this.dialog.open(AnalysisResultComponent, {
      data: {
        projectScoreId: item.id,
        projectId: null,
        projectScoreName: item.projectScoreName,
        projectName: this.projectName,
      },
      panelClass: 'project-analysis-modal',
    });
    AnalysisDialog.afterClosed().subscribe((result) => {
      if (result) {
        let parameters = {
          skip: 0,
          take: this.pageSize,
        };
        this.getProjectScoreList(parameters);
      }
    });
  }

  saveDialog(): void {
    this.isSubmitted = true;

    if (this.analysisFileForm.invalid) {
      this.warning('Please enter a valid project name');
      return;
    }

    const newProjectName = this.analysisFileForm.controls['projectName'].value;

    if (newProjectName === this.projectName) {
      this.modalRef.close(newProjectName);
      return;
    }

    const token = this.authService.getToken();
    if (!token) return;

    const props = this.authService.getDecodedAccessToken(token);

    this.projectService
      .projectNameExists(newProjectName, props.UserId)
      .subscribe((result) => {
        if (result.statusCode === 200 && result.message === false) {
          const model = new Project(
            this.projectId,
            props.UserId,
            newProjectName
          );
          this.updateProject(model);
        } else {
          this.warning(
            'This project name already exists<br>Please enter a new name for the project'
          );
        }
      });
  }

  updateProject(model: any) {
    this.projectService.updateProject(model).subscribe((result) => {
      if (result.statusCode == 200) {
        this.modalRef.close(model.projectName);
      } else {
        this.warning(result.message);
      }
    });
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
