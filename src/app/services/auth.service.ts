import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private userLoggedIn = new Subject<boolean>();
  constructor() { 
    this.userLoggedIn.next(false);
  }
  setToken(token:any){
    localStorage.setItem('token',token)
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
