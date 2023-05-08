import {
  Component,
  OnInit,
  ViewChild,
  ElementRef,
  ViewChildren,
  QueryList,
  HostListener,
} from '@angular/core';

import { UtilService } from '../services/util.service';
import { MatDialog } from '@angular/material/dialog';
import { MyAccountComponent } from '../my-account/my-account.component';
import { ProjectsComponent } from '../shared/projects/projects.component';
import { DialogConfirmComponent } from '../shared/dialog-confirm/dialog-confirm.component';
import { AuthService } from '../services/auth.service';
import { ProcessAnalysisComponent } from '../shared/process-analysis/process-analysis.component';
import { ProjectService } from '../services/project.service';
import { ProjectAnalysisScoreModel } from '../core/model/project.model';
import { NewProjectComponent } from '../shared/projects/new-project/new-project.component';
import { AnalysisResultComponent } from '../shared/analysis-result/analysis-result.component';

const { SceneViewer } = require('../../assets/js/scene.js');
@Component({
  selector: 'app-process-file',
  templateUrl: './process-file.component.html',
  styleUrls: ['./process-file.component.scss'],
})
export class ProcessFileComponent implements OnInit {
  @ViewChildren('el', { read: ElementRef }) children:
    | QueryList<ElementRef>
    | any;
  @ViewChild('apploading', { static: true }) apploading: ElementRef | any;
  fileOutput: any;
  public userId: any;
  public parseObj: any;
  public files: any;
  public isDisplay: boolean = false;
  public isUpload: boolean = true;
  public filename: any = '';
  public isLoadFile: boolean = false;
  public isLogOut: boolean = false;
  public loginEmail: any = '';
  public SCENE: any;
  public interval: any;
  public analysisInterval: any;
  public isClear: boolean = false;
  public isAnalyse: boolean = false;
  public projectName: any;
  public projectList: any = [];
  public isUpdateProject: boolean = false;
  public projectId: any;
  public count: any;
  public pageSize: number | any;
  public pageIndex: number | any;
  public pageDifference: number | any;
  public pageEndRange: number | any;
  public changeDefaultPage: any | undefined;
  public changeStartPage: any | undefined;
  pageStartRange = 1;
  skip: number = 0;
  fileReset: any;
  submitted = false;
  @ViewChild('fileUploader', { static: true }) fileUploader: ElementRef | any;
  constructor(
    private utilService: UtilService,
    public dialog: MatDialog,
    private authService: AuthService,
    private projectService: ProjectService
  ) {
    this.utilService.sendClickEvent(true);
    this.utilService.getFileData().subscribe((result) => {
      this.loadProject(result);
    });
    this.count = 0;
    this.customPageSetting();
  }
  ngOnInit(): void {
    this.projectList = [];
    this.isUpdateProject = false;
    let parameters = {
      skip: this.skip,
      take: this.pageSize,
    };
    this.getProjectList(parameters);
    this.authService.isTokenExpired();
    this.loginEmail = localStorage.getItem('userEmail');
    const token = this.authService.getToken();
    if (token != null) {
      const props = this.authService.getDecodedAccessToken(token);
      this.userId = props.UserId;
    }else{this.authService.logout()}
    if (this.SCENE == undefined || this.SCENE == null) {
      this.SCENE = new SceneViewer(window.innerWidth, window.innerHeight);
      const container = document.getElementById('main-canvas');
      if (container != null) {
        this.SCENE.add(container);
        this.SCENE.animate();
      }
    }
  }

