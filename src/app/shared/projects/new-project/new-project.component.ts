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
import { DropzoneConfigInterface } from 'ngx-dropzone-wrapper';
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
const { SceneViewer } = require('../../../../assets/js/scene.js');
@Component({
  selector: 'app-new-project',
  templateUrl: './new-project.component.html',
  styleUrls: ['./new-project.component.scss'],
})
export class NewProjectComponent implements OnInit {
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
  @ViewChild('fileUploader') fileUploader: ElementRef | any;
  constructor(
    @Inject(MAT_DIALOG_DATA) private dialogdata: any,
    private modalRef: MatDialogRef<ProjectsComponent>,
    private modalNewProjectRef: MatDialogRef<NewProjectComponent>,
    public dialog: MatDialog,
    private projectService: ProjectService,
    private authService: AuthService,
    private formBuilder: FormBuilder
  ) {
    this.filename = '';
    if (this.dialogdata != null) {
      this.isCreated = false;
      this.isUpdateProject=true;
      this.NameOfProject = this.dialogdata;
      this.projectName = this.NameOfProject;
    } else {
      this.isCreated=true;
      this.isUpdateProject=false;
      this.projectName = 'New Project';
    }
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
  // User this part for Upload 3d model file
  CreateFile() {
    if (this.filename == '' || this.filename == undefined) {
      this.warning('Please upload .obj file only');
    } else {
      if (this.isCreated) {
        this.createNewProject();
      } else {
        let data = {
          isDisplay: true,
          file: this.parseObj,
          project: this.NameOfProject,
          projectId:this.projectId
        };
        this.modalNewProjectRef.close(data);
      }
    }
  }

  // call this function create new project
  createNewProject() {
    this.submitted = true;
    if (this.proccessFileForm.invalid) {
      return;
    } else {
      this.filename = '';
      this.NameOfProject = this.proccessFileForm.controls['projectName'].value;
      let token = this.authService.getToken();
      if (token) {
        let tokenProp = this.authService.getDecodedAccessToken(token);
        let model = new Project(
          '3fa85f64-5717-4562-b3fc-2c963f66afa6',
          tokenProp.UserId,
          this.NameOfProject
        );
        if (this.isCreated) {
          this.projectService
          .IsExistsProjectName(this.NameOfProject)
          .subscribe((result) => {
            if (result.statusCode == 200 && result.message == false) {
              this.SaveProject(model);
            } else {
              this.warning(
                'This project name already exists!<br> Please add the new name for save the project'
              );
            }
          });
        }
      }
    }
   
  }

  // call this function save the project//
  SaveProject(model: any) {
    this.projectService.saveProject(model).subscribe((result) => {
      if (result.statusCode == 200) {
        this.projectId = result.message;
        let data = {
          isDisplay: true,
          file: this.parseObj,
          project: this.NameOfProject,
          projectId:this.projectId
        };
        this.modalNewProjectRef.close(data);
      }
    });
  }

  // call this function for update the project
  updateProject(item: any) {
    this.proccessFileForm.patchValue({ projectName: item.projectName });
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
    let ext = this.filename.split('.');
    if (ext != undefined && ext != null && ext[1] == 'obj') {
      this.isLoadFile = true;
      var reader = new FileReader();
      reader.onload = (e: any) => {
        // The file's text will be printed here
        this.parseObj = e.target.result;
        this.isLoadFile = false;
      };
      reader.readAsText(file);
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
    this.dialog.closeAll();
  }
}
