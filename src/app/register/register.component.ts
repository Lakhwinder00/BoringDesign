import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { RegisterModel } from '../core/model/register.model';
import { RegisterService } from '../services/register.service';
import { UtilService } from '../services/util.service';
import { DialogConfirmComponent } from '../shared/dialog-confirm/dialog-confirm.component';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit {
  submitted = false;
  registerModel: RegisterModel | any

  constructor(private formBuilder: FormBuilder, private _registerService: RegisterService,
     private toasterService: ToastrService,
     private readonly route: ActivatedRoute,
     private readonly router: Router,
     public dialog:MatDialog,
     private utilServices: UtilService,
     ) {
      let isLogged = this.utilServices.IsUserLoggedIn();
    if (isLogged) {
      this.router.navigate(['/process'])
    }
      this.ActivateAccount();
   }


  get f(): { [key: string]: AbstractControl } {
    return this.registerform.controls;
  }
  registerform: FormGroup = new FormGroup({
    name: new FormControl(''),
    email: new FormControl(''),
    password: new FormControl('')
  });

  ngOnInit(): void {
    this.registerform = this.formBuilder.group(
      {
        name: [
          '',
          [
            Validators.required,
            Validators.maxLength(100),
          ],
        ],
        email: ['', [Validators.required, Validators.email]],
        password: [
          '',
          [
            Validators.required,
            Validators.minLength(8)
          ],
        ]
      }
    );

  }
  ActivateAccount()
  {
    this.route.paramMap.subscribe((params:any) => {
     let activateCode=params.get('id');
     if(activateCode!=undefined && activateCode!=null)
     {
      this._registerService.ActivateUserAccount(activateCode).subscribe(result => {
        if(result.message!=undefined && result.message!='')
        {
          this.toasterService.success(result.message);
        }else if(result[0]?.message)
        {
          this.toasterService.warning(result[0]?.message);
        }
     })
     }});
  }
  onSubmit() {
    this.submitted = true;
    if (this.registerform.invalid) {
      return;
    }
    this.registerModel = this.registerform.value;
    this._registerService.registerUser(this.registerModel).subscribe(result => {
      if(result.message!=undefined && result.message!='')
      {
        this.registartionDialog(result.message);
      }else if(result[0]?.message)
      {
        this.toasterService.warning(result[0]?.message);
      }
    })
  }
  registartionDialog(registerMessage:any)
  {
    this.dialog.open(DialogConfirmComponent,{data:{
      title:"Registration Complete",
      message:registerMessage,
      buttonText:"Ok"
    }})
  }
}

