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

//var SceneViewer = require("SceneViewer");
declare function RemoveCanvas(): any;
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
  public interval:any
  public analysisInterval:any;
  public isClear:boolean=false;
  public isAnalyse:boolean=false;
  constructor(
    private utilService: UtilService,
    private router: Router,
    public dialog: MatDialog,
    private renderer: Renderer2,
    private host: ElementRef,
    private authService: AuthService
  ) {
    this.utilService.getClickEvent().subscribe(() => {});
  }

  ngOnInit(): void {
    this.loginEmail = localStorage.getItem('userEmail');
  }
  // User this part for Upload 3d model file
  ShowFile() {
    if (this.filename == '' || this.filename == undefined) {
      this.warning('Please upload .obj file only');
    } else {
      this.isUpload = false;
      this.isDisplay = true;
      this.filename = '';
    }
  }

  uploadedFileName: string = '';

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
  prepareFilesList(file: any) {
    this.isLoadFile = true;
    this.parseObj = null;
    this.filename = file.name;
    let ext = this.filename.split('.');
    if (ext != undefined && ext != null && ext[1] == 'obj') {
      var reader = new FileReader();
      reader.onload = (e: any) => {
        // The file's text will be printed here
        this.parseObj = e.target.result;
        setTimeout(() => {
          this.SCENE = new SceneViewer(window.innerWidth, window.innerHeight);
          if (this.children.first.nativeElement.children.length != 0) {
            if (this.children.first.nativeElement.children.length != 0) {
              for(var i=0;i<this.children.first.nativeElement.children.length;i++) 
              this.renderer.removeChild(this.host.nativeElement, this.children.first.nativeElement.children[i]);
            }
          }
          const container = document.getElementById('main-canvas');
          if (container != null) {
            this.SCENE.add(container);
            this.SCENE.animate();
          }

          this.SCENE.loadModel(this.parseObj);
          this.isLoadFile = false;
        }, 1000);
      };
      reader.readAsText(file);
    }
  }
  createLine() {
    this.SCENE.SELECTOR.startSelection();
    this.hideShowClearButton();
   
  }
  hideShowClearButton()
  {
    this.interval = setInterval(()=>{
      if(this.SCENE.SELECTOR.createline==true)
      {
        this.isClear=true;
        clearInterval(this.interval);
      }else{
        this.isClear=false;
      }
    })
  }
  clear() {
    this.SCENE.SELECTOR.dispose();
    this.isClear=false;
    clearInterval(this.interval);
  }
  analyseModel() {
    this.SCENE.ANALYSER.startAnalyse(this.SCENE.SELECTOR.line, 0.1, 16, 16);
    this.hideShowAnalyseButton()
  }
  clearAnalyse() {
    this.SCENE.ANALYSER.dispose();
    clearInterval(this.analysisInterval);
    this.isAnalyse=false;
  }
  hideShowAnalyseButton()
  {
    this.analysisInterval = setInterval(()=>{
      if(this.SCENE.ANALYSER.analyses==true)
      {
        this.isAnalyse=true;
        clearInterval(this.analysisInterval);
      }else{
        this.isAnalyse=false;
      }
    })
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
    this.dialog.open(MyAccountComponent,{panelClass:'account'});
  }
  deleteModel() {
    this.filename = '';
    // if(this.children.first.nativeElement.children.length!=0)
    // {
    //  this.children.first.nativeElement.children.forEach((element:any) => {
    //    this.renderer.removeChild(this.host.nativeElement, element);
    //  });
    // }
  }
  projectAnalysis()
  {
    this.dialog.open(ProcessAnalysisComponent,{panelClass:'process-cls'});
  }
  openProjects() {
    let dialogRef = this.dialog.open(ProjectsComponent,{panelClass:'project-cls'});
    dialogRef.afterClosed().subscribe((result) => {
      if (result != true && result != undefined) {
        this.SCENE = new SceneViewer(window.innerWidth, window.innerHeight);
        if (this.children.first.nativeElement.children.length != 0) {
          for(var i=0;i<this.children.first.nativeElement.children.length;i++) 
          this.renderer.removeChild(this.host.nativeElement, this.children.first.nativeElement.children[i]);
        }
        const container = document.getElementById('main-canvas');
        if (container != null) {
          this.SCENE.add(container);
          this.SCENE.animate();
        }
        this.SCENE.loadModel(result);
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
      panelClass:'dialog'
    });
  }
  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    const container = document.getElementById('main-canvas');
    if (container != null && this.SCENE != undefined) {
      this.SCENE.add(container);
    }
  }
}
