import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './core/guard/auth-guard.service';
import { LoginComponent } from './login/login.component';
import { MyAccountComponent } from './my-account/my-account.component';
import { ProcessFileComponent } from './process-file/process-file.component';
import { RegisterComponent } from './register/register.component';
import { ForgotPasswordComponent } from './forgot-passowrd/forgot-password.component';
import { LayoutComponent } from './shared/layout/layout.component';
import { WelcomePageComponent } from './welcome-page/welcome-page.component';
import { ResetPasswordComponent } from './reset-password/reset-password.component';
import { AboutComponent } from './about/about.component';
import { ContactUsComponent } from './contact-us/contact-us.component';

const routes: Routes = [
  {
    path: '',
    component: LayoutComponent,
    children: [
      { path: '', component: WelcomePageComponent, pathMatch: 'full' },
      { path: 'home', component: WelcomePageComponent },
      { path: 'login', component: LoginComponent },
      { path: 'register', component: RegisterComponent },
      { path: 'forgot-password', component: ForgotPasswordComponent },
      { path: 'activate-account/:id', component: RegisterComponent },
      { path: 'reset-password/:id', component: ResetPasswordComponent },
      { path: 'about', component: AboutComponent },
      { path: 'contact-us', component: ContactUsComponent },
    ],
  },
  {
    path: 'process',
    component: ProcessFileComponent,
    canActivate: [AuthGuard],
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
