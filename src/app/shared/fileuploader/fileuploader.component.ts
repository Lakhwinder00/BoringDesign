import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-fileuploader',
  template: `<div class="loading" *ngIf="isloading"></div>`,
  styleUrls: ['./fileuploader.component.scss'],
})
export class FileuploaderComponent implements OnInit {
  isloading: boolean = false;
  constructor() {}
  ngOnInit(): void {}
  loadingProcessStart() {
    this.isloading = true;
  }
  loadingProcessStop() {
    this.isloading = false;
  }
}

@Component({
  selector:'app-circle',
  template: `<div class="circle" *ngIf="iscircle"></div>`,
  styleUrls: ['./fileuploader.component.scss'],
})
export class CircleLoader implements OnInit{
  iscircle:boolean=false;
  constructor(){}
  ngOnInit(): void {
}
  loadingProcessStart() {
    this.iscircle = true;
  }
  loadingProcessStop() {
    this.iscircle = false;
  }
}
