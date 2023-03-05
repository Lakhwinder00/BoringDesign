import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, map, Observable, of } from 'rxjs';
import { BaseUrl } from '../core/constants/BaseUrl';
import { httpOptions } from '../core/constants/httpHeaders';
import { LoginModel } from '../core/model/login.model';
import { RegisterModel } from '../core/model/register.model';

@Injectable({
  providedIn: 'root'
})
export class RegisterService {

  constructor(private http: HttpClient,) { }
  public registerUser(parameters: RegisterModel): Observable<any> {
    var requestBody = JSON.stringify(parameters);
    return this.http.post(`${BaseUrl.url}api/Register`, requestBody, httpOptions).pipe(
      map((response: any) =>
        response,
      ),
      catchError(err => {
        console.log(err);
        return of([err]);
      })
    );
  }
  public ActivateUserAccount(Code: string): Observable<any> {
    return this.http.post(`${BaseUrl.url}api/ActivateAccount?Code=${Code}`, httpOptions).pipe(
      map((response: any) =>
        response,
      ),
      catchError(err => {
        console.log(err);
        return of([err]);
      })
    );
  }
  public loginUser(parameters: LoginModel): Observable<any> {
    var requestBody = JSON.stringify(parameters);
    return this.http.post(`${BaseUrl.url}api/login`, requestBody, httpOptions).pipe(
      map((response: any) =>
        response,
      ),
      catchError(err => {
        console.log(err);
        return of([err]);
      })
    );
  }
}
