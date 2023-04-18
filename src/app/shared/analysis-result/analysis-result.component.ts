import { Component, OnInit, Inject } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import {
  MatDialog,
  MatDialogRef,
  MAT_DIALOG_DATA,
} from '@angular/material/dialog';
import {
  ProjectAnalysisScoreModel,
  ProjectScore,
} from 'src/app/core/model/project.model';
import { ProjectService } from 'src/app/services/project.service';
import { UtilService } from 'src/app/services/util.service';
import { ProcessAnalysisComponent } from '../process-analysis/process-analysis.component';
import { DialogConfirmComponent } from '../dialog-confirm/dialog-confirm.component';
import { flattenJSON } from 'three/src/animation/AnimationUtils';
@Component({
  selector: 'app-analysis-result',
  templateUrl: './analysis-result.component.html',
  styleUrls: ['./analysis-result.component.scss'],
})
export class AnalysisResultComponent implements OnInit {
  public analysisResult: any = new ProjectAnalysisScoreModel();
  public getScore: any;
  public isShowResult: boolean = false;
  public details: any;
  public volume: any;
  public massing: any;
  public total: any;

  public detailsValue: any;
  public volumeValue: any;
  public massingValue: any;
  public totalValue: any;
  public submitted = false;
  public projectId: any;
  public projectScoreId: any;
  public projectScoreName:any;
  constructor(
    @Inject(MAT_DIALOG_DATA) private dialogdata: any,
    private modalRef: MatDialogRef<AnalysisResultComponent>,
    public dialog: MatDialog,
    private projectService: ProjectService,
    private formBuilder: FormBuilder
  ) {
    if (this.dialogdata.projectId != null) {
      this.projectId = this.dialogdata.projectId;
    } else {
      this.projectScoreId = this.dialogdata.projectScoreId;
      this.projectScoreName=this.dialogdata.projectScoreName;
    }
  }
  ngOnInit(): void {
    this.isShowResult = false;
    if (this.projectId != null && this.projectId != undefined) {
      this.findAnalysis();
    } else {
      this.loadAnalysis();
      this.analysisFileForm = this.formBuilder.group({
        analysisName: [this.projectScoreName, [Validators.required]],
      });
    }
  }
  findAnalysis() {
    this.analysisResult = this.projectService.getProjectAnalysisScore();
    this.projectService
      .projectAnalysisScore(this.analysisResult)
      .subscribe((result) => {
        this.isShowResult = true;
        this.getScore = result;
        this.details =this.getScore[0];
        this.volume = this.getScore[1];
        this.massing = this.getScore[2];
        this.total = this.getScore[3];
        this.detailsValue = Math.trunc(this.getScore[0]) + '' + 0;
        this.volumeValue = Math.trunc(this.getScore[1]) + '' + 0;
        this.massingValue = Math.trunc(this.getScore[2]) + '' + 0;
        this.totalValue = Math.trunc(this.getScore[3]) + '' + 0;
      });
    this.analysisFileForm = this.formBuilder.group({
      analysisName: ['', [Validators.required]],
    });
  }
  loadAnalysis() {
    this.projectService
      .getProjectScoreById(this.projectScoreId)
      .subscribe((response) => {
        this.isShowResult = true;

        this.details =response.result.detail;
        this.volume = response.result.volume;
        this.massing = response.result.massing;
        this.total = response.result.totalScore;

        this.detailsValue =response.result.detail + '' + 0;
        this.volumeValue = response.result.volume + '' + 0;
        this.massingValue = response.result.massing + '' + 0;
        this.totalValue = response.result.totalScore + '' + 0;
      });
  }
  analysisFileForm: FormGroup = new FormGroup({
    analysisName: new FormControl(''),
  });
  get f(): { [key: string]: AbstractControl } {
    return this.analysisFileForm.controls;
  }

  closeDialog() {
    this.modalRef.close();
  }
  onSubmit() {
   
    this.submitted = true;
    if (this.analysisFileForm.invalid) {
      return;
    } else {
      if(this.projectScoreId!=null || this.projectScoreId!=undefined || this.projectScoreId!=null)
      {
        let model = new ProjectScore(
          this.projectScoreId,
          this.projectId,
          this.analysisFileForm.controls['analysisName'].value,
          this.details,
          this.volume,
          this.massing,
          this.total
        );
        this.projectScoreName= this.analysisFileForm.controls['analysisName'].value;
        this.projectService.IsExistsProjectScoreName(this.projectScoreName).subscribe((result)=>{
          if(result.statusCode==200 && !result.message)
          {
            this.projectService.updateScoreProject(model).subscribe((response=>{
              if(response.statusCode==200)
              {
                this.modalRef.close(true);
              }
            }))
          }else{this.warning('This name is already exists!<br> Please add the new name for save the Analysis Result')}
        })
      }else{
        let model = new ProjectScore(
          '3fa85f64-5717-4562-b3fc-2c963f66afa6',
          this.projectId,
          this.analysisFileForm.controls['analysisName'].value,
          this.details,
          this.volume,
          this.massing,
          this.total
        );
        this.projectService.saveProjectScore(model).subscribe((result) => {
          if (result.statusCode == 200) {
            this.dialog.open(ProcessAnalysisComponent, {
              data: this.projectId,
              panelClass: 'process-cls',
            });
          }
        });
      }
    }
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
