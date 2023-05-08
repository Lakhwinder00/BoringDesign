import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-dialog-confirm',
  templateUrl: './dialog-confirm.component.html',
  styleUrls: ['./dialog-confirm.component.scss'],
})
export class DialogConfirmComponent {
  message: any;
  title: any;
  ButtonText: any;
  isShow: boolean = false;
  ButtonYesText: any;
  constructor(
    @Inject(MAT_DIALOG_DATA) private data: any,
    private modalRef: MatDialogRef<DialogConfirmComponent>
  ) {
    this.message = data.message;
    this.title = data.title;
    this.ButtonText = data.buttonText;
    this.ButtonYesText = data.buttonYesText;
    this.isShow =
      data.isShow == undefined || data.isShow == null ? false : data.isShow;
  }
  onConfirmClick(event: boolean) {
    this.modalRef.close(event);
  }
}
