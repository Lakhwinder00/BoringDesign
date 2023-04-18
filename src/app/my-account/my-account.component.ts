import { Component, OnInit,Inject } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Result } from 'postcss';
import { LoginModel, UpdateEmailModel } from '../core/model/login.model';
import { RegisterService } from '../services/register.service';
import { DialogConfirmComponent } from '../shared/dialog-confirm/dialog-confirm.component';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-my-account',
  templateUrl: './my-account.component.html',
  styleUrls: ['./my-account.component.scss']
})
export class MyAccountComponent implements OnInit {
  submitted = false;
  updateEmailSubmitted=false;
  isComparePassword:boolean=false;
  loginModel: LoginModel | any;
  updateEmailModel:UpdateEmailModel|any;
  constructor(private formBuilder: FormBuilder,
    @Inject(MAT_DIALOG_DATA)private data: any,
    private modalRef: MatDialogRef<MyAccountComponent>,
    private authService:AuthService,
    public dialog:MatDialog,
    private _registerService: RegisterService,
    private router:Router
    ) { }

  ngOnInit(): void {
    
    let token=this.authService.getToken();
    if(token)
    {
      let tokenProp=this.authService.getDecodedAccessToken(token);
      this.updateEmailForm=this.formBuilder.group({
        email: [tokenProp.UserName, [Validators.required, Validators.email]],
      })
    }
    this.updatePasswordForm = this.formBuilder.group({
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', [Validators.required, Validators.minLength(8)]],
    });
    setTimeout(()=>{
      this.updatePasswordForm.reset();
      this.isComparePassword=false;
    },1000)
    
  }
  // call this function for check the validations
  get f(): { [key: string]: AbstractControl } {
    return this.updatePasswordForm.controls;
  }
  // use for update update password form validations
  updatePasswordForm: FormGroup = new FormGroup({
    password: new FormControl(''),
    confirmPassword: new FormControl(''),
  });

  get u(): { [key: string]: AbstractControl } {
    return this.updateEmailForm.controls;
  }
  // use for update email validation//
  updateEmailForm:FormGroup=new FormGroup({
    email:new FormControl('')
  })
  
  //use this function compare the password//
  comparePassword(event:any)
  {
    if(event.target.value!=this.updatePasswordForm.controls['password'].value)
    {
      this.isComparePassword=true;
    }else{
      this.isComparePassword=false;
    }
  }
  closeDialog()
  {
    this.modalRef.close(true);
  }
  // call this function update the email if exist in database and recent account disabled.
  updateEmail()
  {
    this.updateEmailSubmitted=true;
    if(this.updateEmailForm.invalid)
    {
      return;
    }
    else{
      let properties={oldEmail:localStorage.getItem('userEmail'),newEmail:this.updateEmailForm.controls['email'].value}
      this.updateEmailModel=properties;
      this._registerService.updateEmail(this.updateEmailModel).subscribe((result)=>{
        if(result.statusCode==200)
        {
          this.updateEmailSubmitted=false;
          this.updateEmailForm.reset();
          this.dialog.open(DialogConfirmComponent,{data:{
            title:"Email Updated",
            message:'An email was sent to activate your account.<br> Check your spam folder.',
            buttonText:"Ok",
          },width: '400px',panelClass:'dialog'})
        }else if(result[0]?.message==undefined){
          this.dialog.open(DialogConfirmComponent,{data:{
            title:"Account Exists",
            message:'Email already exists!<br> Please enter an another email for register the account.',
            buttonText:"Ok",
          },width: '400px',panelClass:'dialog'})
        }else{this.warning(result[0]?.message);}
      })
    }
    
  }
  
  // call this function update the password
  updatePassword()
  {
    this.submitted = true;
    if (this.updatePasswordForm.invalid || this.isComparePassword) {
      return;
    }
    else{
      let properties={password:this.updatePasswordForm.controls['password'].value,email:localStorage.getItem('userEmail')}
      this.loginModel=properties;
      this._registerService.updatePassword(this.loginModel).subscribe((result)=>{
        if(result.statusCode==200)
        {
          this.dialog.open(DialogConfirmComponent,{data:{
            title:"Password Updated",
            message:'You can use new password next time you login',
            buttonText:"Ok",
          
          },width: '400px',panelClass:'dialog'})
          this.submitted = false;
          this.updatePasswordForm.reset();
        }else{this.warning(result[0]?.message);}
      })
    }
  }
  // call this function delete the inactivate account 
  deleteAccount()
  {
    
   let modalDialogRef= this.dialog.open(DialogConfirmComponent,{data: {
      title: 'Delete Project',
      message: "Are you sure you want delete your account? <br> This action cannot be undone.",
      buttonText: 'No',
      buttonYesText:'Yes',
      isShow:true
    },
    width:"400px",
    panelClass:'dialog'})
    modalDialogRef.afterClosed().subscribe(((result)=>{
     if(result)
     {
      let token=this.authService.getToken();
      if(token!=null)
      {
        let tokenProp=this.authService.getDecodedAccessToken(token);
        this._registerService.deleteAccount(tokenProp.UserId).subscribe((result)=>{
         if(result.statusCode==200)
         {
          this.dialog.closeAll();
          localStorage.clear();
          this.router.navigate(['/register'])
         }else if (result[0]?.message) {
          this.warning(result[0]?.message);
        }
        })
      }
     }
    }))
  }
  warning(message:any)
  {
    this.dialog.open(DialogConfirmComponent,{data:{
      title:"Warning",
      message:message,
      buttonText:"Ok",
    
    },width: '400px',panelClass:'dialog'})
  }
}
