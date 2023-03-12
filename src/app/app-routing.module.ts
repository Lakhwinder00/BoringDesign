import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './core/guard/auth-guard.service';
import { LoginComponent } from './login/login.component';
import { MyAccountComponent } from './my-account/my-account.component';
import { ProcessFileComponent } from './process-file/process-file.component';
import { RegisterComponent } from './register/register.component';
import { ForgotPasswordComponent } from './forgot-passowrd/forgot-password.component';
import { LayoutComponent } from './shared/layout/layout.component';
import { WelcomPageComponent } from './welcom-page/welcom-page.component';

const routes: Routes = [
  {
    path:'', component:LayoutComponent,
  children: [ 
    { path: '', component: WelcomPageComponent, pathMatch: 'full' },
    { path: 'welcome-boring-O-Meter', component: WelcomPageComponent},
    { path: 'login', component: LoginComponent },
    { path: 'register', component: RegisterComponent },
    { path: 'forgot-password', component: ForgotPasswordComponent },
    { path: 'activate-account/:id', component: RegisterComponent },
    
]
  },
  { path: 'process', component: ProcessFileComponent, canActivate: [AuthGuard] },
  { path: 'my-account', component: MyAccountComponent, canActivate: [AuthGuard] }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
