import {
  NgModule,
  CUSTOM_ELEMENTS_SCHEMA,
  NO_ERRORS_SCHEMA,
} from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HeaderComponent } from './shared/layout/header/header.component';
import { FooterComponent } from './shared/layout/footer/footer.component';
import { LayoutComponent } from './shared/layout/layout.component';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { ForgotPasswordComponent } from './forgot-passowrd/forgot-password.component';
import { ReactiveFormsModule } from '@angular/forms';
import { RegisterService } from './services/register.service';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { JwtInterceptor } from './services/jwt-interceptor.service';
import { AlertService } from './services/alert.service';
import { ToastrModule, ToastrService } from 'ngx-toastr';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import {
  CustomHttpInterceptor,
  LoaderService,
} from './services/loader.service';
import { LoaderComponent } from './shared/loader/loader.component';
import { WelcomePageComponent } from './welcome-page/welcome-page.component';
import { UtilService } from './services/util.service';
import { AuthGuard } from './core/guard/auth-guard.service';
import { AuthService } from './services/auth.service';
import { ProcessFileComponent } from './process-file/process-file.component';
import { MaterialModule } from './core/modules/material.module';
import { MyAccountComponent } from './my-account/my-account.component';
import { DialogConfirmComponent } from './shared/dialog-confirm/dialog-confirm.component';
import { ProjectsComponent } from './shared/projects/projects.component';
import { NewProjectComponent } from './shared/projects/new-project/new-project.component';
import { FileUploadDirective } from './directives/file-upload.directive';
import { ProcessAnalysisComponent } from './shared/process-analysis/process-analysis.component';
import { AnalysisResultComponent } from './shared/analysis-result/analysis-result.component';
import { ResetPasswordComponent } from './reset-password/reset-password.component';
import { ProjectService } from './services/project.service';
import { PaginationComponent } from './shared/pagination/pagination.component';
import { ImageAnalysisResultComponent } from './shared/image-analysis-result/image-analysis-result.component';
import { CircleLoader, FileuploaderComponent } from './shared/fileuploader/fileuploader.component';
import { AboutComponent } from './about/about.component';
import { ContactUsComponent } from './contact-us/contact-us.component';

@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    FooterComponent,
    LayoutComponent,
    LoginComponent,
    RegisterComponent,
    ForgotPasswordComponent,
    LoaderComponent,
    WelcomePageComponent,
    ProcessFileComponent,
    MyAccountComponent,
    DialogConfirmComponent,
    ProjectsComponent,
    NewProjectComponent,
    FileUploadDirective,
    ProcessAnalysisComponent,
    AnalysisResultComponent,
    ResetPasswordComponent,
    PaginationComponent,
    ImageAnalysisResultComponent,
    FileuploaderComponent,
    AboutComponent,
    ContactUsComponent,
    CircleLoader
  ],
  entryComponents: [DialogConfirmComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
  imports: [
    BrowserModule,
    AppRoutingModule,
    ReactiveFormsModule,
    HttpClientModule,
    ToastrModule.forRoot({ timeOut: 5000 }),
    BrowserAnimationsModule,
    MaterialModule,
  ],
  providers: [
    RegisterService,
    AuthService,
    JwtInterceptor,
    AlertService,
    ToastrService,
    LoaderService,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: CustomHttpInterceptor,
      multi: true,
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: JwtInterceptor,
      multi: true,
    },
    UtilService,
    ProjectService,
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
