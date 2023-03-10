import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-dialog-confirm',
  templateUrl: './dialog-confirm.component.html',
  styleUrls: ['./dialog-confirm.component.scss']
})
export class DialogConfirmComponent implements OnInit {
  public header:any
  public fName: any;
  public fIndex: any;
  public message:any;
  constructor(private modalRef: MatDialogRef<DialogConfirmComponent>) { debugger}

  ngOnInit() {
    debugger
  let modal=this.modalRef;
   
  }

  confirm() {
    this.modalRef.close(this.fIndex);
  }
  cancel() {
    this.modalRef.close();
  }

}
