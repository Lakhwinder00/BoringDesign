import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor } from '@angular/common/http';
import { catchError, Observable, throwError } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable()
export class JwtInterceptor implements HttpInterceptor {
  constructor(private authService:AuthService){}
  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // add authorization header with jwt token if available
    let getuser = localStorage.getItem('token');
    if (getuser != null) {
      let currentUser = JSON.parse(getuser);
      if (currentUser && currentUser.token) {
        request = request.clone({
          setHeaders: {
            Authorization: `Bearer ${currentUser.token}`
          }
        });
      }
    }
     return next.handle(request).pipe(
      catchError((errordata =>{
      if(errordata.status===401)
      {
       this.authService.logout();
      }
      return throwError(errordata);
     })))
  }
}
