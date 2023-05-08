import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, Subject } from 'rxjs';
import jwt_decode from 'jwt-decode';
import { MatDialog } from '@angular/material/dialog';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private userLoggedIn = new Subject<boolean>();
  constructor(private router: Router, public dialog: MatDialog) {
    this.userLoggedIn.next(false);
  }
  setToken(token: any) {
    localStorage.setItem('token', token);
  }
  isTokenExpired() {
    let token = localStorage.getItem('token');
    if (token != null) {
      let tokenProp = this.getDecodedAccessToken(token);
      const expiry = tokenProp.exp;
      if (expiry * 1000 < Date.now()) {
        localStorage.clear();
        this.router.navigate(['/login']);
      }
    }
  }
  getDecodedAccessToken(token: string): any {
    try {
      return jwt_decode(token);
    } catch (Error) {
      return null;
    }
  }
  setEmail(email: any) {
    localStorage.setItem('userEmail', email);
  }
  loggedIn() {
    return !!localStorage.getItem('token');
  }

  getToken() {
    return localStorage.getItem('token');
  }
  setUserLoggedIn(userLoggedIn: boolean) {
    this.userLoggedIn.next(userLoggedIn);
  }
  getUserLoggedIn(): Observable<boolean> {
    return this.userLoggedIn.asObservable();
  }
  logout() {
    localStorage.clear();
    localStorage.removeItem('token');
    this.dialog.closeAll();
    this.router.navigate(['/login']);
  }
}
