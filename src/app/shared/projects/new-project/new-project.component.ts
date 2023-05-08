import {
  Component,
  OnInit,
  Inject,
  ElementRef,
  ViewChild,
} from '@angular/core';
import {
  MatDialog,
  MatDialogRef,
  MAT_DIALOG_DATA,
} from '@angular/material/dialog';
import { DialogConfirmComponent } from '../../dialog-confirm/dialog-confirm.component';
import { ProjectsComponent } from '../projects.component';
import { ProjectService } from 'src/app/services/project.service';
import {
  AbstractControl,
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { AuthService } from 'src/app/services/auth.service';
import { Project } from 'src/app/core/model/project.model';
import { UtilService } from 'src/app/services/util.service';

@Component({
  selector: 'app-new-project',
  templateUrl: './new-project.component.html',
  styleUrls: ['./new-project.component.scss'],
})
export class NewProjectComponent implements OnInit {
  isSubmitted = false;
  isCreateProject = true;
  isUpdateProject = false;
  isLoadFile = false;
  title = '';
  filename = '';
  projectName = '';
  projectId: any;
  FileModeldata: any;
  parseObj: any;
  SCENE: any;

  @ViewChild('fileUploader') fileUploader: ElementRef | any;
  @ViewChild('fileloader', { static: true }) loader: ElementRef | any;

  constructor(
    @Inject(MAT_DIALOG_DATA) private dialogdata: any,
    private modalRef: MatDialogRef<ProjectsComponent>,
    private modalNewProjectRef: MatDialogRef<NewProjectComponent>,
    public dialog: MatDialog,
    private projectService: ProjectService,
    private authService: AuthService,
    private formBuilder: FormBuilder,
    private utilService: UtilService
  ) {
    if (this.dialogdata != null) {
      this.isCreateProject = false;
      this.isUpdateProject = true;
      this.projectName = this.dialogdata;
      this.title = this.projectName;
    } else {
      this.isCreateProject = true;
      this.isUpdateProject = false;
      this.title = 'New Project';
    }

    this.utilService.getFileResult().subscribe((result) => {
      if (result) {
        //this.loader.loadingProcessStop();
        this.dialog.closeAll();
        this.isLoadFile = false;
      }
    });
  }

  ngOnInit(): void {
    this.proccessFileForm = this.formBuilder.group({
      projectName: ['', [Validators.required]],
    });
  }

  proccessFileForm: FormGroup = new FormGroup({
    projectName: new FormControl(''),
  });

  get f(): { [key: string]: AbstractControl } {
    return this.proccessFileForm.controls;
  }

  CreateFile() {
    if (this.isCreateProject) {
      if (this.proccessFileForm.invalid) {
        this.warning('Please enter a valid project name');
        return;
      }
    }

    if (!this.filename) {
      this.warning('Please upload an .OBJ file in meters');
      return;
    }

    setTimeout(() => {
      this.isCreateProject ? this.createNewProject() : this.updateProject();
    }, 400);
  }

  createNewProject() {
    this.isSubmitted = true;

    this.projectName = this.proccessFileForm.controls['projectName'].value;

    const token = this.authService.getToken();
    if (!token) return;

    const props = this.authService.getDecodedAccessToken(token);
    const model = new Project(
      '3fa85f64-5717-4562-b3fc-2c963f66afa6',
      props.UserId,
      this.projectName
    );

    this.projectService
      .projectNameExists(this.projectName, model.userId)
      .subscribe((result) => {
        if (result.statusCode === 200 && result.message === false) {
          this.SaveProject(model);
        } else {
          this.warning(
            'This project name already exists<br>Please enter a new name for the project'
          );
        }
      });
  }

  SaveProject(model: Project) {
    this.projectService.saveProject(model).subscribe((result) => {
      if (result.statusCode === 200) {
        this.projectId = result.message;
        this.FileModeldata = {
          isDisplay: true,
          file: this.parseObj,
          project: this.projectName,
          projectId: this.projectId,
        };
        this.isLoadFile = true;
        this.utilService.sendFileData(this.FileModeldata);
      }
    });
  }

  updateProject() {
    const data = {
      isDisplay: true,
      file: this.parseObj,
      project: this.projectName,
      projectId: this.projectId,
    };
    setTimeout(() => {
      this.isLoadFile = true;
      this.utilService.sendFileData(data);
    }, 400);
  }

  fileBrowseHandler(file: any) {
    this.prepareFilesList(file.target.files[0]);
  }

  onFileDropped(file: any) {
    this.prepareFilesList(file.target.files[0]);
  }

  prepareFilesList(file: any): void {
    this.parseObj = null;
    this.filename = file.name;
    const ext = this.filename.split('.');
    if (ext && ext[1] === 'obj') {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.parseObj = e.target.result;
        this.isLoadFile = false;
      };
      reader.readAsText(file);
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

  warning(message: string) {
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
    this.dialog.closeAll();
  }
}
