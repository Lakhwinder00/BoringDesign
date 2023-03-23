import { Component, OnInit,Inject } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DropzoneConfigInterface } from 'ngx-dropzone-wrapper';
import { DialogConfirmComponent } from '../../dialog-confirm/dialog-confirm.component';
import { ProjectsComponent } from '../projects.component';
const {SceneViewer}=require('../../../../assets/js/scene.js')
@Component({
  selector: 'app-new-project',
  templateUrl: './new-project.component.html',
  styleUrls: ['./new-project.component.scss']
})
export class NewProjectComponent implements OnInit {
  public filename: any;
  public isLoadFile: boolean = false;
  public files: any;
  public parseObj: any;
  public SCENE:any;

  constructor(@Inject(MAT_DIALOG_DATA)private data: any,private modalRef: MatDialogRef<ProjectsComponent>, public dialog: MatDialog) {
    this.filename = '' 
  }

  ngOnInit(): void {
    
  }
  
// User this part for Upload 3d model file
CreateFile() {
  if (this.filename == '' || this.filename == undefined) {
    this.warning('Please upload .obj file only');
  } else {
    this.filename = '';
    this.modalRef.close(this.parseObj);
  }
}
/**
   * handle file from browsing
   */
fileBrowseHandler(file:any) {
  this.prepareFilesList(file.target.files[0]);
}
  onFileDropped(file:any) {
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
  let ext=this.filename.split(".");
  if(ext!=undefined && ext!=null && ext[1]=="obj")
  {
    this.isLoadFile=true;
    var reader = new FileReader();
    reader.onload = (e: any) => {
      // The file's text will be printed here
      this.parseObj = e.target.result;
      this.isLoadFile=false;
    };
    reader.readAsText(file);
  }
}
deleteModel()
  {
    this.filename='';
  }
warning(message:any)
{
  this.dialog.open(DialogConfirmComponent,{data:{
    title:"Warning",
    message:message,
    buttonText:"Ok"
  },panelClass:'dialog'})
}
cancelCreate()
{
  this.dialog.closeAll();
  this.dialog.open(ProjectsComponent,{panelClass:'project-cls'});
}
}
