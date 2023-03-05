import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './core/guard/auth-guard.service';
import { LoginComponent } from './login/login.component';
import { ProcessFileComponent } from './process-file/process-file.component';
import { RegisterComponent } from './register/register.component';
import { LayoutComponent } from './shared/layout/layout.component';
import { WelcomPageComponent } from './welcom-page/welcom-page.component';

const routes: Routes = [
  {
    path:'',component:LayoutComponent,
  children: [ 
    { path: '', component: LoginComponent, pathMatch: 'full' },
    { path: 'login', component: LoginComponent },
    { path: 'register', component: RegisterComponent },
    { path: 'activate-account/:id', component: RegisterComponent },
    { path: 'process', component: ProcessFileComponent,canActivate:[AuthGuard] },
    { path: 'welcome-boring-O-Meter', component: WelcomPageComponent,canActivate:[AuthGuard] }
]
}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
