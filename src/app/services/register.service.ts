import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, map, Observable, of } from 'rxjs';
import { BaseUrl } from '../core/constants/BaseUrl';
import { httpOptions } from '../core/constants/httpHeaders';
import {
  LoginModel,
  ResetPasswordModel,
  UpdateEmailModel,
} from '../core/model/login.model';
import { RegisterModel } from '../core/model/register.model';

@Injectable({
  providedIn: 'root',
})
export class RegisterService {
  constructor(private http: HttpClient) {}
  public registerUser(parameters: RegisterModel): Observable<any> {
    var requestBody = JSON.stringify(parameters);
    return this.http.post(`${BaseUrl.url}api/Register`, requestBody).pipe(
      map((response: any) => response),
      catchError((err) => {
        console.log(err);
        return of([err]);
      })
    );
  }
  public ActivateUserAccount(Code: string): Observable<any> {
    return this.http
      .post(`${BaseUrl.url}api/ActivateAccount?Code=${Code}`, null)
      .pipe(
        map((response: any) => response),
        catchError((err) => {
          console.log(err);
          return of([err]);
        })
      );
  }
  public loginUser(parameters: LoginModel): Observable<any> {
    var requestBody = JSON.stringify(parameters);
    return this.http.post(`${BaseUrl.url}api/login`, requestBody).pipe(
      map((response: any) => response),
      catchError((err) => {
        console.log(err);
        return of([err]);
      })
    );
  }
  public updatePassword(parameters: LoginModel): Observable<any> {
    var requestBody = JSON.stringify(parameters);
    return this.http.put(`${BaseUrl.url}api/UpdatePassword`, requestBody).pipe(
      map((response: any) => response),
      catchError((err) => {
        console.log(err);
        return of([err]);
      })
    );
  }
  public updateEmail(parameters: UpdateEmailModel): Observable<any> {
    var requestBody = JSON.stringify(parameters);
    return this.http.put(`${BaseUrl.url}api/UpdateEmail`, requestBody).pipe(
      map((response: any) => response),
      catchError((err) => {
        console.log(err);
        return of([err]);
      })
    );
  }

  public forgotPassword(parameters: any): Observable<any> {
    var requestBody = JSON.stringify(parameters);
    return this.http.post(`${BaseUrl.url}api/ForgotPassword`, requestBody).pipe(
      map((response: any) => response),
      catchError((err) => {
        console.log(err);
        return of([err]);
      })
    );
  }
  public resetPassword(parameters: ResetPasswordModel): Observable<any> {
    var requestBody = JSON.stringify(parameters);
    return this.http.post(`${BaseUrl.url}api/ResetPassword`, requestBody).pipe(
      map((response: any) => response),
      catchError((err) => {
        console.log(err);
        return of([err]);
      })
    );
  }
  public deleteAccount(parameters: any): Observable<any> {
    return this.http
      .delete(`${BaseUrl.url}api/DeleteUserAccount/${parameters}`)
      .pipe(
        map((response: any) => response),
        catchError((err) => {
          console.log(err);
          return of([err]);
        })
      );
  }
}
