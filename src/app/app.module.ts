import { NgModule,CUSTOM_ELEMENTS_SCHEMA,NO_ERRORS_SCHEMA } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HeaderComponent } from './shared/header/header.component';
import { FotterComponent } from './shared/fotter/fotter.component';
import { LayoutComponent } from './shared/layout/layout.component';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { ReactiveFormsModule } from '@angular/forms';
import { RegisterService } from './services/register.service';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { JwtInterceptor } from './services/jwt-interceptor.service';
import { AlertService } from './services/alert.service';
import { ToastrModule, ToastrService } from 'ngx-toastr';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { CustomHttpInterceptor, LoaderService } from './services/loader.service';
import { LoaderComponent } from './shared/loader/loader.component';
import { WelcomPageComponent } from './welcom-page/welcom-page.component';
import { UtilService } from './services/util.service';
import { AuthGuard } from './core/guard/auth-guard.service';
import { AuthService } from './services/auth.service';
import { ProcessFileComponent } from './process-file/process-file.component';
import { DropzoneModule, DropzoneConfigInterface, DROPZONE_CONFIG } from 'ngx-dropzone-wrapper';
import {MatGridListModule} from '@angular/material/grid-list';
const DEFAULT_DROPZONE_CONFIG: DropzoneConfigInterface = {
  url: 'https://google.com', // this is due to package issue and should be ignored
  createImageThumbnails: true
};

@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    FotterComponent,
    LayoutComponent,
    LoginComponent,
    RegisterComponent,
    LoaderComponent,
    WelcomPageComponent,
    ProcessFileComponent
  ],
  schemas: [
    CUSTOM_ELEMENTS_SCHEMA,
    NO_ERRORS_SCHEMA
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    ReactiveFormsModule,
    HttpClientModule,
    ToastrModule.forRoot({ timeOut: 5000 }),
    BrowserAnimationsModule,
    DropzoneModule
  ],
  providers: [RegisterService,AuthService,JwtInterceptor,AlertService,ToastrService,LoaderService,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: CustomHttpInterceptor,
      multi: true,
    },
    UtilService,
    AuthGuard,
    {
      provide: DROPZONE_CONFIG,
      useValue: DEFAULT_DROPZONE_CONFIG
    }
  ],
  bootstrap: [AppComponent],
})
export class AppModule { }
