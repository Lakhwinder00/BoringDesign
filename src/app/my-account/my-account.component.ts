import { Component, OnInit,Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-my-account',
  templateUrl: './my-account.component.html',
  styleUrls: ['./my-account.component.scss']
})
export class MyAccountComponent implements OnInit {

  constructor(@Inject(MAT_DIALOG_DATA)private data: any,private modalRef: MatDialogRef<MyAccountComponent>) { }

  ngOnInit(): void {
  }
  closeDialog()
  {
    this.modalRef.close(true);
  }
  // call this function update the email if exist in database and recent account disabled.
  updateEmail()
  {

  }
  
  // call this function reset the password
  updatePassword()
  {

  }
  // call this function delete the inactivate account 
  deleteAccount()
  {

  }
}
