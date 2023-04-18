import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { BehaviorSubject } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class UtilService {

  constructor() { }
  private subject = new Subject<void>();
  analysisScore:any;
  sendClickEvent(param:any) {
    this.subject.next(param);
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
