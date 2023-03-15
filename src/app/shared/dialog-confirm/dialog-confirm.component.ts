import { Component, OnInit,Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-dialog-confirm',
  templateUrl: './dialog-confirm.component.html',
  styleUrls: ['./dialog-confirm.component.scss']
})
export class DialogConfirmComponent  {
  message:any;
  title:any;
  ButtonText:any;
  constructor(
     @Inject(MAT_DIALOG_DATA)private data: any,private modalRef: MatDialogRef<DialogConfirmComponent>) {
     this.message=data.message;
     this.title=data.title;
     this.ButtonText=data.buttonText;
    }
  onConfirmClick() {
    this.modalRef.close(true);
  }
}
