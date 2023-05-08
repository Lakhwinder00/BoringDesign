import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { BehaviorSubject } from 'rxjs';
@Injectable({
  providedIn: 'root',
})
export class UtilService {
  constructor() {}
  public data = [];
  private subject = new Subject<any>();
  private fileSubject = new Subject<any>();
  private fileProcessedResult = new Subject<any>();
  analysisScore: any;
  sendClickEvent(param: any) {
    this.subject.next(param);
  }
  getClickEvent(): Observable<any> {
    return this.subject.asObservable();
  }

  sendFileData(fileData: any) {
    this.fileSubject.next(fileData);
  }
  getFileData(): Observable<any> {
    return this.fileSubject.asObservable();
  }
  fileProcessResult(param: any) {
    this.fileProcessedResult.next(param);
  }
  getFileResult(): Observable<any> {
    return this.fileProcessedResult.asObservable();
  }
  IsUserLoggedIn() {
    if (localStorage.getItem('token') != null) {
      return true;
    } else {
      return false;
    }
  }
}
