import { Component, OnInit } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { LoginModel } from '../core/model/login.model';
import { AuthService } from '../services/auth.service';
import { RegisterService } from '../services/register.service';
import { UtilService } from '../services/util.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit {
  submitted = false;
  loginModel: LoginModel | any;
  constructor(
    private formBuilder: FormBuilder,
    private _registerService: RegisterService,
    private toasterService: ToastrService,
    private router: Router,
    private utilServices: UtilService,
    private authService: AuthService
  ) {
    let isLogged = this.utilServices.IsUserLoggedIn();
    if (isLogged) {
      this.router.navigate(['/process'])
    }
  }

  ngOnInit(): void {
    this.loginform = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
    });
  }
  get f(): { [key: string]: AbstractControl } {
    return this.loginform.controls;
  }
  loginform: FormGroup = new FormGroup({
    name: new FormControl(''),
    email: new FormControl(''),
    password: new FormControl(''),
  });

  // call this function for login the user
  onSubmit() {
    this.submitted = true;
    this.loginModel = this.loginform.value;
    if (this.loginform.invalid) {
      return;
    }
    this._registerService.loginUser(this.loginModel).subscribe((result) => {
      if (result.message != undefined && result.message != '') {
        if (result.message == 'Email and password is invalid') {
          this.toasterService.error(result.message);
        } else {
          if (result.token) {
            this.authService.setToken(result.token);
            this.authService.setEmail(result.email);
            this.utilServices.sendClickEvent();
          }
          this.toasterService.success(result.message);
          this.router.navigate(['/process']);
        }
      } else if (result[0]?.message) {
        this.toasterService.warning(result[0]?.message);
      }
    });
  }
}
