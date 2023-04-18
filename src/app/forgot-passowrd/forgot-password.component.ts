import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { RegisterService } from '../services/register.service';
import { DialogConfirmComponent } from '../shared/dialog-confirm/dialog-confirm.component';

@Component({
  selector: 'app-forgot',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss']
})
export class ForgotPasswordComponent implements OnInit {
  submitted=false;
  constructor(private _registerService:RegisterService,private formBuilder: FormBuilder,public dialog:MatDialog,) { }

  ngOnInit(): void {
    this.forgotForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }
  forgotForm: FormGroup = new FormGroup({
    name: new FormControl(''),
    email: new FormControl(''),
    password: new FormControl(''),
  });
  get f(): { [key: string]: AbstractControl } {
    return this.forgotForm.controls;
  }
  onSubmit()
  {
    this.submitted = true;
    if(this.forgotForm.invalid)
    {
      return
    }
    else{
      var email=this.forgotForm.controls['email'].value;
      this._registerService.forgotPassword(email).subscribe((result)=>{
        if(result.statusCode==200)
        {
          this.forgotPasswordDialog();
        }else{
          this.warning('Your account is not exists!')
        }
       
      })
    }
  }
  forgotPasswordDialog()
  {
    this.dialog.open(DialogConfirmComponent,{data:{
      title:"Activate Account",
      message:'An email was sent to forgot password your account.<br> Check your spam folder.',
      buttonText:"Ok"
    },width: '400px',panelClass:'dialog'})
  }
  warning(message:any)
  {
    this.dialog.open(DialogConfirmComponent,{data:{
      title:"Warning",
      message:message,
      buttonText:"Ok"
    },width: '400px',panelClass:'dialog'})
  }
}
