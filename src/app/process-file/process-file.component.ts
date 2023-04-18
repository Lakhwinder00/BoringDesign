import {
  Component,
  OnInit,
  ViewChild,
  ElementRef,
  AfterViewInit,
  ViewChildren,
  QueryList,
  Renderer2,
  HostListener,
} from '@angular/core';

import { UtilService } from '../services/util.service';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { MyAccountComponent } from '../my-account/my-account.component';
import { ProjectsComponent } from '../shared/projects/projects.component';
import { DialogConfirmComponent } from '../shared/dialog-confirm/dialog-confirm.component';
import { AuthService } from '../services/auth.service';
import { ProcessAnalysisComponent } from '../shared/process-analysis/process-analysis.component';
import { ProjectService } from '../services/project.service';
import {
  Project,
  ProjectAnalysisScoreModel,
} from '../core/model/project.model';
import { Result } from 'postcss';
import {
  AbstractControl,
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
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
  fileOutput: any;
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
  public NameOfProject: any;
  public ProjectList:any=[];
  public isUpdateProject:boolean=false;
  public projectId:any;
  public count: |any;
  public pageSize: number|any;
  public pageIndex: number|any;
  public pageDifference: number|any;
  public pageEndRange: number|any;
  pageStartRange = 1;
  skip: number = 0;
  fileReset: any;
  submitted = false;
  @ViewChild('fileUploader') fileUploader: ElementRef | any;
  constructor(
    private utilService: UtilService,
    private router: Router,
    public dialog: MatDialog,
    private renderer: Renderer2,
    private host: ElementRef,
    private authService: AuthService,
    private projectService: ProjectService,
  
  ) {
    this.utilService.sendClickEvent(true);
    this.count = 0;
    this.customPageSetting();
  }

  ngOnInit(): void {
    this.isUpdateProject=false;
    let parameters = {
      skip: this.skip,
      take: this.pageSize,
    };
    this.getProjectList(parameters);
    this.authService.isTokenExpire();
    this.loginEmail = localStorage.getItem('userEmail');
   
    this.SCENE = new SceneViewer(window.innerWidth, window.innerHeight);
  }
  
  // call this function reset the file value;
  resetFile() {
    this.fileUploader.nativeElement.value = null;
  }
  updateProject(item:any){
    let UpdateProject= this.dialog.open(NewProjectComponent,{data:item.projectName, width:'500px',panelClass:'new-project-cls'});
    UpdateProject.afterClosed().subscribe((result)=>{
      this.loadProject(result);
    })
    this.projectId=item.id;
  }
  // call this function get the list of project
  getProjectList(parameters:any)
  {
    let token=this.authService.getToken();
    if(token!=null)
    {
      let tokenProp=this.authService.getDecodedAccessToken(token);
      this.projectService.getProjectList(tokenProp.UserId,parameters).subscribe((result)=>{
        this.ProjectList=result;
        this.count=result.count;
      })
    }
  }
  // call this function on recent activity page event
  pageChanged(Event:any): any {
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

  // call this function create the new project
  newproject()
  {
   let CreateNewProject= this.dialog.open(NewProjectComponent,{data:null,width:'500px',panelClass:'new-project-cls'});
   CreateNewProject.afterClosed().subscribe((result)=>{
    this.loadProject(result);
   })
  }
  
  loadProject(result:any)
  {
    if(result!=undefined)
    {
      this.isDisplay=result.isDisplay;
      if(result.projectId!=undefined)
      this.projectId=result.projectId;
      if(this.projectId==null ||this.projectId==undefined)
      {return}
      if(result.isDisplay){
        this.isUpload=false;
      }
        this.SCENE = new SceneViewer(window.innerWidth, window.innerHeight);
        if (this.children.first.nativeElement.children.length != 0) {
          for (
            var i = 0;
            i < this.children.first.nativeElement.children.length;
            i++
          )
            this.renderer.removeChild(
              this.host.nativeElement,
              this.children.first.nativeElement.children[i]
            );
        }
        const container = document.getElementById('main-canvas');
        if (container != null) {
          this.SCENE.add(container);
          this.SCENE.animate();
        }
        this.SCENE.loadModel(result.file);
        this.NameOfProject=result.project
        this.isClear = false;
        clearInterval(this.interval);
        this.isAnalyse = false;
        clearInterval(this.analysisInterval);
        let parameters = {
          skip: this.skip,
          take: this.pageSize,
        };
        this.getProjectList(parameters);
    }
  }
  // call this function create the line//
  createLine() {
    this.SCENE.SELECTOR.startSelection();
    this.hideShowClearButton();
  }
  hideShowClearButton() {
    this.interval = setInterval(() => {
      if (this.SCENE.SELECTOR.createline == true) {
        this.isClear = true;
        clearInterval(this.interval);
      } else {
        this.isClear = false;
      }
    });
  }
  clear() {
    this.SCENE.SELECTOR.dispose();
    this.isClear = false;
    clearInterval(this.interval);
  }
  analyseModel() {
    if (this.isClear == false) {
      this.warning('Plane line must be drawn first before analyse');
    } else {
      this.SCENE.ANALYSER.startAnalyse(this.SCENE.SELECTOR.line, 0.1, 16, 16);
      this.hideShowAnalyseButton();
      if (
        this.SCENE.ANALYSER.results &&
        this.SCENE.ANALYSER.results.length > 0
      ) {
        let outputText = this.SCENE.ANALYSER.results.join('\n');
        let projectAnalysisScoreModel = new ProjectAnalysisScoreModel();
        projectAnalysisScoreModel.data = outputText;
        this.projectService.setProjectScoreModel(projectAnalysisScoreModel);
        this.dialog.open(AnalysisResultComponent,{data:{projectScoreId:null,projectId:this.projectId},panelClass:'project-analysis-cls'})
      }
    }
  }
  clearAnalyse() {
    this.SCENE.ANALYSER.dispose();
    clearInterval(this.analysisInterval);
    this.isAnalyse = false;
  }
  hideShowAnalyseButton() {
    this.analysisInterval = setInterval(() => {
      if (this.SCENE.ANALYSER.analyses == true) {
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
  logout() {
    this.authService.setUserLoggedIn(false);
    localStorage.clear();
    localStorage.removeItem('token');
    this.router.navigate(['/login']);
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
  deleteProject(item:any) {
   let deleteDialog= this.dialog.open(DialogConfirmComponent, {
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
    deleteDialog.afterClosed().subscribe((result)=>{
      if(result==true)
      {
        this.projectService.deleteProjectById(item.id).subscribe((result)=>{
          if(result.statusCode==200)
          {
            this.customPageSetting();
            let parameters = {
              skip: 0,
              take: this.pageSize,
            };
            this.getProjectList(parameters);
          }
        })
      }
    })
  }
  projectAnalysis(item:any) {
   let projectAnalysisDialog= this.dialog.open(ProcessAnalysisComponent, {data:{projectId:item.id,projectName:item.projectName}, panelClass: 'process-cls' });
   projectAnalysisDialog.afterClosed().subscribe((result=>{
    if(result)
    {
      let parameters = {
        skip: this.skip,
        take: this.pageSize,
      };
      this.getProjectList(parameters)
    }
   })
   )
  }
  openProjects() {
   
    let dialogRef = this.dialog.open(ProjectsComponent, {
      panelClass: 'project-cls',
    });
    dialogRef.afterClosed().subscribe((result) => {
      if(result?.file!=undefined &&result?.file!=null)
      {
        this.loadProject(result);
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
      width: '400px',
      panelClass: 'dialog',
    });
  }
  // call this function for default setting pagination
  customPageSetting()
  {
    this.pageIndex = 1;
    this.pageSize = 7;
    this.pageDifference = this.pageSize - this.pageIndex;
    this.pageEndRange = this.pageIndex * this.pageSize;
  }
  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    const container = document.getElementById('main-canvas');
    if (container != null && this.SCENE != undefined) {
      this.SCENE.add(container);
    }
  }
}
