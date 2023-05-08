import {
  Component,
  ElementRef,
  Inject,
  OnInit,
  ViewChild,
} from '@angular/core';
import { DialogConfirmComponent } from '../dialog-confirm/dialog-confirm.component';
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogRef,
} from '@angular/material/dialog';
import { ProjectService } from 'src/app/services/project.service';
import { AuthService } from 'src/app/services/auth.service';
import { ProjectImageAnalysisModel } from 'src/app/core/model/project.model';

@Component({
  selector: 'app-image-analysis-result',
  templateUrl: './image-analysis-result.component.html',
  styleUrls: ['./image-analysis-result.component.scss'],
})
export class ImageAnalysisResultComponent implements OnInit {
  submitted = false;
  public filename: any;
  public isLoadFile: boolean = false;
  public files: any;
  public parseObj: any;
  public SCENE: any;
  public NameOfProject: any;
  public isCreated = true;
  public isUpdateProject: boolean = false;
  public projectName: any;
  public projectId: any;
  public imageExtension: string | any;
  public imageName:any;
  @ViewChild('fileUploader') fileUploader: ElementRef | any;
  constructor(
    @Inject(MAT_DIALOG_DATA) private dialogdata: any,
    private modalRef: MatDialogRef<ImageAnalysisResultComponent>,
    public dialog: MatDialog,
    private projectService: ProjectService,
    private authService: AuthService
  ) {
    this.filename = '';
    if (this.dialogdata != null) {
      this.isCreated = false;
      this.isUpdateProject = true;
      this.NameOfProject = this.dialogdata?.projectName;
      this.projectName = this.NameOfProject;
    } else {
      this.isCreated = true;
      this.isUpdateProject = false;
      this.projectName = 'New Project';
    }
  }

  ngOnInit(): void {}

  // User this part for Upload 3d model file
  CreateFile() {
    if (this.filename == '' || this.filename == undefined) {
      this.warning('Please upload a .JPG .PNG .TIFF file');
    } else {
      this.createNewProject();
    }
  }

  // call this function create new project
  createNewProject() {
    let model = new ProjectImageAnalysisModel(
      this.parseObj,
      this.imageExtension
    );
    this.isLoadFile = true;
    this.projectService
      .projectImageAnalysisScore(model)
      .subscribe((result: any) => {
        if (result.statusCode == 200) {
          let imageScore = result.score?.split('\n');
          let TaxtureValue = imageScore[1].toString().split(':')[1];
          let ColourValue = imageScore[3].toString().split(':')[1];
          this.isLoadFile = false;
          let data = { Taxture: TaxtureValue, Colour: ColourValue,ImageName:this.imageName };
          this.modalRef.close(data);
        }
      });
  }

  /**
   * handle file from browsing
   */
  fileBrowseHandler(file: any) {
    this.prepareFilesList(file.target.files[0]);
  }
  onFileDropped(file: any) {
    this.prepareFilesList(file.target.files[0]);
  }
  /**
   * Convert Files list to normal array list
   * @param files (Files List)
   */
  // call this function uplad the files
  prepareFilesList(file: any): void {
    this.parseObj = null;
    this.filename = file.name;
    this.imageName=file;
    let ext = this.filename.split('.');
    if (
      (ext != undefined && ext != null && ext[1] == 'jpg') ||
      ext[1] == 'png' ||
      ext[1] == 'Tiff'
    ) {
      this.imageExtension = `.${ext[1]}`;
      this.isLoadFile = true;
      var reader = new FileReader();
      reader.onload = (e: any) => {
        // chek file size //
        const image = new Image();
        image.src = e.target.result;
        image.onload = (rs: any) => {
          const img_height = rs.currentTarget['height'];
          const img_width = rs.currentTarget['width'];
          if (img_height == 1000 && img_width == 1000) {
            // The file's text will be printed here
            this.parseObj = e.target.result.split('base64,')[1];
            this.isLoadFile = false;
          } else {
            this.warning(
              'Please upload an image with size 1000x1000px'
            );
            this.filename = '';
            this.isLoadFile = false;
          }
        };
      };
      reader.readAsDataURL(file);
    } else {
      this.filename = '';
    }
  }
  resetFile() {
    this.fileUploader.nativeElement.value = null;
  }
  deleteModel() {
    this.filename = '';
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
  cancelCreate() {
    this.modalRef.close();
  }
}
