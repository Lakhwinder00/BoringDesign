import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { BehaviorSubject } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class UtilService {

  constructor() { }
  private subject = new Subject<void>();
  public isUserLoggedOut: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  sendClickEvent() {
    this.subject.next();
  }
  getClickEvent(): Observable<any>{ 
    return this.subject.asObservable();
  }
}
