import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor() { }
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
  logout()
  {
    localStorage.clear();
    localStorage.removeItem("token");
  }

}
