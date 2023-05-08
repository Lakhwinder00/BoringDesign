import {
  Component,
  OnInit,
  Inject,
  ViewChild,
  ElementRef,
} from '@angular/core';
import { jsPDF } from 'jspdf';

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
import { ProcessAnalysisComponent } from '../process-analysis/process-analysis.component';
import { DialogConfirmComponent } from '../dialog-confirm/dialog-confirm.component';
import { ImageAnalysisResultComponent } from '../image-analysis-result/image-analysis-result.component';
import html2canvas from 'html2canvas';
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
  public image: any;
  public base64: any;
  public detailsValue: any;
  public volumeValue: any;
  public massingValue: any;
  public taxture: any;
  public colour: any;
  public totalValue: any;
  public submitted = false;
  public projectId: any;
  public projectScoreId: any;
  public projectScoreName: any;
  public projectName: any;
  public isColorTexture: boolean = false;
  public AnalysisImage: any;
  public isGetResultAnalysis: boolean = false;
  public isUploadLoadImageAnalysis: boolean = false;
  @ViewChild('appfileloading', { static: true }) appfileloading:
    | ElementRef
    | any;
  constructor(
    @Inject(MAT_DIALOG_DATA) private dialogdata: any,
    private modalRef: MatDialogRef<AnalysisResultComponent>,
    public dialog: MatDialog,
    private projectService: ProjectService,
    private formBuilder: FormBuilder
  ) {
    if (this.dialogdata.projectId != null) {
      this.projectId = this.dialogdata.projectId;
      this.projectName = this.dialogdata?.projectName;
    } else {
      this.projectScoreId = this.dialogdata.projectScoreId;
      this.projectScoreName = this.dialogdata.projectScoreName;
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
    //this.appfileloading.loadingProcessStart();
    this.analysisResult = this.projectService.getProjectAnalysisScore();
    this.projectService
      .projectAnalysisScore(this.analysisResult)
      .subscribe((result) => {
        this.isShowResult = true;
        this.getScore = result;
        this.details = this.getScore[0];
        this.volume = this.getScore[1];
        this.massing = this.getScore[2];
        this.total = this.getScore[3];
        this.detailsValue = Math.trunc(this.getScore[0]) + '' + 0;
        this.volumeValue = Math.trunc(this.getScore[1]) + '' + 0;
        this.massingValue = Math.trunc(this.getScore[2]) + '' + 0;
        this.totalValue = Math.trunc(this.getScore[3]) + '' + 0;
        this.base64 = this.analysisResult.imageData;
      });
    this.analysisFileForm = this.formBuilder.group({
      analysisName: ['', [Validators.required]],
    });
  }
  loadAnalysis() {
    //this.appfileloading.loadingProcessStop();
    this.projectService
      .getProjectScoreById(this.projectScoreId)
      .subscribe((response) => {
        this.isShowResult = true;
        this.details = response.result.detail;
        this.volume = response.result.volume;
        this.massing = response.result.massing;
        this.total = response.result.totalScore;
        this.base64 = response.result?.image;
        this.detailsValue = response.result.detail + '' + 0;
        this.volumeValue = response.result.volume + '' + 0;
        this.massingValue = response.result.massing + '' + 0;
        this.totalValue = response.result.totalScore + '' + 0;
        if (response.result.taxture != null && response.result.colour != null) {
          this.taxture = response.result.taxture;
          this.colour = response.result.colour;
          this.isColorTexture = true;
        } else {
          this.isColorTexture = false;
        }
        this.AnalysisImage = response.result?.analysisImage;
        if(this.AnalysisImage!=undefined && this.AnalysisImage=='')
        {
          this.isUploadLoadImageAnalysis = true;
        }else{ this.isUploadLoadImageAnalysis = false;}
        
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
  // call this function save the analysis record.
  onSubmit() {
    this.submitted = true;
    if (this.analysisFileForm.invalid) {
      this.warning('Please enter a valid name');
      return;
    } else {
      this.image = this.base64;
      this.SaveAnalysisResult();
    }
  }
  SaveAnalysisResult() {
    if (this.projectScoreId != null || this.projectScoreId != undefined) {
      let model = new ProjectScore(
        this.projectScoreId,
        this.projectId,
        this.analysisFileForm.controls['analysisName'].value,
        this.details,
        this.volume,
        this.massing,
        this.total,
        this.taxture,
        this.colour,
        this.image,
        this.AnalysisImage
      );
      this.projectScoreName =
        this.analysisFileForm.controls['analysisName'].value;
      this.projectService
        .projectScoreNameExists(this.projectScoreName, this.projectId)
        .subscribe((result) => {
          if (result.statusCode == 200 && !result.message) {
            this.projectService
              .updateScoreProject(model)
              .subscribe((response) => {
                if (response.statusCode == 200) {
                  this.modalRef.close(true);
                }
              });
          } else {
            this.warning(
              'This name already exists<br>Please enter a new name to save the analysis result'
            );
          }
        });
    } else {
      let model = new ProjectScore(
        '3fa85f64-5717-4562-b3fc-2c963f66afa6',
        this.projectId,
        this.analysisFileForm.controls['analysisName'].value,
        this.details,
        this.volume,
        this.massing,
        this.total,
        this.taxture,
        this.colour,
        this.image,
        this.AnalysisImage
      );
      this.projectScoreName =
        this.analysisFileForm.controls['analysisName'].value;
      this.projectService
        .projectScoreNameExists(this.projectScoreName, this.projectId)
        .subscribe((result) => {
          if (result.statusCode == 200 && !result.message) {
            this.projectService
              .saveProjectScore(model)
              .subscribe((response) => {
                if (response.statusCode == 200) {
                  this.dialog.open(ProcessAnalysisComponent, {
                    data: {
                      projectId: this.projectId,
                      projectName: this.projectName,
                    },
                    panelClass: 'process-cls',
                  });
                }
              });
          } else {
            this.warning(
              'This name already exists<br>Please enter a new name to save the analysis result'
            );
          }
        });
    }
  }
  compressImage(src: any, newX: any, newY: any) {
    return new Promise((res, rej) => {
      const img = new Image();
      img.src = src;
      img.onload = () => {
        const elem = document.createElement('canvas');
        elem.width = newX;
        elem.height = newY;
        const ctx = elem.getContext('2d');
        if (ctx != null) {
          ctx.drawImage(img, 0, 0, newX, newY);
          const data = ctx.canvas.toDataURL();
          res(data);
        }
      };
      img.onerror = (error) => rej(error);
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

  // this function call to image analysis
  imageAnalysis() {
    let ImageAnalysisDialog = this.dialog.open(ImageAnalysisResultComponent, {
      data: { projectName: this.projectName },
      width: '500px',
      panelClass: 'new-project-cls',
    });
    ImageAnalysisDialog.afterClosed().subscribe((result) => {
      if (result != null && result?.Taxture != '') {
        //Show image preview
        let reader = new FileReader();
        reader.onload = (event: any) => {
          this.compressImage(event.target.result, 1000, 1000).then(
            (compressed) => {
              this.AnalysisImage = compressed;
              this.taxture = result.Taxture?.trim() == 'True' ? true : false;
              this.colour = result.Colour?.trim() == 'True' ? true : false;
              this.isColorTexture = true;
              this.isUploadLoadImageAnalysis = false;
            }
          );
        };
        reader.readAsDataURL(result.ImageName);
      }
    });
  }

  // Generate PDF Section//
  @ViewChild('report', { static: true }) content:
    | ElementRef<HTMLImageElement>
    | any;
  public downloadPDF() {
    this.projectScoreName =
      this.analysisFileForm.controls['analysisName'].value;
    if (this.projectScoreName != '') {
      html2canvas(this.content.nativeElement).then((canvas) => {
        const imageData = canvas.toDataURL('image/jpeg');
        let pdf = new jsPDF({
          orientation: 'p',
          unit: 'pt',
          format: 'letter',
        });
        const bufferX = 15;
        const bufferY = 5;
        const imageProp = pdf.getImageProperties(imageData);
        const pdfw = pdf.internal.pageSize.getWidth() - 2 * bufferX;
        const pdfh = (imageProp.height * pdfw) / imageProp.width;
        pdf.addImage(imageData, 'PNG', bufferX, bufferY, pdfw, pdfh);
        pdf.save('AnalysisResult.pdf');
      });
    } else {
      this.warning('Please enter analysis result name');
    }
  }
}
