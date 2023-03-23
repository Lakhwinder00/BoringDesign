import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private userLoggedIn = new Subject<boolean>();
  constructor(private router:Router) { 
    this.userLoggedIn.next(false);
  }
  setToken(token:any){
    localStorage.setItem('token',token)
  }
  isTokenExpire()
  {
    let token= localStorage.getItem('token')
    if(token !=null)
    {
      const expiry = (JSON.parse(atob(token.split('.')[1]))).exp;
      if(expiry * 1000 < Date.now())
      {
        localStorage.clear();
        this.router.navigate(['/login']);
      }
    }
    
  }
  setEmail(email:any)
  {
    localStorage.setItem('userEmail',email);
  }
  loggedIn(){
    return !!localStorage.getItem('token');
  }

  getToken(){
    return localStorage.getItem('token');
  }
  setUserLoggedIn(userLoggedIn: boolean) {
    this.userLoggedIn.next(userLoggedIn);
  }
  getUserLoggedIn(): Observable<boolean> {
    return this.userLoggedIn.asObservable();
  }
  logout()
  {
    localStorage.clear();
    localStorage.removeItem("token");
  }
}
