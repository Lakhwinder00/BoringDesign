import { Component, OnInit } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { RegisterService } from '../services/register.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ResetPasswordModel } from '../core/model/login.model';
import { MatDialog } from '@angular/material/dialog';
import { DialogConfirmComponent } from '../shared/dialog-confirm/dialog-confirm.component';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.scss'],
})
export class ResetPasswordComponent implements OnInit {
  submitted = false;
  isComparePassword: boolean = false;
  resetPasswordModel: ResetPasswordModel | any;
  constructor(
    private formBuilder: FormBuilder,
    private _resgisterService: RegisterService,
    private route: ActivatedRoute,
    private router:Router,
    public dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.resetPasswordForm = this.formBuilder.group({
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', [Validators.required, Validators.minLength(8)]],
    });
  }
  // use for update update password form validations
  resetPasswordForm: FormGroup = new FormGroup({
    password: new FormControl(''),
    confirmPassword: new FormControl(''),
  });

  get f(): { [key: string]: AbstractControl } {
    return this.resetPasswordForm.controls;
  }
  //use this function compare the password//
  comparePassword(event: any) {
    if (
      event.target.value != this.resetPasswordForm.controls['password'].value
    ) {
      this.isComparePassword = true;
    } else {
      this.isComparePassword = false;
    }
  }
  onSubmit() {
    this.submitted = true;
    if (this.resetPasswordForm.invalid) {
      return;
    } else {
      this.route.paramMap.subscribe((params: any) => {
        let parameters = {
          code: params.get('id'),
          password: this.resetPasswordForm.controls['password'].value,
        };
        this.resetPasswordModel = parameters;
        this._resgisterService
          .resetPassword(this.resetPasswordModel)
          .subscribe((result) => {
            if (result.statusCode == 200) {
              this.alertDialog();
              this.router.navigate(['/login']);
            } else if (result[0]?.message) {
              this.warning(result[0]?.message);
            }
          });
      });
    }
  }
  alertDialog() {
    this.dialog.open(DialogConfirmComponent, {
      data: {
        title: 'Reset Password',
        message:
          'Your password is updated successfully.<br>Please you can login with new password',
        buttonText: 'Ok',
      },
      width: '400px',
      panelClass: 'dialog',
    });
  }
  warning(message: any) {
    this.dialog.open(DialogConfirmComponent, {
      data: {
        title: 'Warning',
        message: message,
        buttonText: 'Ok',
      },
      width: '400px',
      panelClass: 'dialog',
    });
  }
}
