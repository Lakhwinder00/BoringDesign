import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { BehaviorSubject } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class UtilService {

  constructor() { }
  private subject = new Subject<void>();
  
  sendClickEvent() {
    this.subject.next();
  }
  getClickEvent(): Observable<any>{ 
    return this.subject.asObservable();
  }
  IsUserLoggedIn()
  {
    if(localStorage.getItem('token')!=null)
    {
      return true;
    }
    else{
      return false;
    }
  }
}
