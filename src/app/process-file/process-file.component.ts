import {
  Component,
  OnInit,
  ViewChild,
  ElementRef,
  AfterViewInit,
} from '@angular/core';

import { DropzoneConfigInterface } from 'ngx-dropzone-wrapper';
import { ToastrService } from 'ngx-toastr';
import { UtilService } from '../services/util.service';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { MyAccountComponent } from '../my-account/my-account.component';
import { ProjectsComponent } from '../shared/projects/projects.component';
//var SceneViewer = require("SceneViewer");
// declare const require: any;
const {SceneViewer}=require('../../assets/js/scene.js')
@Component({
  selector: 'app-process-file',
  templateUrl: './process-file.component.html',
  styleUrls: ['./process-file.component.scss'],
})
export class ProcessFileComponent implements OnInit{
  fileOutput: any;
  public parseObj: any;
  public files: any;
  public isDisplay: boolean = false;
  public isUpload: boolean = true;
  public filename: any;
  public isLoadFile: boolean = false;
  public isLogOut: boolean = false;
  public loginEmail: any = '';
  public SCENE:any;
  constructor(
    private toasterService: ToastrService,
    private utilService: UtilService,
    private router: Router,
    public dialog: MatDialog
  ) {
    this.utilService.getClickEvent().subscribe(() => {
      
   
    });
  }
ngOnInit(): void {
  this.loginEmail=localStorage.getItem('userEmail');
 
}
  // User this part for Upload 3d model file
  ShowFile() {
    if (this.filename == '' || this.filename == undefined) {
      this.toasterService.error('Please upload .obj file only');
    } else {
      this.isUpload = false;
      this.isDisplay = true;
      this.filename = '';
    }
  }
 
  public config: DropzoneConfigInterface = {
    autoProcessQueue: false,
    clickable: true,
    //acceptedFiles: 'image/*',
    previewTemplate: '<div style="display:none"></div>',
    uploadMultiple: false,
    dictDefaultMessage: '',
    maxFiles: 1,
  };
  uploadedFileName: string = '';

  public onUploadError(args: any): void {
    console.log('onUploadError:', args);
  }

  public onUploadSuccess(args: any): void {
    console.log('onUploadSuccess:', args);
  }

  // call this function uplad the files
  fileAdded(file: File): void {
    this.parseObj = null;
    this.filename = file.name;
    let ext=this.filename.split(".");
    if(ext!=undefined && ext!=null && ext[1]=="obj")
    {
      this.isLoadFile=true;
      var reader = new FileReader();
      reader.onload = (e: any) => {
        // The file's text will be printed here
        this.parseObj = e.target.result;
        setTimeout(()=>{ 
         this.SCENE=new SceneViewer(screen.width,screen.height);
        const container = document.getElementById('main-canvas');
        if(container!=null)
        {
          this.SCENE.add(container);
          this.SCENE.animate();
        }
        this.SCENE.loadModel(this.parseObj)
          this.isLoadFile=false;
        },1000)
      };
      reader.readAsText(file);
    }
  }
  createLine()
  {
    this.SCENE.SELECTOR.startSelection();
  }
  clear()
  {
    this.SCENE.SELECTOR.clearSelection();
  }
  analyseModel()
  {
    this.SCENE.ANALYSER.startAnalyse(this.SCENE.SELECTOR.line, 0.1, 16, 16);
  }
  clearAnalyse()
  {
    this.SCENE.ANALYSER.clearAnalyse();
  }
  resetView()
  {
    this.SCENE.resetView();
  }
  flipLight()
  {
    this.SCENE.rotateLight();
  }
  logout()
  {
    localStorage.clear();
    localStorage.removeItem('token');
  }
  myAccount() {
    this.dialog.open(MyAccountComponent);
  }
  openProjects() {
    this.dialog.open(ProjectsComponent);
  }
}
