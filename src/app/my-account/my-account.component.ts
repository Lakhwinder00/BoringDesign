import { Component, OnInit,Inject } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DialogConfirmComponent } from '../shared/dialog-confirm/dialog-confirm.component';

@Component({
  selector: 'app-my-account',
  templateUrl: './my-account.component.html',
  styleUrls: ['./my-account.component.scss']
})
export class MyAccountComponent implements OnInit {

  constructor(@Inject(MAT_DIALOG_DATA)private data: any,private modalRef: MatDialogRef<MyAccountComponent>,public dialog:MatDialog,) { }

  ngOnInit(): void {
  }
  closeDialog()
  {
    this.modalRef.close(true);
  }
  // call this function update the email if exist in database and recent account disabled.
  updateEmail()
  {
    this.dialog.open(DialogConfirmComponent,{data:{
      title:"Email Updated",
      message:'An email was sent to activate your account.<br> Check your spam folder.',
      buttonText:"Ok",
    
    },width: '400px',panelClass:'dialog'})
    return false
  }
  
  // call this function reset the password
  updatePassword()
  {
    this.dialog.open(DialogConfirmComponent,{data:{
      title:"Password Updated",
      message:'You can use new password next time you login',
      buttonText:"Ok",
    
    },width: '400px',panelClass:'dialog'})
    return false
  }
  // call this function delete the inactivate account 
  deleteAccount()
  {

  }
}