  resetFile() {
    this.fileUploader.nativeElement.value = null;
  }
  updateProject(item: any) {
    this.projectId = item.id;
    const update = this.dialog.open(NewProjectComponent, {
      data: item.projectName,
      width: '500px',
      panelClass: 'new-project-cls',
    });
    update.afterClosed().subscribe(() => {});
  }
  getProjectList(parameters: any) {
    const token = this.authService.getToken();
    if (token != null) {
      const props = this.authService.getDecodedAccessToken(token);
      this.userId = props.UserId;
      this.apploading.loadingProcessStart();
      this.projectService
        .getProjectList(props.UserId, parameters)
        .subscribe((response) => {
          this.projectList = response.result;
          this.count = response.count;
          this.apploading.loadingProcessStop();
        });
    }else{this.authService.logout()}
  }
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
  resetPaging() {
    this.changeDefaultPage = undefined;
    this.changeStartPage = undefined;
  }
  newproject() {
    let project = this.dialog.open(NewProjectComponent, {
      data: null,
      width: '500px',
      panelClass: 'new-project-cls',
    });
    project.afterClosed().subscribe(() => {});
  }
  loadProject(result: any) {
    if (result != undefined) {
      if (result.projectId != undefined) this.projectId = result.projectId;
      if (this.projectId == null || this.projectId == undefined) {
        return;
      }

      setTimeout(() => {
        this.SCENE.loadModel(result?.file);
        this.projectName = result.project;
        if (result.isDisplay) {
          this.isUpload = false;
        }
        this.isDisplay = result.isDisplay;
        this.isClear = false;
        this.isAnalyse = false;
        this.resetPaging();
        let parameters = {
          skip: this.skip,
          take: this.pageSize,
        };
        this.getProjectList(parameters);
        this.utilService.fileProcessResult(true);
      }, 100);
    } else {
      this.utilService.fileProcessResult(true);
    }
  }
  createLine() {
    this.clearAnalyse();
    this.SCENE.SELECTOR.startSelection();
    this.hideShowClearButton();
  }
  disposeScene() {
    window.location.href = '/home';
  }
  hideShowClearButton() {
    this.interval = setInterval(() => {
      if (this.SCENE.SELECTOR.line != null) {
        this.isClear = true;
        clearInterval(this.interval);
      } else {
        this.isClear = false;
      }
    });
  }
  clearLine() {
    this.SCENE.SELECTOR.dispose();
    this.isClear = false;
  }
  analyseModel() {
    if (this.isClear == false) {
      this.warning('Analysis plane must be drawn first');
    } else {
      this.apploading.loadingProcessStart();
      setTimeout(() => {
        this.SCENE.ANALYSER.startAnalyse(this.SCENE.SELECTOR.line, 0.1, 16, 16);
        this.hideShowAnalyseButton();
        if (
          this.SCENE.ANALYSER.results &&
          this.SCENE.ANALYSER.results.length > 0
        ) {
          let outputText = this.SCENE.ANALYSER.results.join('\n');
          let imageData = this.SCENE.getImage();
          let projectAnalysisScoreModel = new ProjectAnalysisScoreModel();
          projectAnalysisScoreModel.data = outputText;
          projectAnalysisScoreModel.imageData = imageData;
          this.projectService.setProjectScoreModel(projectAnalysisScoreModel);
          this.apploading.loadingProcessStop();
          this.dialog.open(AnalysisResultComponent, {
            data: {
              projectScoreId: null,
              projectId: this.projectId,
              projectName: this.projectName,
            },
            panelClass: 'project-analysis-cls',
          });
        }
      }, 300);
    }
  }
  currentViewAnalysis() {
    this.dialog.open(ProcessAnalysisComponent, {
      data: { projectId: this.projectId, projectName: this.projectName },
      panelClass: 'process-cls',
    });
  }
  clearAnalyse() {
    this.SCENE.ANALYSER.dispose();
    clearInterval(this.analysisInterval);
    this.isAnalyse = false;
  }
  hideShowAnalyseButton() {
    this.analysisInterval = setInterval(() => {
      if (this.SCENE.ANALYSER.result != null) {
        this.isAnalyse = true;
        clearInterval(this.analysisInterval);
      } else {
        this.isAnalyse = false;
      }
    });
  }
  resetView() {
    this.SCENE.resetView();
  }
  flipLight() {
    this.SCENE.rotateLight();
  }
  snap() {
    this.SCENE.SELECTOR.enableSnap();
  }
  rotateModel() {
    this.SCENE.ROTATOR.startSelection();
  }
  swapCamera() {
    this.SCENE.swapCamera();
  }
  logout() {
    this.authService.setUserLoggedIn(false);
    localStorage.removeItem('token');
    this.disposeScene();
  }
  myAccount() {
    this.dialog.open(MyAccountComponent, {
      panelClass: 'account',
      width: '500px',
    });
  }
  deleteModel() {
    this.filename = '';
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
  projectAnalysis(item: any) {
    let dialog = this.dialog.open(ProcessAnalysisComponent, {
      data: { projectId: item.id, projectName: item.projectName },
      panelClass: 'process-cls',
    });
    dialog.afterClosed().subscribe((result) => {
      if (result != undefined && result != '') {
        let parameters = {
          skip: this.skip,
          take: this.pageSize,
        };
        this.getProjectList(parameters);
      }
    });
  }
  openProjects() {
    let dialogRef = this.dialog.open(ProjectsComponent, {
      panelClass: 'project-cls',
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result != undefined && result != null) {
        this.projectName = result;
      }
      this.projectService
        .projectNameExists(this.projectName, this.userId)
        .subscribe((result) => {
          if (result.statusCode != 200 || result.message == false) {
            this.disposeScene();
          }
        });
    });
  }
  warning(message: any) {
    this.dialog.open(DialogConfirmComponent, {
      data: {
        title: 'Warning',
        message: message,
        buttonText: 'Ok',
      },
      width: '400px',
      panelClass: 'dialog',
    });
  }
  customPageSetting() {
    this.pageIndex = 1;
    this.pageSize = 7;
    this.pageDifference = this.pageSize - this.pageIndex;
    this.pageEndRange = this.pageIndex * this.pageSize;
  }
  @HostListener('window:beforeunload', ['$event'])
  beforeunloadHandler() {
    if (this.SCENE != null) {
      this.SCENE.dispose();
      this.SCENE = null;
    }
  }
}
